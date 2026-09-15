const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const pty = require('node-pty');
const os = require('os');

let ptyProcess = null;
let shouldRestoreSession = false;

let mainWindow;

const STATE_PATH = path.join(app.getPath('userData'), 'workspace-state.json');

function injectShellTheme() {
    const platform = os.platform();
    const home = os.homedir();

    const zshBlock = `
        # Jawva terminal theme
        PROMPT='%F{#e8748a}%n@%m%f %F{#f48771}%~%f %F{#cba6f7}❯%f '
        zle_highlight=(default:fg=#9a9a9a)
        preexec() { echo -ne '\\e[38;2;245;194;231m'; }
        precmd()  { echo -ne '\\e[0m'; }
    `;

    const bashBlock = `
        # Jawva terminal theme
        PS1='\\[\\e[38;2;232;116;138m\\]\\u@\\h\\[\\e[0m\\] \\[\\e[38;2;244;135;113m\\]\\w\\[\\e[0m\\] \\[\\e[38;2;203;166;247m\\]❯\\[\\e[0m\\] '
        PROMPT_COMMAND='echo -ne "\\e[38;2;245;194;231m"'
    `;

    const psBlock = `
        # Jawva terminal theme
        function global:prompt {
            Write-Host "$env:USERNAME@$env:COMPUTERNAME" -NoNewline -ForegroundColor Magenta
            Write-Host " $PWD" -NoNewline -ForegroundColor Red
            Write-Host " ❯" -NoNewline -ForegroundColor DarkMagenta
            Write-Host " " -NoNewline
            return " "
        }
    `;

    const marker = '# Jawva terminal theme';

    if (platform === 'darwin' || platform === 'linux') {
        // Try zsh first, then bash
        const zshrc  = path.join(home, '.zshrc');
        const bashrc = path.join(home, '.bashrc');

        if (fs.existsSync(zshrc) || platform === 'darwin') {
            const current = fs.existsSync(zshrc) ? fs.readFileSync(zshrc, 'utf-8') : '';
            if (!current.includes(marker)) {
                fs.appendFileSync(zshrc, zshBlock);
            }
        } else {
            const current = fs.existsSync(bashrc) ? fs.readFileSync(bashrc, 'utf-8') : '';
            if (!current.includes(marker)) {
                fs.appendFileSync(bashrc, bashBlock);
            }
        }
    } else if (platform === 'win32') {
        // PowerShell profile
        const psProfile = path.join(home, 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1');
        fs.mkdirSync(path.dirname(psProfile), { recursive: true });
        const current = fs.existsSync(psProfile) ? fs.readFileSync(psProfile, 'utf-8') : '';
        if (!current.includes(marker)) {
            fs.appendFileSync(psProfile, psBlock);
        }
    }
}

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadFile('index.html');

    // Intercept OS close (X button, Alt+F4, etc.)
    // Ask the renderer to persist state first, then allow the close
    mainWindow.on('close', (e) => {
        if (!mainWindow._okToClose) {
            e.preventDefault();
            mainWindow.webContents.send('app-closing', shouldRestoreSession);
        }
    });

    // Only open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
};

