<?php
// Connect to the MySQL database (adjust these settings as needed)
$servername = 'localhost';
$username = 'your_database_username';
$password = 'your_database_password';
$dbname = 'your_database_name';

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

// Endpoint to save response to the database
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['response'])) {
        $response = $data['response'];

        // Insert the response into the database
        $sql = "INSERT INTO responses (response_text) VALUES ('$response')";

        if ($conn->query($sql) === true) {
            http_response_code(200);
            echo json_encode(array('message' => 'Response saved successfully'));
        } else {
            http_response_code(500);
            echo json_encode(array('error' => 'Error saving response'));
        }
    } else {
        http_response_code(400);
        echo json_encode(array('error' => 'Invalid data'));
    }
}

$conn->close();
?>
