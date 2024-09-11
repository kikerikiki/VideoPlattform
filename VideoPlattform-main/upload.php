<?php
// Zielverzeichnis für die Datei-Uploads
$targetDir = "uploads/";  // Simuliertes Verzeichnis auf Plesk

// Prüfe, ob das Verzeichnis existiert, ansonsten erstelle es
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// Prüfe, ob eine Datei hochgeladen wurde
if (isset($_FILES['file'])) {
    $targetFile = $targetDir . basename($_FILES['file']['name']);

    // Datei verschieben
    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
        echo "Datei erfolgreich hochgeladen: " . htmlspecialchars(basename($_FILES['file']['name']));
    } else {
        echo "Fehler beim Hochladen der Datei.";
    }
} else {
    echo "Keine Datei hochgeladen.";
}
?>