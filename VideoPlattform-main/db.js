let db;

const request = indexedDB.open("VideoDatabase", 4);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("folders")) {
        const folderStore = db.createObjectStore("folders", { keyPath: "id", autoIncrement: true });
        folderStore.createIndex("name", "name", { unique: false });
        folderStore.createIndex("parentId", "parentId", { unique: false });
    }
    if (!db.objectStoreNames.contains("videos")) {
        const videoStore = db.createObjectStore("videos", { keyPath: "id", autoIncrement: true });
        videoStore.createIndex("folderId", "folderId", { unique: false });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadFolders();
};

request.onerror = (event) => {
    console.error("Database error:", event.target.errorCode);
};
