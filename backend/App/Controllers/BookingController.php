<?php

namespace App\Controllers;

use Database;

class BookingController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        $filter = $_GET['filter'] ?? 'all';
        $type = $_GET['type'] ?? 'my_bookings'; // my_bookings or incoming
        
        if ($type === 'incoming') {
            $sql = "
                SELECT b.*, p.title, p.main_image, p.price_per_night,
                       u.full_name as guest_name, u.email as guest_email
                FROM bookings b
                JOIN properties p ON b.property_id = p.id
                JOIN users u ON b.user_id = u.id
                WHERE p.owner_id = ?
            ";
            $params = [$user['id']];
        } else {
            $sql = "
                SELECT b.*, p.title, p.main_image, p.price_per_night,
                       u.full_name as owner_name
                FROM bookings b
                JOIN properties p ON b.property_id = p.id
                JOIN users u ON p.owner_id = u.id
                WHERE b.user_id = ?
            ";
            $params = [$user['id']];
        }
        
        if ($filter !== 'all') {
            $sql .= " AND b.status = ?";
            $params[] = $filter;
        }
        
        $sql .= " ORDER BY b.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll();
        
        foreach ($bookings as &$booking) {
            $booking['total_price'] = $this->calculateTotalPrice(
                $booking['check_in'],
                $booking['check_out'],
                $booking['price_per_night']
            );
        }
        
        echo json_encode($bookings);
    }

    public function show($id) {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        $stmt = $this->db->prepare("
            SELECT b.*, p.*, u.full_name as owner_name
            FROM bookings b
            JOIN properties p ON b.property_id = p.id
            JOIN users u ON p.owner_id = u.id
            WHERE b.id = ? AND (b.user_id = ? OR p.owner_id = ?)
        ");
        $stmt->execute([$id, $user['id'], $user['id']]);
        $booking = $stmt->fetch();
        
        if (!$booking) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
            return;
        }
        
        $booking['total_price'] = $this->calculateTotalPrice(
            $booking['check_in'],
            $booking['check_out'],
            $booking['price_per_night']
        );
        
        echo json_encode($booking);
    }

    public function create() {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Check availability
            if (!$this->isAvailable($data['property_id'], $data['check_in'], $data['check_out'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Property not available for these dates']);
                return;
            }
            
            // Get property price
            $stmt = $this->db->prepare("SELECT price_per_night FROM properties WHERE id = ?");
            $stmt->execute([$data['property_id']]);
            $property = $stmt->fetch();
            
            if (!$property) {
                http_response_code(404);
                echo json_encode(['error' => 'Property not found']);
                return;
            }
            
            $totalPrice = $this->calculateTotalPrice(
                $data['check_in'],
                $data['check_out'],
                $property['price_per_night']
            );
            
            $stmt = $this->db->prepare("
                INSERT INTO bookings (
                    user_id, property_id, check_in, check_out, guests, total_price, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
            ");
            
            $stmt->execute([
                $user['id'],
                $data['property_id'],
                $data['check_in'],
                $data['check_out'],
                $data['guests'],
                $totalPrice
            ]);
            
            $bookingId = $this->db->lastInsertId();
            
            http_response_code(201);
            echo json_encode(['id' => $bookingId, 'message' => 'Booking created successfully']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function cancel($id) {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        $stmt = $this->db->prepare("
            SELECT b.* FROM bookings b
            WHERE b.id = ? AND b.user_id = ?
        ");
        $stmt->execute([$id, $user['id']]);
        $booking = $stmt->fetch();
        
        if (!$booking) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
            return;
        }
        
        if (!in_array($booking['status'], ['pending', 'confirmed'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot cancel this booking']);
            return;
        }
        
        $stmt = $this->db->prepare("
            UPDATE bookings SET status = 'cancelled' WHERE id = ?
        ");
        $stmt->execute([$id]);
        
        echo json_encode(['message' => 'Booking cancelled successfully']);
    }

    public function confirm($id) {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        $stmt = $this->db->prepare("
            SELECT b.* FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE b.id = ? AND p.owner_id = ?
        ");
        $stmt->execute([$id, $user['id']]);
        $booking = $stmt->fetch();
        
        if (!$booking) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
            return;
        }
        
        $stmt = $this->db->prepare("
            UPDATE bookings SET status = 'confirmed' WHERE id = ?
        ");
        $stmt->execute([$id]);
        
        echo json_encode(['message' => 'Booking confirmed successfully']);
    }

    public function reject($id) {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        $stmt = $this->db->prepare("
            SELECT b.* FROM bookings b
            JOIN properties p ON b.property_id = p.id
            WHERE b.id = ? AND p.owner_id = ?
        ");
        $stmt->execute([$id, $user['id']]);
        $booking = $stmt->fetch();
        
        if (!$booking) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
            return;
        }
        
        $stmt = $this->db->prepare("
            UPDATE bookings SET status = 'cancelled' WHERE id = ?
        ");
        $stmt->execute([$id]);
        
        echo json_encode(['message' => 'Booking rejected successfully']);
    }

    private function isAvailable($propertyId, $checkIn, $checkOut) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM bookings
            WHERE property_id = ? AND status IN ('pending', 'confirmed')
            AND (
                (check_in <= ? AND check_out >= ?) OR
                (check_in <= ? AND check_out >= ?) OR
                (check_in >= ? AND check_in < ?)
            )
        ");
        $stmt->execute([$propertyId, $checkOut, $checkIn, $checkIn, $checkOut, $checkIn, $checkOut]);
        $result = $stmt->fetch();
        
        return $result['count'] == 0;
    }

    private function calculateTotalPrice($checkIn, $checkOut, $pricePerNight) {
        $start = new \DateTime($checkIn);
        $end = new \DateTime($checkOut);
        $nights = $start->diff($end)->days;
        return $nights * $pricePerNight;
    }
}

