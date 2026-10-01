<?php

declare(strict_types=1);

const DOG_API_BASE = 'https://api.thedogapi.com/v1';
const DOG_API_KEY_FILE = '/etc/dogs-api-app/api-key';

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function fail(int $status, string $message): never
{
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_SLASHES);
    exit;
}

$action = $_GET['action'] ?? '';

if (!is_string($action)) {
    fail(400, 'Invalid request.');
}

$apiKey = @file_get_contents(DOG_API_KEY_FILE);

if ($apiKey === false || trim($apiKey) === '') {
    fail(500, 'API configuration unavailable.');
}

$apiKey = trim($apiKey);

switch ($action) {
    case 'breeds':
        $url = DOG_API_BASE . '/breeds';
        break;

    case 'image':
        $breedId = filter_input(
            INPUT_GET,
            'breed_id',
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        );

        if ($breedId === false || $breedId === null) {
            fail(400, 'Invalid breed ID.');
        }

        $url = DOG_API_BASE
            . '/images/search?include_breed=1&breed_id='
            . rawurlencode((string) $breedId);
        break;

    default:
        fail(404, 'Unknown API action.');
}

$ch = curl_init($url);

if ($ch === false) {
    fail(500, 'Unable to initialise API request.');
}

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'x-api-key: ' . $apiKey,
    ],
]);

$response = curl_exec($ch);

if ($response === false) {
    curl_close($ch);
    fail(502, 'Upstream API unavailable.');
}

$status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

curl_close($ch);

if ($status < 200 || $status >= 300) {
    fail(502, 'Upstream API returned an error.');
}

if (
    !is_string($contentType)
    || stripos($contentType, 'application/json') === false
) {
    fail(502, 'Unexpected upstream response.');
}

json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    fail(502, 'Invalid upstream response.');
}

echo $response;
