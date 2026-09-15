window.electronAPI.app().then(version => {
    document.getElementById('version').textContent = `v${version}`;
});

document.getElementById('close-btn').addEventListener('click', () => {
    window.close();
});