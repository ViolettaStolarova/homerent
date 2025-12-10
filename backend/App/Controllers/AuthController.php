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
            echo json_encode(['message' => 'Registration successful.', 'user' => $user]);
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
                http_response_code(400);
                echo json_encode(['error' => 'Email и пароль обязательны']);
                return;
            }
            
            $result = $this->authService->login($data['email'], $data['password']);
            
            if (!$result) {
                http_response_code(401);
                echo json_encode(['error' => 'Неверный email или пароль']);
                return;
            }
            
            http_response_code(200);
            echo json_encode($result);
        } catch (\PDOException $e) {
            http_response_code(500);
            error_log('Login PDO error: ' . $e->getMessage());
            echo json_encode(['error' => 'Ошибка базы данных. Попробуйте позже.']);
        } catch (\Exception $e) {
            http_response_code(500);
            error_log('Login error: ' . $e->getMessage());
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