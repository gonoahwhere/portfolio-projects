let currentFilePath = null;
let editor = null;
let editorReady = false;

// In memory buffer
const tabBuffers = new Map();
let persistTimer = null;
let suppressChangeEvent = false;

// Terminal variables
let terminal = null;
let terminalReady = false;
let terminalVisible = true;
let awaitingOutput = false;

// Workspace variables
let workspaceFolders = [];
let openTabs = new Map();
let currentTab = null;

// Track untitled files
let untitledCount = 0;

function debugBuf(label, key) {
    const buf = tabBuffers.get(key);
    if (!buf) {
        return;
    }
    const isDirty = !buf.savedToDisk || buf.savedContent === null || buf.content !== buf.savedContent;
}

// Configure Monaco Editor loader
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs' }});

// Initialise Monaco Editor
require(['vs/editor/editor.main'], function() {
    console.log('Monaco module loaded');

    try {
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: '// Welcome to Jawva\n// Start by opening a file or creating a new one.\n\nfunction helloWorld() {\n console.log("Hello, World!");\n}\n',
            language: 'javascript',
            theme: 'vs-dark',
            fontSize: 14,
            fontFamily: '"SF Mono", Monaco, "Inconsolata", "Fira Code", monospace',
            lineNumbers: 'on',
            minimap: { enabled: true },
            automaticLayout: true,
        });

        editorReady = true;
        console.log('Monaco Editor initialised and ready!');
        updateStatus('Ready');

        editor.onDidChangeCursorPosition((e) => {
            document.getElementById('line-info').textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
        });

        editor.onDidChangeModelContent(() => {
            if (suppressChangeEvent) return;
            const key = currentFilePath || [...openTabs.entries()].find(([, t]) => t === currentTab)?.[0];
            if (!key) return;
            const buf = tabBuffers.get(key);
            if (!buf) return;
            buf.content = editor.getValue();
            const isDirty = buf.content !== buf.savedContent;

            updateStatus(isDirty ? 'Modified' : 'Ready');

            // TAB DOT
            if (currentTab) {
                const dot = currentTab.querySelector('.tab-dirty-dot');
                if (dot) dot.style.display = isDirty ? 'inline-block' : 'none';
            }

            // WORKSPACE DOT
            const fileRow =
                document.querySelector(
                    `.file-item-nested .file-label[title="${CSS.escape(key)}"]`
                )?.parentElement;

            if (fileRow) {
                const workspaceDot = fileRow.querySelector('.workspace-dirty-dot');
                if (workspaceDot) {
                    workspaceDot.style.display = isDirty ? 'inline-block' : 'none';
                }
            }

            schedulePersist();
        });

        initializeTerminal();
        setupTerminalDivider();

        restoreState();
    } catch (error) {
        console.error('Failed to load Monaco Editor:', error);
        updateStatus('Error: Failed to load Monaco Editor');
    }
});

async function persistState() {
    if (editorReady) {
        const key = currentFilePath || ([...openTabs.entries()].find(([, t]) => t === currentTab)?.[0] ?? null);

        if (key) {
            const existing = tabBuffers.get(key) || {};
            tabBuffers.set(key, {
                ...existing,
                content: editor.getValue(),
                savedContent: existing.savedContent,
            });
        }
    }

    const tabs = [];
    for (const [key, buf] of tabBuffers.entries()) {
        tabs.push({
            key,
            label: buf.label,
            content: buf.content,
            savedContent: buf.savedContent,
            savedToDisk: buf.savedToDisk,
            isActive: key === (currentFilePath || ([...openTabs.entries()].find(([, t]) => t === currentTab)?.[0] ?? null)),
        });
    }

    // DEBUG
    for (const [key] of tabBuffers.entries()) debugBuf('PERSIST', key);

    const folders = workspaceFolders.map(f => ({
        id: f.id,
        name: f.name,
        path: f.path,
    }));

    const state = { tabs, folders, untitledCount };
    await window.electronAPI.saveState(JSON.stringify(state));
}

function schedulePersist() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(persistState, 800);
}

