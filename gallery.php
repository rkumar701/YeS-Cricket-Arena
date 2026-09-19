```php
<?php

/*
=================================================
 YES CRICKET ARENA
 AUTOMATIC GALLERY SYSTEM
=================================================

This script scans the /gallery/ folder and
returns all supported image files as JSON.

Supported:
JPG
JPEG
PNG
WEBP
GIF
AVIF

=================================================
*/


header("Content-Type: application/json; charset=UTF-8");


// Gallery folder

$galleryFolder = __DIR__ . "/gallery/";


// URL used by browser

$galleryURL = "gallery/";


// Supported image formats

$allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "avif"
];


// Check folder

if (!is_dir($galleryFolder)) {

    echo json_encode([]);

    exit;

}


// Get files

$files = scandir($galleryFolder);


// Store images

$images = [];


foreach ($files as $file) {


    // Ignore hidden/system files

    if ($file === "." || $file === "..") {
        continue;
    }


    // Full file path

    $filePath =
        $galleryFolder . $file;


    // Make sure it is actually a file

    if (!is_file($filePath)) {
        continue;
    }


    // Get extension

    $extension =
        strtolower(
            pathinfo(
                $file,
                PATHINFO_EXTENSION
            )
        );


    // Check extension

    if (
        !in_array(
            $extension,
            $allowedExtensions,
            true
        )
    ) {
        continue;
    }


    // URL encode filename

    $safeFileName =
        rawurlencode($file);


    // Add image

    $images[] =
        $galleryURL . $safeFileName;

}


// Sort alphabetically

sort(
    $images,
    SORT_NATURAL | SORT_FLAG_CASE
);


// Return JSON

echo json_encode(
    $images,
    JSON_UNESCAPED_SLASHES
);

?>
```
