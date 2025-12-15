<?php

namespace App\Controllers;

use Database;

class UserController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function profile() {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        $stmt = $this->db->prepare("
            SELECT id, email, full_name, username, phone, avatar_url, created_at
            FROM users WHERE id = ?
        ");
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch();
        
        echo json_encode($profile);
    }

    public function updateProfile() {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $this->db->prepare("
                UPDATE users SET
                    full_name = ?, username = ?, phone = ?, avatar_url = ?
                WHERE id = ?
            ");
            
            $stmt->execute([
                $data['full_name'] ?? null,
                $data['username'] ?? null,
                $data['phone'] ?? null,
                $data['avatar_url'] ?? null,
                $user['id']
            ]);
            
            echo json_encode(['message' => 'Profile updated successfully']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function changePassword() {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['old_password']) || empty($data['new_password'])) {
                throw new \Exception('Old and new passwords are required');
            }
            
            $stmt = $this->db->prepare("SELECT password FROM users WHERE id = ?");
            $stmt->execute([$user['id']]);
            $userData = $stmt->fetch();
            
            if (!password_verify($data['old_password'], $userData['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid old password']);
                return;
            }
            
            $newPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("UPDATE users SET password = ? WHERE id = ?");
            $stmt->execute([$newPassword, $user['id']]);
            
            echo json_encode(['message' => 'Password changed successfully']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function myProperties() {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        $stmt = $this->db->prepare("
            SELECT 
                p.*,
                (SELECT COUNT(*) FROM bookings WHERE property_id = p.id) as booking_count,
                (SELECT COUNT(*) FROM property_views WHERE property_id = p.id) as view_count,
                (SELECT image_url FROM property_images WHERE property_id = p.id AND is_main = 1 LIMIT 1) as main_image
            FROM properties p
            WHERE p.owner_id = ? AND p.status != 'deleted'
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$user['id']]);
        $properties = $stmt->fetchAll();
        
        echo json_encode($properties);
    }

    public function incomingBookings() {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        $filter = $_GET['filter'] ?? 'all';
        
        $sql = "
            SELECT 
                b.*,
                p.title,
                p.price_per_night,
                u.full_name as guest_name,
                u.email as guest_email,
                (SELECT image_url FROM property_images WHERE property_id = p.id AND is_main = 1 LIMIT 1) as main_image
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN users u ON b.user_id = u.id
            WHERE p.owner_id = ?
        ";
        
        $params = [$user['id']];
        
        if ($filter === 'confirmed') {
            $sql .= " AND b.status = 'confirmed'";
        } elseif ($filter === 'rejected') {
            $sql .= " AND b.status = 'cancelled'";
        }
        
        $sql .= " ORDER BY b.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll();
        
        $countStmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE p.owner_id = ? AND b.status = 'pending' AND b.viewed = 0
        ");
        $countStmt->execute([$user['id']]);
        $unreadCount = $countStmt->fetch()['count'];
        
        foreach ($bookings as &$booking) {
            $booking['total_price'] = $this->calculateTotalPrice(
                $booking['check_in'],
                $booking['check_out'],
                $booking['price_per_night']
            );
        }
        
        echo json_encode([
            'bookings' => $bookings,
            'unread_count' => (int)$unreadCount
        ]);
    }

    private function calculateTotalPrice($checkIn, $checkOut, $pricePerNight) {
        $start = new \DateTime($checkIn);
        $end = new \DateTime($checkOut);
        $nights = $start->diff($end)->days;
        return $nights * $pricePerNight;
    }
}