async function restoreState() {
    const state = await window.electronAPI.loadState();
    if (!state) return;

    if (state.untitledCount) {
        untitledCount = state.untitledCount;
    }

    let activeKey = null;

    // RESTORE TAB BUFFERS FIRST
    for (const tab of (state.tabs || [])) {
        tabBuffers.set(tab.key, {
            label: tab.label,
            content: tab.content,
            savedContent: ('savedContent' in tab) ? tab.savedContent : (tab.savedToDisk ? tab.content : null),
            savedToDisk: tab.savedToDisk,
        });

        debugBuf('RESTORE_SET', tab.key);

        addTabForKey(tab.key, tab.label, tab.savedToDisk);

        // Restore standalone files to sidebar
        if (!tab.key.startsWith('untitled:')) {
            addFileToSidebar(tab.key, tab.label);
        }

        if (tab.isActive) {
            activeKey = tab.key;
        }
    }

    // THEN BUILD WORKSPACE SIDEBAR
    for (const folder of (state.folders || [])) {
        workspaceFolders.push(folder);
        await addFolderToSidebar(folder.id, folder.name, folder.path);
    }

    if (activeKey) {
        await openTabByKey(activeKey);
    }

    updateStatus('Session restored');
}

async function openTabByKey(key) {
    const buf = tabBuffers.get(key);
    if (!buf) return;

    // DEBUG
    debugBuf('OPEN_TAB', key);

    currentFilePath = key.startsWith('untitled:') ? null : key;

    suppressChangeEvent = true;
    editor.setValue(buf.content);
    suppressChangeEvent = false;

    if (!key.startsWith('untitled:') && currentFilePath) {
        detectLanguage(currentFilePath);
    } else {
        monaco.editor.setModelLanguage(editor.getModel(), 'plaintext');
    }

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const tab = openTabs.get(key);
    if (tab) {
        tab.classList.add('active');
        const dot = tab.querySelector('.tab-dirty-dot');
        const isDirty = !buf.savedToDisk || buf.savedContent === null || buf.content !== buf.savedContent;
        if (dot) dot.style.display = isDirty ? 'inline-block' : 'none';
    }
    currentTab = tab || null;
}

window.electronAPI.onAppClosing(async (shouldRestoreSession) => {
    clearTimeout(persistTimer);

    if (shouldRestoreSession) {
        // Cmd/Ctrl+Q
        await persistState();
    } else {
        // Normal window close / X button / Alt+F4
        await window.electronAPI.saveState('');
    }

    await window.electronAPI.confirmClose();
});

