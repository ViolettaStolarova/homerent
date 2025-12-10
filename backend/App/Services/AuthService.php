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

        $stmt = $this->db->prepare("
            INSERT INTO users (email, password, full_name, username, email_verified, created_at)
            VALUES (?, ?, ?, ?, 1, NOW())
        ");

        try {
            $stmt->execute([$email, $password, $fullName, $username]);
            $userId = $this->db->lastInsertId();
            
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

    public function login($email, $password) {
        try {
            $stmt = $this->db->prepare("
                SELECT id, email, password, full_name, username, role, blocked
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
        } catch (\Exception $e) {
            error_log('AuthService login error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function generateToken($user) {
        if (empty($this->config['jwt_secret'])) {
            throw new \Exception('JWT secret is not configured');
        }
        
        if (empty($user['id']) || empty($user['email']) || empty($user['role'])) {
            throw new \Exception('Invalid user data for token generation');
        }
        
        $payload = [
            'user_id' => (int)$user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + (int)$this->config['jwt_expiration']
        ];

        try {
            return JWT::encode($payload, $this->config['jwt_secret'], 'HS256');
        } catch (\Exception $e) {
            error_log('JWT encode error: ' . $e->getMessage());
            throw new \Exception('Failed to generate authentication token');
        }
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

}