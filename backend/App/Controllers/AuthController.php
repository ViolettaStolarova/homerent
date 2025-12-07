<?php

namespace App\Controllers;

use App\Services\AuthService;

class AuthController {
    private $authService;

    public function __construct() {
        $this->authService = new AuthService();
    }

    public function register() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $this->validateRegister($data);
            
            $user = $this->authService->register($data);
            
            http_response_code(201);
            echo json_encode(['message' => 'Registration successful. Please verify your email.', 'user' => $user]);
        } catch (\PDOException $e) {
            http_response_code(400);
            if ($e->getCode() == 23000) {
                // Extract field name from error message
                if (strpos($e->getMessage(), 'email') !== false) {
                    echo json_encode(['error' => 'Пользователь с данным email уже зарегистрирован']);
                } elseif (strpos($e->getMessage(), 'username') !== false) {
                    echo json_encode(['error' => 'Пользователь с данным именем уже существует']);
                } else {
                    echo json_encode(['error' => 'Ошибка базы данных. Попробуйте позже.']);
                }
            } else {
                echo json_encode(['error' => $e->getMessage()]);
            }
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function login() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['email']) || empty($data['password'])) {
                throw new \Exception('Email и пароль обязательны');
            }
            
            $result = $this->authService->login($data['email'], $data['password']);
            
            if (!$result) {
                http_response_code(401);
                echo json_encode(['error' => 'Неверный email или пароль']);
                return;
            }
            
            echo json_encode($result);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function verifyEmail() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['token'])) {
                throw new \Exception('Token is required');
            }
            
            $success = $this->authService->verifyEmail($data['token']);
            
            if (!$success) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid token']);
                return;
            }
            
            echo json_encode(['message' => 'Email verified successfully']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function forgotPassword() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['email'])) {
                throw new \Exception('Email is required');
            }
            
            $this->authService->forgotPassword($data['email']);
            
            echo json_encode(['message' => 'If email exists, reset link has been sent']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function resetPassword() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['token']) || empty($data['password'])) {
                throw new \Exception('Token and password are required');
            }
            
            $success = $this->authService->resetPassword($data['token'], $data['password']);
            
            if (!$success) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid or expired token']);
                return;
            }
            
            echo json_encode(['message' => 'Password reset successfully']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function me() {
        $user = $_SESSION['user'] ?? null;
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        echo json_encode(['user' => $user]);
    }

    private function validateRegister($data) {
        if (empty($data['email']) || empty($data['password']) || empty($data['full_name'])) {
            throw new \Exception('Email, password and full name are required');
        }
        
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \Exception('Invalid email format');
        }
        
        if (strlen($data['password']) < 6) {
            throw new \Exception('Password must be at least 6 characters');
        }
    }
}