async function initializeTerminal() {
    const terminalDiv = document.getElementById('terminal');

    if (!terminalDiv) {
        console.error('Terminal div not found!');
        return;
    }

    terminal = new Terminal({
        scrollback: 1000,
        theme: {
            background: '#1e1e1e',
            foreground: '#f5c2e7',
            cursor: '#e8748a',
            cursorAccent: '#1e1e1e',
            selection: 'rgba(232, 116, 138, 0.3)',
            black: '#1e1e1e',
            red: '#f48771',
            green: '#a6e3a1',
            yellow: '#f9e2af',
            blue: '#89b4fa',
            magenta: '#e8748a',
            cyan: '#94e2d5',
            white: '#d4d4d4',
            brightBlack: '#45475a',
            brightRed: '#f48771',
            brightGreen: '#a6e3a1',
            brightYellow: '#f9e2af',
            brightBlue: '#89b4fa',
            brightMagenta: '#e8748a',
            brightCyan: '#94e2d5',
            brightWhite: '#f5f5f5',
        },
        fontFamily: '"Geo", sans-serif',
        rendererType: 'canvas',
        fontSize: 13,
    });

    const fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalDiv);
    fitAddon.fit();
    terminalReady = true;
    setTimeout(() => terminal.focus(), 100);
    console.log('Terminal initialized');

    window.electronAPI.spawnTerminal().then((result) => {
        if (result.success) {
            console.log('Terminal spawned');
            updateStatus('Ready');
            // Give PowerShell extra time to send its prompt
            setTimeout(() => { if (terminal) terminal.focus(); }, 300);
        } else {
            console.error('Failed to spawn terminal:', result.error);
            updateStatus('Error: Failed to spawn terminal');
        }
    });

    terminal.onData((data) => {
        if (data === '\r') {
            awaitingOutput = true;
        }
        window.electronAPI.terminalInput(data);
    });

    terminal.onResize((size) => {
        window.electronAPI.terminalResize(size.cols, size.rows);
    });

    window.electronAPI.onTerminalData((data) => {
        let out = data

        if (window.electronAPI.platform === 'win32') {
            out = out.replace(
                /([A-Z]:\\[^\r\n>]*?)([^\\>]+)>/g,
                (match, drivePath, currentDir) => {
                    const user = window.electronAPI.username;
                    const hostname = window.electronAPI.hostname;
                    const dir = currentDir.trim().toLowerCase() === user.toLowerCase() ? '~' : currentDir.trim();
                    return `\x1b[38;2;232;116;138m${user}@${hostname}\x1b[0m \x1b[38;2;244;135;113m${dir}\x1b[0m \x1b[38;2;203;166;247m❯\x1b[0m \x1b[38;2;154;154;154m`;
                }
            );

            out = out.replace(
                /'(.+?)' is not recognized/g,
                '\x1b[38;2;154;154;154m\'$1\'\x1b[0m is not recognized'
            )
            terminal.write(out)
        } else {
            out = data.replace(
                /(command not found: )(.+)/,
                '$1\x1b[38;2;154;154;154m$2\x1b[0m'
            );
            terminal.write(out);
        }
    });
}

function setupTerminalDivider() {
    const divider = document.getElementById('terminalDivider');
    const mainContent = document.querySelector('.main-content');
    const terminalContainer = document.getElementById('terminalContainer');

    if (!divider || !mainContent || !terminalContainer) {
        console.warn('Terminal divider elements not found');
        return;
    }

    let isResizing = false;
    let startY = 0;
    let startHeight = 0;

    divider.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = terminalContainer.offsetHeight;
        divider.classList.add('dragging');
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const delta = startY - e.clientY;
        const newHeight = startHeight + delta;
        const minHeight = 100;
        const maxHeight = mainContent.offsetHeight - 300;

        if (newHeight >= minHeight && newHeight <= maxHeight) {
            terminalContainer.style.flex = `0 0 ${newHeight}px`;
            if (editor) {
                editor.layout();
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            divider.classList.remove('dragging');
            document.body.style.userSelect = 'auto';
        }
    });
}

function toggleTerminal() {
    const terminalContainer = document.getElementById('terminalContainer');
    const divider = document.getElementById('terminalDivider');

    if (!terminalContainer) return;

    terminalVisible = !terminalVisible;

    if (terminalVisible) {
        terminalContainer.style.display = 'flex';
        if (divider) divider.style.display = 'block';
        setTimeout(() => {
            fitAddon.fit();
            terminal.focus();
        }, 50);
    } else {
        terminalContainer.style.display = 'none';
        if (divider) divider.style.display = 'none';
    }

    setTimeout(() => {
        if (editor) editor.layout();
    }, 0);
}

async function openFolder() {
    console.log('openFolder called');

    const result = await window.electronAPI.openFolderDialog();

    if (result.success) {
        const folderPath = result.folderPath;
        const folderName = folderPath.split(/[/\\]/).pop();
        const folderId = `folder-${Date.now()}`;

        workspaceFolders.push({
            id: folderId,
            name: folderName,
            path: folderPath,
            expanded: true
        });

        addFolderToSidebar(folderId, folderName, folderPath);
        updateStatus(`Added folder: ${folderName}`);
        schedulePersist();
    }
}

