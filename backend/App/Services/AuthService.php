<?php

namespace App\Services;

use Database;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthService {
    private $db;
    private $config;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->config = require __DIR__ . '/../../config/config.php';
    }

    public function register($data) {
        $email = $data['email'];
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $fullName = $data['full_name'];
        $username = $data['username'] ?? $email;
        
        $verificationToken = bin2hex(random_bytes(32));

        // For development: auto-verify email (set email_verified = 1)
        // In production, remove email_verified from INSERT and require verification
        $stmt = $this->db->prepare("
            INSERT INTO users (email, password, full_name, username, verification_token, email_verified, created_at)
            VALUES (?, ?, ?, ?, ?, 1, NOW())
        ");

        try {
            $stmt->execute([$email, $password, $fullName, $username, $verificationToken]);
            $userId = $this->db->lastInsertId();
            
            // Send verification email (placeholder)
            $this->sendVerificationEmail($email, $verificationToken);
            
            return ['id' => $userId, 'email' => $email, 'full_name' => $fullName];
        } catch (\PDOException $e) {
            if ($e->getCode() == 23000) {
                if (strpos($e->getMessage(), 'email') !== false) {
                    throw new \Exception('Пользователь с данным email уже зарегистрирован');
                } elseif (strpos($e->getMessage(), 'username') !== false) {
                    throw new \Exception('Пользователь с данным именем уже существует');
                }
                throw new \Exception('Ошибка базы данных');
            }
            throw $e;
        }
    }

    public function verifyEmail($token) {
        $stmt = $this->db->prepare("
            UPDATE users 
            SET email_verified = 1, verification_token = NULL 
            WHERE verification_token = ?
        ");
        $stmt->execute([$token]);
        
        return $stmt->rowCount() > 0;
    }

    public function login($email, $password) {
        $stmt = $this->db->prepare("
            SELECT id, email, password, full_name, username, role, email_verified, blocked
            FROM users 
            WHERE email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            return null;
        }

        if (!password_verify($password, $user['password'])) {
            return null;
        }

        if ($user['blocked']) {
            throw new \Exception('Аккаунт заблокирован');
        }

        if (!$user['email_verified']) {
            throw new \Exception('Email не подтвержден. Пожалуйста, проверьте почту.');
        }

        $token = $this->generateToken($user);
        
        return [
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ];
    }

    public function generateToken($user) {
        $payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + $this->config['jwt_expiration']
        ];

        return JWT::encode($payload, $this->config['jwt_secret'], 'HS256');
    }

    public function validateToken($token) {
        try {
            $decoded = JWT::decode($token, new Key($this->config['jwt_secret'], 'HS256'));
            
            $stmt = $this->db->prepare("
                SELECT id, email, full_name, username, role, blocked
                FROM users 
                WHERE id = ? AND blocked = 0
            ");
            $stmt->execute([$decoded->user_id]);
            $user = $stmt->fetch();
            
            return $user ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function forgotPassword($email) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            $resetToken = bin2hex(random_bytes(32));
            $stmt = $this->db->prepare("
                UPDATE users 
                SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR)
                WHERE id = ?
            ");
            $stmt->execute([$resetToken, $user['id']]);
            
            // Send reset email (placeholder)
            $this->sendResetEmail($email, $resetToken);
        }

        return true;
    }

    public function resetPassword($token, $newPassword) {
        $stmt = $this->db->prepare("
            SELECT id FROM users 
            WHERE reset_token = ? AND reset_token_expires > NOW()
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            return false;
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("
            UPDATE users 
            SET password = ?, reset_token = NULL, reset_token_expires = NULL
            WHERE id = ?
        ");
        $stmt->execute([$hashedPassword, $user['id']]);

        return true;
    }

    private function sendVerificationEmail($email, $token) {
        // Placeholder - implement email sending
        $link = "http://localhost:5173/verify-email?token={$token}";
        // mail($email, 'Verify your email', "Click here: {$link}");
    }

    private function sendResetEmail($email, $token) {
        // Placeholder - implement email sending
        $link = "http://localhost:5173/reset-password?token={$token}";
        // mail($email, 'Reset password', "Click here: {$link}");
    }
}

