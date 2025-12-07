<?php

namespace App\Controllers;

use Database;

class ReviewController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
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
            
            if (empty($data['property_id']) || empty($data['rating'])) {
                throw new \Exception('Property ID and rating are required');
            }
            
            // Check if user has completed booking for this property
            $stmt = $this->db->prepare("
                SELECT id FROM bookings
                WHERE user_id = ? AND property_id = ? AND status = 'completed'
            ");
            $stmt->execute([$user['id'], $data['property_id']]);
            $booking = $stmt->fetch();
            
            if (!$booking) {
                http_response_code(400);
                echo json_encode(['error' => 'You can only review properties you have booked']);
                return;
            }
            
            // Check if already reviewed
            $stmt = $this->db->prepare("
                SELECT id FROM reviews WHERE user_id = ? AND property_id = ?
            ");
            $stmt->execute([$user['id'], $data['property_id']]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                // Update existing review
                $stmt = $this->db->prepare("
                    UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([
                    $data['rating'],
                    $data['comment'] ?? null,
                    $existing['id']
                ]);
                $reviewId = $existing['id'];
            } else {
                // Create new review
                $stmt = $this->db->prepare("
                    INSERT INTO reviews (user_id, property_id, rating, comment, created_at)
                    VALUES (?, ?, ?, ?, NOW())
                ");
                $stmt->execute([
                    $user['id'],
                    $data['property_id'],
                    $data['rating'],
                    $data['comment'] ?? null
                ]);
                $reviewId = $this->db->lastInsertId();
            }
            
            // Recalculate property rating
            $this->updatePropertyRating($data['property_id']);
            
            http_response_code(201);
            echo json_encode(['id' => $reviewId, 'message' => 'Review saved successfully']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function updatePropertyRating($propertyId) {
        $stmt = $this->db->prepare("
            SELECT AVG(rating) as avg_rating FROM reviews WHERE property_id = ?
        ");
        $stmt->execute([$propertyId]);
        $result = $stmt->fetch();
        
        // Note: We don't store rating in properties table, we calculate it on the fly
        // But if you want to cache it, you can update properties table here
    }
}

