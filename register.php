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
        $mail = new PHPMailer(true);

try {
    // 邮件服务器设置
        $mail->CharSet = "UTF-8";
        $mail->SMTPDebug = 0;
        $mail->isSMTP();
        $mail->Host = 'smtp.qq.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'jeffery.lyu@qq.com';
        $mail->Password = 'ripbxgbbtimfdcib';
        $mail->SMTPSecure = 'ssl';
        $mail->Port = 465;

    // 收件人设置
    $mail->setFrom('jeffery.lyu@qq.com', 'Registery');
    $mail->addAddress($email); // 添加收件人

    // 邮件内容设置
    $mail->isHTML(true);
$mail->Subject = '[CarbonTrack]账号注册成功通知 Account Registration Success Notification';
$mail->Body = "<p>尊敬的用户，Dear user, </p>
<p>感谢您选择注册我们的小程序！我们很高兴地通知您，您的账号已成功注册。Thank you for choosing our platform! We are thrilled to inform you that your account has been successfully registered.</p>
<p>您现在可以开始享受我们小程序提供的各种功能和服务。我们致力于为您提供优质的体验，并不断改进和更新我们的功能，以满足您的需求。You can now start enjoying the various functions and services offered by our platform. We are committed to providing you with a quality experience and are constantly improving and updating our features to meet your needs.</p>
<p>如果您在使用过程中遇到任何问题或有任何建议，我们的团队将随时为您提供帮助和支持。请随时联系我们，我们期待为您提供最佳的用户体验。If you encounter any problems or have any suggestions during use, our team will be ready to help and support you. Please feel free to contact us and we look forward to providing you with the best user experience.</p>
<p>再次感谢您对我们小程序的支持和信任！祝您使用愉快！Thanks again for your support and trust in our platform! Wish you a happy use!</p>
<p>诚挚的问候，Sincere regards,<br>CarbonTrack</p>";


    $mail->send();
} catch (Exception $e) {
    
}
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    echo json_encode(['success'=>true]);
} else {
    echo json_encode(['success' => false]);
    exit;
}
?>
