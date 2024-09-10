function createFolder() {
    const folderName = document.getElementById('folderInput').value.trim();
    if (!folderName) {
        alert('Bitte einen Ordnernamen eingeben.');
        return;
    }

    const transaction = db.transaction(["folders"], "readwrite");
    const folderStore = transaction.objectStore("folders");
    folderStore.add({ name: folderName, parentId: selectedFolderId || null });

    transaction.oncomplete = () => {
        document.getElementById('folderInput').value = '';
        if (selectedFolderId) {
            const parentElement = selectedFolderElement.querySelector('.treeview');
            parentElement.innerHTML = '';
            loadSubfolders(selectedFolderId, parentElement);
            selectedFolderElement.classList.add('expanded');
        } else {
            loadFolders();
        }
    };

    transaction.onerror = (event) => {
        console.error("Fehler beim Hinzufügen des Ordners:", event.target.errorCode);
    };
}

function loadFolders() {
    const folderList = document.getElementById('folderList');
    folderList.innerHTML = '';

    const transaction = db.transaction(["folders"], "readonly");
    const folderStore = transaction.objectStore("folders");

    const rootFolders = [];
    folderStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const folder = cursor.value;
            if (!folder.parentId) {
                rootFolders.push(folder);
            }
            cursor.continue();
        } else {
            renderFolders(rootFolders, folderList);
        }
    };
}

function renderFolders(folders, parentElement) {
    folders.forEach(folder => {
        const li = document.createElement('li');
        const folderElement = document.createElement('div');
        folderElement.className = 'folder';
        folderElement.dataset.folderId = folder.id;

        const toggle = document.createElement('span');
        toggle.className = 'toggle';

        const icon = document.createElement('span');
        icon.className = 'folder-icon';
        icon.innerHTML = '📁';

        const name = document.createElement('span');
        name.className = 'folder-name';
        name.textContent = folder.name;

        folderElement.appendChild(toggle);
        folderElement.appendChild(icon);
        folderElement.appendChild(name);
        li.appendChild(folderElement);
        parentElement.appendChild(li);

        folderElement.onclick = (e) => {
            e.stopPropagation();
            selectFolder(folder.id, folderElement);
            toggleSubfolders(folderElement, li, folder.id);
        };

        folderElement.addEventListener('dragover', (event) => {
            event.preventDefault();
            folderElement.classList.add('dragover');
        });

        folderElement.addEventListener('dragleave', () => {
            folderElement.classList.remove('dragover');
        });

        folderElement.addEventListener('drop', (event) => {
            event.preventDefault();
            folderElement.classList.remove('dragover');

            const files = Array.from(event.dataTransfer.files);
            const videoFiles = files.filter(file => file.type === 'video/mp4');

            videoFiles.forEach(file => saveVideo(file, folder.id));
        });

        const subfolderContainer = document.createElement('ul');
        subfolderContainer.className = 'treeview';
        li.appendChild(subfolderContainer);
    });
}

function toggleSubfolders(folderElement, li, folderId) {
    const subfolderContainer = li.querySelector('.treeview');
    if (!folderElement.classList.contains('expanded')) {
        loadSubfolders(folderId, subfolderContainer);
        folderElement.classList.add('expanded');
    } else {
        subfolderContainer.innerHTML = '';
        folderElement.classList.remove('expanded');
    }
}

function loadSubfolders(parentId, parentElement) {
    const transaction = db.transaction(["folders"], "readonly");
    const folderStore = transaction.objectStore("folders");
    const index = folderStore.index("parentId");
    const query = index.openCursor(IDBKeyRange.only(parentId));

    query.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const folder = cursor.value;
            renderFolders([folder], parentElement);
            cursor.continue();
        }
    };
}

function selectFolder(folderId, folderElement) {
    selectedFolderId = folderId;

    if (selectedFolderElement) {
        selectedFolderElement.classList.remove('selected');
    }

    folderElement.classList.add('selected');
    selectedFolderElement = folderElement;

    loadContent(folderId);
}
