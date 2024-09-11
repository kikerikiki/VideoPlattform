function uploadVideo() {
    if (!selectedFolderId) {
        alert('Bitte zuerst einen Ordner auswählen.');
        return;
    }

    const input = document.getElementById('videoInput');
    const file = input.files[0];

    if (!file || file.type !== 'video/mp4') {
        alert('Bitte ein gültiges MP4-Video hochladen.');
        return;
    }

    saveVideo(file, selectedFolderId);
}

function saveVideo(file, folderId) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const videoData = event.target.result;

        const transaction = db.transaction(["videos"], "readwrite");
        const videoStore = transaction.objectStore("videos");
        videoStore.add({ name: file.name, data: videoData, folderId: folderId });

        transaction.oncomplete = () => {
            alert('Video erfolgreich hochgeladen!');
            loadContent(folderId);
        };
    };

    reader.readAsArrayBuffer(file);
}

function loadContent(folderId) {
    const contentList = document.getElementById('contentList');
    contentList.innerHTML = '';
    let isEmpty = true;

    const transactionFolders = db.transaction(["folders"], "readonly");
    const folderStore = transactionFolders.objectStore("folders");
    const indexFolders = folderStore.index("parentId");
    const queryFolders = indexFolders.openCursor(IDBKeyRange.only(folderId));

    queryFolders.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            isEmpty = false;
            const folder = cursor.value;
            const folderElement = document.createElement('div');
            folderElement.className = 'folder-item';

            const folderIcon = document.createElement('div');
            folderIcon.className = 'folder-thumbnail';
            folderIcon.innerHTML = '📁'; 

            const folderName = document.createElement('p');
            folderName.className = 'folder-name';
            folderName.textContent = folder.name;

            folderElement.appendChild(folderIcon);
            folderElement.appendChild(folderName);
            folderElement.onclick = () => selectFolder(folder.id, folderElement);

            contentList.appendChild(folderElement);
            cursor.continue();
        }
    };

    const transactionVideos = db.transaction(["videos"], "readonly");
    const videoStore = transactionVideos.objectStore("videos");
    const indexVideos = videoStore.index("folderId");
    const queryVideos = indexVideos.openCursor(IDBKeyRange.only(folderId));

    queryVideos.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            isEmpty = false;
            const video = cursor.value;
            const videoElement = document.createElement('div');
            videoElement.className = 'video-item';

            const videoPlayer = document.createElement('video');
            videoPlayer.src = URL.createObjectURL(new Blob([video.data], { type: 'video/mp4' }));
            videoPlayer.controls = true;
            videoPlayer.width = 200;

            const formattedName = video.name.replace(/\.mp4$/i, '');
            const info = document.createElement('p');
            info.className = 'video-name';
            info.textContent = formattedName;

            videoElement.appendChild(videoPlayer);
            videoElement.appendChild(info);

            contentList.appendChild(videoElement);
            cursor.continue();
        }
    };

    transactionVideos.oncomplete = () => {
        if (isEmpty) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Dieser Ordner ist leer';
            contentList.appendChild(emptyMessage);
        }
    };
}
