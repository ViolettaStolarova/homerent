<?php

namespace App\Middleware;

use App\Services\AuthService;

class AuthMiddleware {
    public function handle() {
        // Try multiple ways to get Authorization header (Apache may not set HTTP_AUTHORIZATION)
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (empty($authHeader) && function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }
        if (empty($authHeader) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        
        error_log('AuthMiddleware: authHeader = ' . ($authHeader ? 'present' : 'empty'));
        
        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            error_log('AuthMiddleware: No valid Bearer token found');
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return false;
        }

        $token = $matches[1];
        error_log('AuthMiddleware: Token extracted, length: ' . strlen($token));
        
        $authService = new AuthService();
        $user = $authService->validateToken($token);

        if (!$user) {
            error_log('AuthMiddleware: Token validation failed');
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            return false;
        }

        error_log('AuthMiddleware: Token validated successfully for user: ' . $user['email']);
        $_SESSION['user'] = $user;
        return true;
    }
}