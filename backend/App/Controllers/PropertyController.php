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

    public function uploadImage() {
        error_log('uploadImage called');
        error_log('POST data: ' . print_r($_POST, true));
        error_log('FILES data: ' . print_r($_FILES, true));
        

            $config = require __DIR__ . '/../../config/config.php';
            
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            error_log('uploadImage: No user in session');
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        
        if (!isset($_FILES['image'])) {
            error_log('uploadImage: No FILES[image] set');
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            return;
        }
        
        if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            error_log('uploadImage: Upload error code: ' . $_FILES['image']['error']);
            http_response_code(400);
            echo json_encode(['error' => 'Upload error: ' . $_FILES['image']['error']]);
            return;
        }
        
        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed']);
            return;
        }
        
        if ($file['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(['error' => 'File size exceeds 10MB limit']);
            return;
        }
        
        // Use absolute path to uploads directory
        // PropertyController is in App/Controllers, so go up to backend root
        $basePath = __DIR__ . '/../../uploads/';
        
        // Resolve the path
        $resolvedPath = realpath(dirname($basePath));
        if ($resolvedPath === false) {
            // Directory doesn't exist, try to create it
            $resolvedPath = dirname($basePath);
            if (!is_dir($resolvedPath)) {
                if (!mkdir($resolvedPath, 0755, true)) {
                    error_log('Failed to create upload directory parent: ' . $resolvedPath);
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to create upload directory']);
                    return;
                }
            }
            $resolvedPath = realpath($resolvedPath);
        }
        
        $uploadPath = $resolvedPath . '/uploads/';
        
        // Create uploads directory if it doesn't exist
        if (!is_dir($uploadPath)) {
            if (!mkdir($uploadPath, 0777, true)) {
                error_log('Failed to create upload directory: ' . $uploadPath);
                error_log('Parent directory: ' . $resolvedPath);
                error_log('Parent is writable: ' . (is_writable($resolvedPath) ? 'yes' : 'no'));
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create upload directory']);
                return;
            }
        }
        
        if (!is_writable($uploadPath)) {
            error_log('Upload directory is not writable: ' . $uploadPath);
            error_log('Directory owner: ' . (function_exists('posix_getpwuid') ? posix_getpwuid(fileowner($uploadPath))['name'] : 'unknown'));
            error_log('Directory permissions: ' . substr(sprintf('%o', fileperms($uploadPath)), -4));
            error_log('Current user: ' . (function_exists('posix_getpwuid') ? posix_getpwuid(posix_geteuid())['name'] : 'unknown'));
            
            // Try to make it writable with full permissions
            if (@chmod($uploadPath, 0777)) {
                error_log('Successfully changed permissions to 0777');
            } else {
                error_log('Failed to change permissions. Trying parent directory...');
                $parentDir = dirname($uploadPath);
                @chmod($parentDir, 0777);
                @chmod($uploadPath, 0777);
            }
            
            // Check again
            if (!is_writable($uploadPath)) {
                error_log('Still not writable after chmod attempt');
                http_response_code(500);
                echo json_encode([
                    'error' => 'Upload directory is not writable. Please run: chmod -R 777 ' . $uploadPath
                ]);
                return;
            }
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('img_', true) . '_' . time() . '.' . $extension;
        $filepath = $uploadPath . $filename;
        
        error_log('Attempting to save file: ' . $filepath);
        error_log('Temp file: ' . $file['tmp_name']);
        error_log('File exists: ' . (file_exists($file['tmp_name']) ? 'yes' : 'no'));
        
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            $error = error_get_last();
            error_log('Failed to move uploaded file. Error: ' . ($error ? $error['message'] : 'Unknown'));
            error_log('Upload path: ' . $uploadPath);
            error_log('File path: ' . $filepath);
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file. Check server logs for details.']);
            return;
        }
        
        // Return URL relative to backend
        $baseUrl = $config['base_url'];
        $imageUrl = $baseUrl . 'uploads/' . $filename;
        
        echo json_encode(['url' => $imageUrl]);
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
        
        $descLength = strlen($data['description']);
        if ($descLength < 20 || $descLength > 600) {
            throw new \Exception('Description must be between 20 and 600 characters');
        }
    }
}