<?php

namespace App\Controllers;

use Database;
use PDO;

class FavoriteController {
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
        
        $stmt = $this->db->prepare("
            SELECT 
                p.*,
                u.full_name as owner_name,
                (SELECT AVG(rating) FROM reviews WHERE property_id = p.id) as rating,
                (SELECT image_url FROM property_images WHERE property_id = p.id AND is_main = 1 LIMIT 1) as main_image
            FROM favorites f
            JOIN properties p ON f.property_id = p.id
            LEFT JOIN users u ON p.owner_id = u.id
            WHERE f.user_id = ? AND p.status = 'active'
            ORDER BY f.created_at DESC
        ");
        $stmt->execute([$user['id']]);
        $properties = $stmt->fetchAll();
        
        foreach ($properties as &$property) {
            $property['amenities'] = $this->getPropertyAmenities($property['id']);
        }
        
        echo json_encode($properties);
    }

    public function toggle() {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $propertyId = $data['property_id'] ?? null;
            
            if (!$propertyId) {
                throw new \Exception('Property ID is required');
            }
            
            // Check if already favorited
            $stmt = $this->db->prepare("
                SELECT id FROM favorites WHERE user_id = ? AND property_id = ?
            ");
            $stmt->execute([$user['id'], $propertyId]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                // Remove from favorites
                $stmt = $this->db->prepare("
                    DELETE FROM favorites WHERE user_id = ? AND property_id = ?
                ");
                $stmt->execute([$user['id'], $propertyId]);
                echo json_encode(['is_favorite' => false, 'message' => 'Removed from favorites']);
            } else {
                // Add to favorites
                $stmt = $this->db->prepare("
                    INSERT INTO favorites (user_id, property_id, created_at) VALUES (?, ?, NOW())
                ");
                $stmt->execute([$user['id'], $propertyId]);
                echo json_encode(['is_favorite' => true, 'message' => 'Added to favorites']);
            }
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function getPropertyAmenities($propertyId) {
        $stmt = $this->db->prepare("
            SELECT amenity FROM property_amenities WHERE property_id = ?
        ");
        $stmt->execute([$propertyId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}