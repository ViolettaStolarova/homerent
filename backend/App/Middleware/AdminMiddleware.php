<?php

namespace App\Middleware;

class AdminMiddleware {
    public function handle() {
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return false;
        }
        return true;
    }
}

