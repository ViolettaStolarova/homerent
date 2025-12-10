<?php
session_start();



header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Only set JSON content type if not uploading files
if (empty($_FILES)) {
    header('Content-Type: application/json');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load Composer autoload if present (needed for JWT). If not present, continue but log.
$vendorAutoload = __DIR__ . '/vendor/autoload.php';
if (file_exists($vendorAutoload)) {
    require_once $vendorAutoload;
} else {
    error_log('Warning: vendor/autoload.php not found. JWT may fail. Install composer deps in backend.');
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/autoload.php';

use App\Router\Router;

$router = new Router();
require_once __DIR__ . '/routes/api.php';
$router->dispatch();