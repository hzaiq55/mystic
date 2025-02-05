<?php
header('Content-Type: application/json');

// Get the users data from the POST request
$users = json_decode(file_get_contents('php://input'), true);

if ($users === null) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Save to users.txt
$result = file_put_contents('../data/users.txt', json_encode($users));

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save users']);
} else {
    echo json_encode(['success' => true]);
}
?>