async function addFolderToSidebar(folderId, folderName, folderPath) {
    const folderContainer = document.getElementById('folder-list') || createFolderListContainer();

    const folderItem = document.createElement('div');
    folderItem.className = 'folder-item';
    folderItem.id = folderId;

    const folderHeader = document.createElement('div');
    folderHeader.className = 'folder-header';

    const folderToggle = document.createElement('span');
    folderToggle.className = 'folder-toggle';
    folderToggle.textContent = '▼';

    const folderNameSpan = document.createElement('span');
    folderNameSpan.textContent = folderName;
    folderNameSpan.title = folderPath;

    const removeBtn = document.createElement('span');
    removeBtn.textContent = '×';
    removeBtn.className = 'folder-remove';
    removeBtn.title = 'Remove from workspace';
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        folderItem.remove();
        workspaceFolders = workspaceFolders.filter(f => f.id !== folderId);

        // Close any open tabs whose path starts with this folder
        for (const [key, tabEl] of [...openTabs.entries()]) {
            if (key.startsWith(folderPath)) {
                closeTab(key, tabEl);
            }
        }

        updateStatus('Folder removed from workspace');
        schedulePersist();
    };

    folderHeader.appendChild(folderToggle);
    folderHeader.appendChild(folderNameSpan);
    folderHeader.appendChild(removeBtn);

    const fileTree = document.createElement('div');
    fileTree.className = 'file-tree';
    fileTree.id = `tree-${folderId}`;

    folderItem.appendChild(folderHeader);
    folderItem.appendChild(fileTree);
    folderContainer.appendChild(folderItem);

    await loadFolderContents(folderPath, fileTree, 0);

    folderHeader.addEventListener('click', (e) => {
        if (e.target === removeBtn) return;
        const isExpanded = fileTree.style.display !== 'none';
        fileTree.style.display = isExpanded ? 'none' : '';
        folderToggle.textContent = isExpanded ? '▶' : '▼';
    });
}

function addUntitledToSidebar(key, label) {
    const container = getOrCreateStandaloneFilesContainer();
    if (!container) return;
    if (container.querySelector(`[data-path="${CSS.escape(key)}"]`)) return;

    const row = document.createElement('div');
    row.className = 'file-item-nested';
    row.dataset.path = key;
    row.style.paddingLeft = '20px';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'file-icon';
    iconSpan.textContent = '📄';
    iconSpan.setAttribute('aria-hidden', 'true');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'file-label';
    nameSpan.textContent = label;
    nameSpan.title = key;

    const dirtyDot = document.createElement('span');
    dirtyDot.className = 'workspace-dirty-dot';
    dirtyDot.textContent = '●';
    dirtyDot.style.display = 'inline-block';

    const removeBtn = document.createElement('span');
    removeBtn.className = 'folder-remove';
    removeBtn.textContent = '×';
    removeBtn.title = 'Close';
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        const tabEl = openTabs.get(key);
        if (tabEl) closeTab(key, tabEl);
        else row.remove();
    };

    row.appendChild(iconSpan);
    row.appendChild(nameSpan);
    row.appendChild(dirtyDot);
    row.appendChild(removeBtn);

    row.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.file-item-nested.selected').forEach(el => el.classList.remove('selected'));
        row.classList.add('selected');
        openTabByKey(key);
    });

    container.appendChild(row);
}

function createFolderListContainer() {
    const container = document.createElement('div');
    container.id = 'folder-list';

    const oldFileList = document.getElementById('file-list');
    if (oldFileList) {
        oldFileList.replaceWith(container);
    } else {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.appendChild(container);
        }
    }

    return container;
}

