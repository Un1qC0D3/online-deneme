<?php
ob_clean();
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$uploadDir = __DIR__ . "/pdf";

// 1. PDF klasörünü temizle (sadece PDF ve TXT dosyaları)
$allowedExtensions = ['pdf', 'txt'];
foreach (glob($uploadDir . '/*') as $file) {
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    if (in_array(strtolower($ext), $allowedExtensions) && is_file($file)) {
        unlink($file);
    }
}

// 2. Dosya yükleme ve isimlendirme
$response = [];

if (isset($_FILES['sozel'])) {
    $path = $uploadDir . "/sozel.pdf";
    if (move_uploaded_file($_FILES['sozel']['tmp_name'], $path)) {
        $response['sozel'] = "✔️ Sözel dosyası yüklendi.";
    } else {
        $response['sozel'] = "❌ Sözel dosyası yüklenemedi.";
    }
}

if (isset($_FILES['sayisal'])) {
    $path = $uploadDir . "/sayisal.pdf";
    if (move_uploaded_file($_FILES['sayisal']['tmp_name'], $path)) {
        $response['sayisal'] = "✔️ Sayısal dosyası yüklendi.";
    } else {
        $response['sayisal'] = "❌ Sayısal dosyası yüklenemedi.";
    }
}

if (isset($_FILES['cevap'])) {
    $path = $uploadDir . "/cevap.txt";
    if (move_uploaded_file($_FILES['cevap']['tmp_name'], $path)) {
        $response['cevap'] = "✔️ Cevap anahtarı yüklendi.";
    } else {
        $response['cevap'] = "❌ Cevap anahtarı yüklenemedi.";
    }
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;
?>
