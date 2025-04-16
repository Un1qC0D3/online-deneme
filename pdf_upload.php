<?php
ob_clean(); // Buffer'daki gereksiz çıktıyı siler
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");


$uploadDir = __DIR__ . "/pdf";

// 1. Klasörü temizle (yalnızca PDF dosyaları)
$files = glob($uploadDir . '/*.pdf');
foreach ($files as $file) {
    if (is_file($file)) {
        unlink($file);
    }
}

// 2. Dosya yükleme ve isimlendirme
$response = [];

if (isset($_FILES['sozel'])) {
    $sozelPath = $uploadDir . "/sozel.pdf";
    if (move_uploaded_file($_FILES['sozel']['tmp_name'], $sozelPath)) {
        $response['sozel'] = "✔️ Sözel dosyası yüklendi.";
    } else {
        $response['sozel'] = "❌ Sözel dosyası yüklenemedi.";
    }
}

if (isset($_FILES['sayisal'])) {
    $sayisalPath = $uploadDir . "/sayisal.pdf";
    if (move_uploaded_file($_FILES['sayisal']['tmp_name'], $sayisalPath)) {
        $response['sayisal'] = "✔️ Sayısal dosyası yüklendi.";
    } else {
        $response['sayisal'] = "❌ Sayısal dosyası yüklenemedi.";
    }
}

// 3. Yanıtı gönder
header('Content-Type: application/json; charset=utf-8');
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;
?>