async function loadFolderContents(folderPath, container, depth = 0) {
    const result = await window.electronAPI.readDirectory(folderPath);

    if (!result.success) {
        console.error('Failed to read directory:', result.error);
        return;
    }

    container.innerHTML = '';

    for (const item of result.items) {
        const row = document.createElement('div');

        if (item.isDirectory) {
            row.className = 'folder-item-nested';
            row.style.paddingLeft = `${20 + depth * 12}px`;

            const chevron = document.createElement('span');
            chevron.className = 'folder-icon';
            chevron.textContent = '▶';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'file-label';
            nameSpan.textContent = item.name;
            nameSpan.title = item.path;

            const subTree = document.createElement('div');
            subTree.className = 'sub-tree';

            row.appendChild(chevron);
            row.appendChild(nameSpan);
            container.appendChild(row);
            container.appendChild(subTree);

            row.addEventListener('click', async (e) => {
                e.stopPropagation();
                const isOpen = subTree.style.display === 'block';

                if (isOpen) {
                    subTree.style.display = 'none';
                    chevron.textContent = '▶';
                } else {
                    if (!subTree.dataset.loaded) {
                        await loadFolderContents(item.path, subTree, depth + 1);
                        subTree.dataset.loaded = 'true';
                    }
                    subTree.style.display = 'block';
                    chevron.textContent = '▼';
                }
            });
        } else {
            row.className = 'file-item-nested';
            row.style.paddingLeft = `${20 + depth * 12}px`;

            const fileType = getFileType(item.name);
            if (fileType) row.dataset.type = fileType;

            const iconSpan = document.createElement('span');
            iconSpan.className = 'file-icon';
            iconSpan.textContent = getFileIcon(item.name);
            iconSpan.setAttribute('aria-hidden', 'true');

            const nameSpan = document.createElement('span');
            nameSpan.className = 'file-label';
            nameSpan.textContent = item.name;
            nameSpan.title = item.path;

            const dirtyDot = document.createElement('span');
            dirtyDot.className = 'workspace-dirty-dot';
            dirtyDot.textContent = '●';

            const buf = tabBuffers.get(item.path);
            const isDirty = buf ? (!buf.savedToDisk || buf.savedContent === null || buf.content !== buf.savedContent) : false;
            dirtyDot.style.display = isDirty ? 'inline-block' : 'none';

            row.appendChild(iconSpan);
            row.appendChild(nameSpan);
            row.appendChild(dirtyDot);
            container.appendChild(row);

            row.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.file-item-nested.selected').forEach(el => el.classList.remove('selected'));
                row.classList.add('selected');
                openFileFromPath(item.path, item.name);
            });
        }
    }
}

function getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const name = fileName.toLowerCase();

    if (name === '.env' || name === '.env.local' || name === '.env.example') return 'env';
    if (name === '.gitignore' || name === '.dockerignore') return 'lock';
    if (name === 'dockerfile') return 'lock';
    if (name === 'package.json' || name === 'package-lock.json') return 'json';

    const typeMap = {
        js: 'js', jsx: 'jsx', mjs: 'mjs', cjs: 'cjs',
        ts: 'ts', tsx: 'tsx',
        py: 'py', pyc: 'pyc',
        html: 'html', htm: 'html',
        css: 'css', scss: 'scss', sass: 'sass', less: 'less', stylus: 'stylus',
        json: 'json', yaml: 'yaml', yml: 'yml', toml: 'toml', ini: 'ini',
        md: 'md', markdown: 'md', txt: 'txt', rst: 'txt',
        java: 'java', cpp: 'cpp', c: 'c', cs: 'cs', go: 'go',
        rs: 'rs', rb: 'rb', php: 'php', swift: 'swift',
        lock: 'lock', log: 'log', tmp: 'tmp',
        png: 'png', jpg: 'jpg', jpeg: 'jpg', gif: 'png', webp: 'png',
        svg: 'svg', ico: 'ico', icns: 'icns',
    };

    return typeMap[ext] || null;
}

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const name = fileName.toLowerCase();

    if (name === 'package.json' || name === 'package-lock.json') return '{}';
    if (name === '.env' || name.startsWith('.env.')) return '⚙';
    if (name === '.gitignore' || name === '.dockerignore') return '◊';
    if (name === 'readme.md' || name === 'readme.txt') return 'ℹ';
    if (name === 'dockerfile') return '🐳';

    const iconMap = {
        js: 'JS', jsx: 'JS', mjs: 'JS', cjs: 'JS',
        ts: 'TS', tsx: 'TS',
        py: '🐍',
        html: '<>',
        css: '#', scss: '#', sass: '#', less: '#', stylus: '#',
        json: '{}', yaml: '≡', yml: '≡', toml: '≡', ini: '≡',
        md: '≡', markdown: '≡', txt: '≡', rst: '≡',
        java: 'Jv', cpp: 'C+', c: 'C', cs: 'C#', go: 'Go',
        rs: 'Rs', rb: 'Rb', php: 'Php', swift: 'Sw',
        sql: 'SQL',
        sh: '$', bash: '$', zsh: '$', fish: '$',
        zip: '📦', tar: '📦', gz: '📦', rar: '📦',
        png: '🖼', jpg: '🖼', jpeg: '🖼', gif: '🖼',
        svg: '🖼', ico: '🖼', icns: '🖼', webp: '🖼',
        lock: '🔒', log: '📋', tmp: '⊘',
    };

    return iconMap[ext] || '📄';
}

