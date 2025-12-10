<?php

namespace App\Middleware;

use App\Services\AuthService;

class AdminMiddleware {
    public function handle() {
        // First check session (if user logged in via session)
        $user = $_SESSION['user'] ?? null;
        
        // If no session user, try to get from JWT token
        if (!$user) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            if (empty($authHeader) && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            }
            if (empty($authHeader) && function_exists('getallheaders')) {
                $headers = getallheaders();
                $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            }
            
            if (!empty($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
                $authService = new AuthService();
                $user = $authService->validateToken($token);
                
                if ($user) {
                    $_SESSION['user'] = $user;
                }
            }
        }
        
        if (!$user) {
            error_log('AdminMiddleware: No user found');
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return false;
        }
        
        if ($user['role'] !== 'admin') {
            error_log('AdminMiddleware: User role is ' . ($user['role'] ?? 'null') . ', expected admin');
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return false;
        }
        
        error_log('AdminMiddleware: Admin access granted for user: ' . $user['email']);
        return true;
    }
}