const createAboutWindow = () => {
    aboutWindow = new BrowserWindow({
        width: 340,
        height: 300,
        transparent: true,
        frame: false,
        backgroundColor: '#00000000',
        resizable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        title: `About ${app.name}`,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    aboutWindow.removeMenu();
    aboutWindow.loadFile('about.html');

    aboutWindow.on('closed', () => {
        aboutWindow = null;
    });

    if (aboutWindow) {
        aboutWindow.focus();
        return;
    }
};

// Create application menu
const createMenu = () => {
    const isMac = process.platform === 'darwin';

    const template = [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                {
                    label: `About ${app.name}`,
                    click: () => {
                        createAboutWindow();
                    }
                },
                { type: 'separator' },
                {
                    label: `Quit ${app.name}`,
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        }] : [{
           label: app.name,
            submenu: [
                {
                    label: `About ${app.name}`,
                    click: () => {
                        createAboutWindow();
                    }
                },
                { type: 'separator' },
                {
                    label: `Quit ${app.name}`,
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        }]),

        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'new-file');
                    }
                },
                {
                    label: 'Open File',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const result = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile']
                        });

                        if (!result.canceled) {
                            mainWindow.webContents.send('menu-action', 'open-file', result.filePaths[0]);
                        }
                    }
                },
                {
                    label: 'Open Folder',
                    accelerator: 'CmdOrCtrl+K CmdOrCtrl+O',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'open-folder');
                    }
                },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'save');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ],
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'undo');
                    }
                },
                {
                    label: 'Redo',
                    accelerator: process.platform === 'darwin' ? 'Shift+Cmd+Z' : 'Ctrl+Y',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'redo');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    click: () => {
                        mainWindow.webContents.cut();
                    }
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    click: () => {
                        mainWindow.webContents.copy();
                    }
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    click: () => {
                        mainWindow.webContents.paste();
                    }
                }
            ],
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: 'Force Reload',
                    accelerator: 'Shift+CmdOrCtrl+R',
                    click: () => {
                        mainWindow.webContents.reloadIgnoringCache();
                    }
                },
                {
                    label: 'Toggle DevTools',
                    accelerator: 'Alt+CmdOrCtrl+I',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ],
        },
        {
            label: 'Terminal',
            submenu: [
                {
                    label: 'Toggle Integrated Terminal',
                    accelerator: 'CmdOrCtrl+Shift+`',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'toggle-terminal');
                    }
                },
                {
                    label: 'Open External Terminal',
                    accelerator: 'CmdOrCtrl+Alt+T',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'open-external-terminal');
                    }
                }
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};

app.whenReady().then(() => {
    injectShellTheme();
    createWindow();
    createMenu();
});

app.on('window-all-closed', () => {
    if (ptyProcess) {
        ptyProcess.kill();
    }
    app.quit();
});

app.on('before-quit', () => {
    shouldRestoreSession = true;
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-home-dir', async () => {
    return require('os').homedir();
});

ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['*'] },
            { name: 'JavaScript', extensions: ['js', 'jsx'] },
            { name: 'Python', extensions: ['py'] },
            { name: 'HTML', extensions: ['html'] },
            { name: 'CSS', extensions: ['css'] },
            { name: 'JSON', extensions: ['json'] },
            { name: 'Text', extensions: ['txt'] },
            { name: 'Markdown', extensions: ['md'] },
        ],
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return { success: true, filePath: result.filePaths[0] };
    }

    return { success: false, canceled: true };
});

ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return { success: true, folderPath: result.filePaths[0] };
    }

    return { success: false, canceled: true };
});

ipcMain.handle('read-directory', async (event, folderPath) => {
    try {
        const items = [];
        const entries = fs.readdirSync(folderPath, { withFileTypes: true });

        for (const entry of entries) {
            // Skip hidden files and unimportant directories
            if (entry.name.startsWith('.') ||
                ['node_modules', '__pycache__', '.git', 'dist', 'build'].includes(entry.name)) {
                continue;
            }

            items.push({
                name: entry.name,
                path: path.join(folderPath, entry.name),
                isDirectory: entry.isDirectory(),
            });
        }

        // Sort directories first, then sort alphabetically
        items.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) {
                return b.isDirectory - a.isDirectory;
            }
            return a.name.localeCompare(b.name);
        });

        return { success: true, items };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-file-dialog', async (event, content) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        // User can type whatever file format they choose
    });

    if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, content, 'utf-8');
        return { success: true, filePath: result.filePath };
    }

    return { success: false, canceled: true };
});

