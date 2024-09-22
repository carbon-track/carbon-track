<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'src/Exception.php';
require 'src/PHPMailer.php';
require 'src/SMTP.php';
require 'db.php'; // Include the database connection

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email'], $_POST['regusername'], $_POST['regpassword'], $_POST['verificationCode'])) {
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $username = filter_input(INPUT_POST, 'regusername', FILTER_SANITIZE_STRING);
    $password = $_POST['regpassword']; // Password will be hashed, no need to sanitize
    $verificationCode = filter_input(INPUT_POST, 'verificationCode', FILTER_SANITIZE_NUMBER_INT);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Invalid Email address.']);
        exit;
    }

    if ($verificationCode != $_SESSION['verification_code']||empty($verificationCode)) {
        echo json_encode(['success' => false, 'error' => 'Incorrect Verification Code.']);
        exit;
    }

    // Check if username exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'error' => 'Username has been registered.']);
        exit;
    }

    // Check if email exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'error' => 'Email has been registered.']);
        exit;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO users (username, password, email) VALUES (:username, :password, :email)");
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':email', $email);

    try {
        $stmt->execute();
        unset($_SESSION['verification_code']); // Clear the verification code

        // Initialize cURL session
        $ch = curl_init();

        // Set cURL options
        curl_setopt($ch, CURLOPT_URL, "http://localhost:11451/rsm.php");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['email' => $email]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // Execute cURL session
        $response = curl_exec($ch);

        // Check for errors
        if (curl_errno($ch)) {
            echo json_encode(['success' => false, 'error' => 'Curl error: ' . curl_error($ch)]);
        } else {
            echo json_encode(['success' => true]);
        }

        // Close cURL session
        curl_close($ch);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false]);
    exit;
}
?>
