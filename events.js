const contentArea = document.getElementById('contentArea');

contentArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    contentArea.classList.add('dragover');
});

contentArea.addEventListener('dragleave', () => {
    contentArea.classList.remove('dragover');
});

contentArea.addEventListener('drop', (event) => {
    event.preventDefault();
    contentArea.classList.remove('dragover');

    const files = Array.from(event.dataTransfer.files);
    const videoFiles = files.filter(file => file.type === 'video/mp4');

    if (!selectedFolderId) {
        alert('Bitte zuerst einen Ordner auswählen.');
        return;
    }

    videoFiles.forEach(file => saveVideo(file, selectedFolderId));
});

function clearDatabase() {
    const transaction = db.transaction(["folders", "videos"], "readwrite");

    const folderStore = transaction.objectStore("folders");
    folderStore.clear();

    const videoStore = transaction.objectStore("videos");
    videoStore.clear();

    transaction.oncomplete = () => {
        alert('Alle Daten wurden erfolgreich gelöscht!');
        loadFolders();
        document.getElementById('contentList').innerHTML = '';
    };

    transaction.onerror = (event) => {
        console.error("Fehler beim Löschen der Daten:", event.target.errorCode);
    };
}