function getOrCreateStandaloneFilesContainer() {
    let container = document.getElementById('standalone-files');
    if (container) return container;

    container = document.createElement('div');
    container.id = 'standalone-files';

    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return null;

    // Always sits above folder-list
    const anchor = document.getElementById('folder-list') || document.getElementById('file-list');
    anchor ? sidebar.insertBefore(container, anchor) : sidebar.appendChild(container);

    return container;
}

function addFileToSidebar(filePath, fileName) {
    if (filePath.startsWith('untitled:')) return;

    // Don't add if already visible inside a workspace folder tree
    if (document.querySelector(`.file-item-nested .file-label[title="${CSS.escape(filePath)}"]`)) return;

    const container = getOrCreateStandaloneFilesContainer();
    if (!container) return;

    // Don't duplicate
    if (container.querySelector(`[data-path="${CSS.escape(filePath)}"]`)) return;

    const row = document.createElement('div');
    row.className = 'file-item-nested';
    row.dataset.path = filePath;
    row.style.paddingLeft = '20px';

    const fileType = getFileType(fileName);
    if (fileType) row.dataset.type = fileType;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'file-icon';
    iconSpan.textContent = getFileIcon(fileName);
    iconSpan.setAttribute('aria-hidden', 'true');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'file-label';
    nameSpan.textContent = fileName;
    nameSpan.title = filePath;

    const dirtyDot = document.createElement('span');
    dirtyDot.className = 'workspace-dirty-dot';
    dirtyDot.textContent = '●';
    const buf = tabBuffers.get(filePath);
    const isDirty = buf ? (!buf.savedToDisk || buf.savedContent === null || buf.content !== buf.savedContent) : false;
    dirtyDot.style.display = isDirty ? 'inline-block' : 'none';

    row.appendChild(iconSpan);
    row.appendChild(nameSpan);
    row.appendChild(dirtyDot);

    const removeBtn = document.createElement('span');
    removeBtn.className = 'folder-remove';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove from sidebar';
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        const tabEl = openTabs.get(filePath);
        if (tabEl) {
            closeTab(filePath, tabEl);
        } else {
            removeFileFromSidebar(filePath);
        }
    };

    row.appendChild(removeBtn);
    container.appendChild(row);

    row.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.file-item-nested.selected').forEach(el => el.classList.remove('selected'));
        row.classList.add('selected');
        openFileFromPath(filePath, fileName);
    });
}

function removeFileFromSidebar(filePath) {
    const container = document.getElementById('standalone-files');
    if (!container) return;
    const row = [...container.children].find(el => el.dataset.path === filePath);
    if (row) row.remove();
    if (!container.children.length) container.remove();
}