ipcMain.handle('save-state', async (event, stateJson) => {
    try {
        fs.writeFileSync(STATE_PATH, stateJson, 'utf-8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-state', async () => {
    try {
        if (!fs.existsSync(STATE_PATH)) return null;
        const raw = fs.readFileSync(STATE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
});

ipcMain.handle('confirm-close', () => {
    if (mainWindow) {
        mainWindow._okToClose = true;
        mainWindow.close();
    }
});

function getShell() {
    const platform = os.platform();

    if (platform === 'win32') {
        const { execSync } = require('child_process');
        // Try PowerShell Core (PS7) first, then fall back to built-in PS5
        try {
            execSync('pwsh.exe --version', { stdio: 'pipe' });
            return 'pwsh.exe';
        } catch {
            // powershell.exe (PS5) is built into every Win10/11 install
            return 'powershell.exe';
        }
    } else if (platform === 'darwin') {
        const candidates = ['/bin/zsh', '/bin/bash', '/bin/sh'];
        for (const shell of candidates) {
            if (fs.existsSync(shell)) return shell;
        }
    } else {
        const candidates = ['/bin/bash', '/bin/sh'];
        for (const shell of candidates) {
            if (fs.existsSync(shell)) return shell;
        }
    }
    return 'sh';
}

ipcMain.handle('spawn-terminal', async () => {
    try {
        const shell = getShell();
        const homeDir = os.homedir();
        const platform = os.platform();

        let shellArgs = [];
        let shellOptions = {
            name: 'xterm-color',
            cols: 80,
            rows: 24,
            cwd: homeDir,
            env: process.env,
            useConpty: false,
        };

        if (platform === 'win32') {
            // For PowerShell, use minimal args
            if (shell.includes('powershell') || shell.includes('pwsh')) {
            
                shellArgs = [
                    '-NoLogo',
                    '-NoProfile',
                    '-NoExit',
                    '-Command',
                    `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Set-Alias -Name cls -Value Clear-Host -Force -Option AllScope; function global:prompt { $e = [char]27; $loc = (Get-Location).Path; "$e[38;2;232;116;138m$env:USERNAME@$env:COMPUTERNAME$e[0m $e[38;2;244;135;113m$loc$e[0m $e[38;2;203;166;247m❯$e[0m " }; function global:clear { Clear-Host }; Set-Location '${homeDir}'`
                ];
            }
        }

        ptyProcess = pty.spawn(shell, shellArgs, shellOptions);

        ptyProcess.on('data', (data) => {
            if (mainWindow) {
                mainWindow.webContents.send('terminal-data', data.toString());
            }
        });

        ptyProcess.on('error', (error) => {
            console.error('PTY error:', error);
            if (mainWindow) {
                mainWindow.webContents.send('terminal-error', error.message);
            }
        });

        ptyProcess.on('exit', () => {
            console.log('PTY process exited');
            ptyProcess = null;
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to spawn terminal:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('terminal-input', async (event, input) => {
    if (ptyProcess) {
        try {
            ptyProcess.write(input);
        } catch (error) {
            console.error('Terminal input error:', error);
        }
    }
});

ipcMain.handle('terminal-resize', async (event, cols, rows) => {
    if (ptyProcess) {
        try {
            ptyProcess.resize(cols, rows);
        } catch (error) {
            console.error('Terminal resize error:', error);
        }
    }
});

ipcMain.handle('kill-terminal', async () => {
    if (ptyProcess) {
        try {
            ptyProcess.kill();
            ptyProcess = null;
            return { success: true };
        } catch (error) {
            console.error('Terminal kill error:', error);
            return { success: false, error: error.message };
        }
    }
    return { success: true };
});

ipcMain.handle('open-external-terminal', async () => {
    try {
        const { exec } = require('child_process');
        const homeDir = os.homedir();
        const platform = os.platform();

        return new Promise((resolve) => {
            let command;

            if (platform === 'darwin') {
                command = `open -a Terminal "${homeDir}"`;
            } else if (platform === 'win32') {
                command = `powershell -NoExit -Command "cd '${homeDir}'"`;
            } else {
                const terminalCmd = `cd "${homeDir}" && (gnome-terminal || konsole || xfce4-terminal || xterm)`;
                command = terminalCmd;
            }

            exec(command, (error) => {
                if (error) {
                    console.error('Failed to open external terminal:', error);
                    resolve({ success: false, error: error.message });
                } else {
                    console.log('External terminal opened');
                    resolve({ success: true });
                }
            });
        });
    } catch (error) {
        console.error('Error opening external terminal:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.on('menu-action-from-renderer', async (event, action, ...args) => {
    if (action === 'open-file') {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile']
        });
        if (!result.canceled) {
            mainWindow.webContents.send('menu-action', 'open-file', result.filePaths[0]);
        }
    }
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});