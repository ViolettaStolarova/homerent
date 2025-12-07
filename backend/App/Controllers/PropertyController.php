<?php

namespace App\Controllers;

use Database;
use PDO;

class PropertyController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 12;
        $offset = ($page - 1) * $limit;
        
        $city = $_GET['city'] ?? null;
        $checkIn = $_GET['check_in'] ?? null;
        $checkOut = $_GET['check_out'] ?? null;
        $guests = $_GET['guests'] ?? null;
        $propertyType = $_GET['property_type'] ?? null;
        $minPrice = $_GET['min_price'] ?? null;
        $maxPrice = $_GET['max_price'] ?? null;
        $sortBy = $_GET['sort_by'] ?? 'date_desc';
        
        $where = ["p.status = 'active'"];
        $params = [];
        
        if ($city) {
            $where[] = "p.city LIKE ?";
            $params[] = "%{$city}%";
        }
        
        if ($propertyType) {
            $where[] = "p.property_type = ?";
            $params[] = $propertyType;
        }
        
        if ($minPrice) {
            $where[] = "p.price_per_night >= ?";
            $params[] = $minPrice;
        }
        
        if ($maxPrice) {
            $where[] = "p.price_per_night <= ?";
            $params[] = $maxPrice;
        }
        
        if ($guests) {
            $where[] = "p.max_guests >= ?";
            $params[] = $guests;
        }
        
        $whereClause = implode(' AND ', $where);
        
        $orderBy = $this->getOrderBy($sortBy);
        
        // Check availability if dates provided
        $availabilityJoin = "";
        if ($checkIn && $checkOut) {
            $availabilityJoin = "
                LEFT JOIN bookings b ON p.id = b.property_id 
                AND b.status IN ('pending', 'confirmed')
                AND (
                    (b.check_in <= ? AND b.check_out >= ?) OR
                    (b.check_in <= ? AND b.check_out >= ?) OR
                    (b.check_in >= ? AND b.check_in < ?)
                )
            ";
            $params = array_merge([$checkOut, $checkIn, $checkIn, $checkOut, $checkIn, $checkOut], $params);
            $whereClause .= " AND b.id IS NULL";
        }
        
        $sql = "
            SELECT 
                p.*,
                u.full_name as owner_name,
                u.username as owner_username,
                CAST((SELECT AVG(rating) FROM reviews WHERE property_id = p.id) AS DECIMAL(3,2)) as rating,
                (SELECT COUNT(*) FROM reviews WHERE property_id = p.id) as review_count,
                (SELECT image_url FROM property_images WHERE property_id = p.id AND is_main = 1 LIMIT 1) as main_image
            FROM properties p
            LEFT JOIN users u ON p.owner_id = u.id
            {$availabilityJoin}
            WHERE {$whereClause}
            GROUP BY p.id
            {$orderBy}
            LIMIT ? OFFSET ?
        ";
        
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $properties = $stmt->fetchAll();
        
        // Get total count
        $countSql = "
            SELECT COUNT(DISTINCT p.id) as total
            FROM properties p
            {$availabilityJoin}
            WHERE {$whereClause}
        ";
        $countParams = array_slice($params, 0, -2);
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($countParams);
        $total = $countStmt->fetch()['total'];
        
        foreach ($properties as &$property) {
            $property['amenities'] = $this->getPropertyAmenities($property['id']);
            $property['images'] = $this->getPropertyImages($property['id']);
        }
        
        echo json_encode([
            'properties' => $properties,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }

    public function show($id) {
        $stmt = $this->db->prepare("
            SELECT 
                p.*,
                u.full_name as owner_name,
                u.username as owner_username,
                u.created_at as owner_since,
                CAST((SELECT AVG(rating) FROM reviews WHERE property_id = p.id) AS DECIMAL(3,2)) as rating,
                (SELECT COUNT(*) FROM reviews WHERE property_id = p.id) as review_count
            FROM properties p
            LEFT JOIN users u ON p.owner_id = u.id
            WHERE p.id = ? AND p.status = 'active'
        ");
        $stmt->execute([$id]);
        $property = $stmt->fetch();
        
        if (!$property) {
            http_response_code(404);
            echo json_encode(['error' => 'Property not found']);
            return;
        }
        
        $property['amenities'] = $this->getPropertyAmenities($id);
        $property['images'] = $this->getPropertyImages($id);
        $property['reviews'] = $this->getPropertyReviews($id);
        $property['unavailable_dates'] = $this->getUnavailableDates($id);
        
        echo json_encode($property);
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
            
            $this->validateProperty($data);
            
            $stmt = $this->db->prepare("
                INSERT INTO properties (
                    owner_id, property_type, title, description, address, city,
                    max_guests, bedrooms, beds, bathrooms, price_per_night, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
            ");
            
            $stmt->execute([
                $user['id'],
                $data['property_type'],
                $data['title'],
                $data['description'],
                $data['address'],
                $data['city'],
                $data['max_guests'],
                $data['bedrooms'],
                $data['beds'],
                $data['bathrooms'],
                $data['price_per_night']
            ]);
            
            $propertyId = $this->db->lastInsertId();
            
            // Save amenities
            if (!empty($data['amenities'])) {
                $this->saveAmenities($propertyId, $data['amenities']);
            }
            
            // Save images
            if (!empty($data['images'])) {
                $this->saveImages($propertyId, $data['images']);
            }
            
            http_response_code(201);
            echo json_encode(['id' => $propertyId, 'message' => 'Property created successfully']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        // Check ownership
        $stmt = $this->db->prepare("SELECT owner_id FROM properties WHERE id = ?");
        $stmt->execute([$id]);
        $property = $stmt->fetch();
        
        if (!$property || $property['owner_id'] != $user['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }
        
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $this->db->prepare("
                UPDATE properties SET
                    property_type = ?, title = ?, description = ?, address = ?, city = ?,
                    max_guests = ?, bedrooms = ?, beds = ?, bathrooms = ?, price_per_night = ?
                WHERE id = ?
            ");
            
            $stmt->execute([
                $data['property_type'],
                $data['title'],
                $data['description'],
                $data['address'],
                $data['city'],
                $data['max_guests'],
                $data['bedrooms'],
                $data['beds'],
                $data['bathrooms'],
                $data['price_per_night'],
                $id
            ]);
            
            // Update amenities
            $this->db->prepare("DELETE FROM property_amenities WHERE property_id = ?")->execute([$id]);
            if (!empty($data['amenities'])) {
                $this->saveAmenities($id, $data['amenities']);
            }
            
            // Update images
            if (!empty($data['images'])) {
                $this->db->prepare("DELETE FROM property_images WHERE property_id = ?")->execute([$id]);
                $this->saveImages($id, $data['images']);
            }
            
            echo json_encode(['message' => 'Property updated successfully']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        $stmt = $this->db->prepare("SELECT owner_id FROM properties WHERE id = ?");
        $stmt->execute([$id]);
        $property = $stmt->fetch();
        
        if (!$property || $property['owner_id'] != $user['id']) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }
        
        $stmt = $this->db->prepare("UPDATE properties SET status = 'deleted' WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['message' => 'Property deleted successfully']);
    }

    private function getPropertyAmenities($propertyId) {
        $stmt = $this->db->prepare("
            SELECT amenity FROM property_amenities WHERE property_id = ?
        ");
        $stmt->execute([$propertyId]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    private function getPropertyImages($propertyId) {
        $stmt = $this->db->prepare("
            SELECT id, image_url, is_main FROM property_images WHERE property_id = ? ORDER BY is_main DESC, id ASC
        ");
        $stmt->execute([$propertyId]);
        return $stmt->fetchAll();
    }

    private function getPropertyReviews($propertyId) {
        $stmt = $this->db->prepare("
            SELECT r.*, u.full_name, u.username
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.property_id = ? ORDER BY r.created_at DESC
        ");
        $stmt->execute([$propertyId]);
        return $stmt->fetchAll();
    }

    private function getUnavailableDates($propertyId) {
        $stmt = $this->db->prepare("
            SELECT check_in, check_out FROM bookings
            WHERE property_id = ? AND status IN ('pending', 'confirmed')
            AND check_out >= CURDATE()
        ");
        $stmt->execute([$propertyId]);
        return $stmt->fetchAll();
    }

    private function saveAmenities($propertyId, $amenities) {
        $stmt = $this->db->prepare("INSERT INTO property_amenities (property_id, amenity) VALUES (?, ?)");
        foreach ($amenities as $amenity) {
            $stmt->execute([$propertyId, $amenity]);
        }
    }

    private function saveImages($propertyId, $images) {
        $stmt = $this->db->prepare("
            INSERT INTO property_images (property_id, image_url, is_main) VALUES (?, ?, ?)
        ");
        foreach ($images as $index => $image) {
            $isMain = $index === 0 ? 1 : 0;
            $stmt->execute([$propertyId, $image, $isMain]);
        }
    }

    private function getOrderBy($sortBy) {
        $orderMap = [
            'rating_desc' => 'ORDER BY rating DESC',
            'rating_asc' => 'ORDER BY rating ASC',
            'price_desc' => 'ORDER BY p.price_per_night DESC',
            'price_asc' => 'ORDER BY p.price_per_night ASC',
            'date_desc' => 'ORDER BY p.created_at DESC',
            'date_asc' => 'ORDER BY p.created_at ASC'
        ];
        
        return $orderMap[$sortBy] ?? $orderMap['date_desc'];
    }

    private function validateProperty($data) {
        $required = ['property_type', 'title', 'description', 'address', 'city', 'max_guests', 'bedrooms', 'beds', 'bathrooms', 'price_per_night'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new \Exception("Field {$field} is required");
            }
        }
        
        if (strlen($data['description']) < 500) {
            throw new \Exception('Description must be at least 500 characters');
        }
    }
}