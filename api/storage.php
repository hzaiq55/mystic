<?php
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

$dataPath = '../data/';

function checkPermissions() {
    global $dataPath;
    if (!file_exists($dataPath)) {
        return false;
    }
    $perms = substr(sprintf('%o', fileperms($dataPath)), -4);
    return $perms == '0777';
}

function ensureDirectoryExists() {
    global $dataPath;
    if (!file_exists($dataPath)) {
        if (!mkdir($dataPath, 0777, true)) {
            throw new Exception('Failed to create data directory');
        }
        chmod($dataPath, 0777);
    }
    
    if (!checkPermissions()) {
        throw new Exception('Incorrect permissions on data directory. Please set to 777 for development.');
    }
}

function readData($file) {
    global $dataPath;
    $filepath = $dataPath . $file . '.txt';
    if (file_exists($filepath)) {
        return json_decode(file_get_contents($filepath), true);
    }
    return [];
}

function writeData($file, $data) {
    global $dataPath;
    try {
        ensureDirectoryExists();
        $filepath = $dataPath . $file . '.txt';
        
        // Log the attempt
        error_log("Attempting to write to: " . $filepath);
        error_log("Data to write: " . json_encode($data));
        
        if (!is_writable($dataPath)) {
            throw new Exception("Data directory is not writable");
        }
        
        $result = file_put_contents($filepath, json_encode($data));
        if ($result === false) {
            throw new Exception("Failed to write data to file");
        }
        
        error_log("Successfully wrote data to: " . $filepath);
        return true;
    } catch (Exception $e) {
        error_log("Error writing data: " . $e->getMessage());
        throw $e;
    }
}

$action = $_GET['action'] ?? '';
$file = $_GET['file'] ?? '';

// Modify the main request handler
if ($_SERVER['REQUEST_METHOD'] === 'GET' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        ensureDirectoryExists();
        
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            echo json_encode(readData($file));
        } else {
            $input = file_get_contents('php://input');
            error_log("Received POST data: " . $input);
            
            $data = json_decode($input, true);
            if ($data === null) {
                throw new Exception("Invalid JSON received");
            }
            
            writeData($file, $data);
            echo json_encode(['success' => true]);
        }
    } catch (Exception $e) {
        error_log("Error in request handler: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