async function openFileFromPath(filePath, fileName) {
    if (!editorReady) {
        updateStatus('Editor is loading, please wait...');
        return;
    }

    if (tabBuffers.has(filePath)) {
        const buf = tabBuffers.get(filePath);

        addTabForKey(filePath, fileName, buf.savedToDisk);

        currentFilePath = filePath;

        suppressChangeEvent = true;
        editor.setValue(buf.content);
        suppressChangeEvent = false;

        detectLanguage(filePath);
        addFileToSidebar(filePath, fileName);
        return;
    }

    const fileResult = await window.electronAPI.readFile(filePath);
    if (!fileResult.success) {
        updateStatus(`Error reading file: ${fileResult.error}`);
        return;
    }

    tabBuffers.set(filePath, {
        label: fileName,
        content: fileResult.content,
        savedContent: fileResult.content,
        savedToDisk: true,
    });

    currentFilePath = filePath;

    suppressChangeEvent = true;
    editor.setValue(fileResult.content);
    suppressChangeEvent = false;

    detectLanguage(filePath);
    updateStatus(`Opened: ${fileName}`);
    addFileToSidebar(filePath, fileName);
    addTabForKey(filePath, fileName, true);
    schedulePersist();
}

function addTabForKey(key, label, savedToDisk = true) {
    if (openTabs.has(key)) {
        const existing = openTabs.get(key);
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        existing.classList.add('active');
        currentTab = existing;

        const buf = tabBuffers.get(key);
        const dot = existing.querySelector('.tab-dirty-dot');
        if (dot && buf) {
            const isDirty = !buf.savedToDisk || buf.savedContent === null || buf.content !== buf.savedContent;
            dot.style.display = isDirty ? 'inline-block' : 'none';
        }
        return;
    }

    const tabBar = document.getElementById('tab-bar') || createTabBar();
    const tab = document.createElement('div');
    tab.className = 'tab active';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'tab-label';
    labelSpan.textContent = label;

    const dot = document.createElement('span');
    dot.className = 'tab-dirty-dot';
    dot.textContent = '●';
    const buf = tabBuffers.get(key);
    const isDirtyOnCreate = buf ? (!buf.savedToDisk || buf.savedContent === null || buf.content !== buf.savedContent) : !savedToDisk;
    dot.style.display = isDirtyOnCreate ? 'inline-block' : 'none';
    dot.title = 'Unsaved changes';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'tab-close';
    closeBtn.textContent = '×';
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeTab(key, tab);
    };

    tab.appendChild(dot);
    tab.appendChild(labelSpan);
    tab.appendChild(closeBtn);
    tab.onclick = () => openTabByKey(key);
    tabBar.appendChild(tab);

    if (currentTab) currentTab.classList.remove('active');
    openTabs.set(key, tab);
    currentTab = tab;
}

function addTabForFile(filePath, fileName) {
    addTabForKey(filePath, fileName, true);
}

function closeTab(key, tabEl) {
    // Capture BEFORE any mutations
    const activeKey = currentFilePath || [...openTabs.entries()].find(([, t]) => t === currentTab)?.[0];
    const wasActive = key === activeKey;
    console.log('closeTab', { key, activeKey, wasActive, currentFilePath, currentTab });

    tabBuffers.delete(key);
    openTabs.delete(key);
    tabEl.remove();
    removeFileFromSidebar(key);

    if (wasActive) {
        currentTab = null;
        currentFilePath = null;

        const nextEntry = [...openTabs.entries()][0];
        if (nextEntry) {
            openTabByKey(nextEntry[0]);
        } else {
            suppressChangeEvent = true;
            editor.setValue('');
            suppressChangeEvent = false;
            monaco.editor.setModelLanguage(editor.getModel(), 'plaintext');
            updateStatus('Ready');
            document.getElementById('line-info').textContent = 'Ln 1, Col 1';
        }
    }

    schedulePersist();
}

function createTabBar() {
    const tabBar = document.createElement('div');
    tabBar.id = 'tab-bar';

    const editorContainer = document.querySelector('.editor-section');
    if (editorContainer) {
        editorContainer.insertBefore(tabBar, editorContainer.firstChild);
    }

    return tabBar;
}

async function newFile() {
    if (!editorReady) { updateStatus('Editor not ready'); return; }

    untitledCount++;
    const key = `untitled:${untitledCount}`;
    const label = `Untitled-${untitledCount}`;

    tabBuffers.set(key, {
        label,
        content: '',
        savedContent: null,
        savedToDisk: false
    });

    currentFilePath = null;
    suppressChangeEvent = true;
    editor.setValue('');
    suppressChangeEvent = false;
    monaco.editor.setModelLanguage(editor.getModel(), 'plaintext');

    updateStatus(`New file: ${label}`);
    addTabForKey(key, label, false);
    addUntitledToSidebar(key, label);
    schedulePersist();
}

