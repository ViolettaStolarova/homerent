<?php

namespace App\Middleware;

use App\Services\AuthService;

class AuthMiddleware {
    public function handle() {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return false;
        }

        $token = $matches[1];
        $authService = new AuthService();
        $user = $authService->validateToken($token);

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            return false;
        }

        $_SESSION['user'] = $user;
        return true;
    }
}