async function saveFile() {
    if (!editorReady) { updateStatus('Editor not ready'); return; }

    const content = editor.getValue();

    if (!currentFilePath) {
        const untitledKey = [...openTabs.entries()].find(([, t]) => t === currentTab)?.[0];

        const result = await window.electronAPI.saveFileDialog(content);
        if (!result.success) return;

        const newPath = result.filePath;
        const newName = newPath.split(/[/\\]/).pop();

        if (untitledKey) {
            tabBuffers.delete(untitledKey);
            const oldTab = openTabs.get(untitledKey);
            if (oldTab) {
                openTabs.delete(untitledKey);
                openTabs.set(newPath, oldTab);
                oldTab.querySelector('.tab-label').textContent = newName;
                oldTab.querySelector('.tab-dirty-dot').style.display = 'none';
            }
        }

        tabBuffers.set(newPath, {
            label: newName,
            content,
            savedContent: content,
            savedToDisk: true
        });

        currentFilePath = newPath;
        detectLanguage(newPath);
        addFileToSidebar(newPath, newName);
        updateStatus(`Saved: ${newName}`);
        schedulePersist();
        return;
    }

    const result = await window.electronAPI.writeFile(currentFilePath, content);
    if (result.success) {
        const buf = tabBuffers.get(currentFilePath);
        if (buf) {
            buf.savedToDisk = true;
            buf.content = content;
            buf.savedContent = content;
        }

        if (currentTab) {
            const dot = currentTab.querySelector('.tab-dirty-dot');
            if (dot) dot.style.display = 'none';
            const fileRow = document.querySelector(`.file-item-nested .file-label[title="${currentFilePath}"]`)?.parentElement;

            if (fileRow) {
                const workspaceDot = fileRow.querySelector('.workspace-dirty-dot');
                if (workspaceDot) {
                    workspaceDot.style.display = 'none';
                }
            }
        }

        updateStatus(`Saved: ${currentFilePath.split(/[/\\]/).pop()}`);
        schedulePersist();
    } else {
        updateStatus(`Error: ${result.error}`);
    }
}

function detectLanguage(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const languageMap = {
        'js': 'javascript',
        'py': 'python',
        'ts': 'typescript',
        'jsx': 'javascript',
        'tsx': 'typescript',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'cs': 'csharp',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
    };

    const language = languageMap[ext] || 'plaintext';
    monaco.editor.setModelLanguage(editor.getModel(), language);
}

function openExternalTerminal() {
    console.log('openExternalTerminal called');
    window.electronAPI.openExternalTerminal().then((result) => {
        if (result.success) {
            console.log('External terminal opened successfully');
            updateStatus('External terminal opened');
        } else {
            console.error('Failed to open external terminal:', result.error);
            updateStatus(`Error: ${result.error}`);
        }
    }).catch((error) => {
        console.error('Error opening external terminal:', error);
        updateStatus('Error: Failed to open external terminal');
    });
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function openFile() {
    window.electronAPI.sendMenuAction('open-file');
}

window.electronAPI.onMenuAction(async (action, ...args) => {
    if (action === 'new-file') newFile();

    if (action === 'open-file') {
        const filePath = args[0];
        if (filePath) {
            const fileName = filePath.split(/[/\\]/).pop();
            openFileFromPath(filePath, fileName);
        } else {
            const result = await window.electronAPI.openFileDialog();
            if (result.success) {
                const fileName = result.filePath.split(/[/\\]/).pop();
                openFileFromPath(result.filePath, fileName);
            }
        }
    }

    if (action === 'open-folder') openFolder();
    if (action === 'save') saveFile();
    if (action === 'toggle-terminal') toggleTerminal();
    if (action === 'open-external-terminal') openExternalTerminal();
});