<?php

namespace App\Controllers;

use Database;

class AdminController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function stats() {
        // Total users
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM users");
        $totalUsers = $stmt->fetch()['total'];
        
        // New users this month
        $stmt = $this->db->query("
            SELECT COUNT(*) as total FROM users 
            WHERE MONTH(created_at) = MONTH(CURDATE()) 
            AND YEAR(created_at) = YEAR(CURDATE())
        ");
        $newUsers = $stmt->fetch()['total'];
        
        // Total properties
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM properties WHERE status = 'active'");
        $totalProperties = $stmt->fetch()['total'];
        
        // New properties this month
        $stmt = $this->db->query("
            SELECT COUNT(*) as total FROM properties 
            WHERE status = 'active'
            AND MONTH(created_at) = MONTH(CURDATE()) 
            AND YEAR(created_at) = YEAR(CURDATE())
        ");
        $newProperties = $stmt->fetch()['total'];
        
        // Total bookings
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM bookings");
        $totalBookings = $stmt->fetch()['total'];
        
        // Active bookings
        $stmt = $this->db->query("
            SELECT COUNT(*) as total FROM bookings 
            WHERE status IN ('pending', 'confirmed') 
            AND check_out >= CURDATE()
        ");
        $activeBookings = $stmt->fetch()['total'];
        
        echo json_encode([
            'users' => [
                'total' => (int)$totalUsers,
                'new_this_month' => (int)$newUsers
            ],
            'properties' => [
                'total' => (int)$totalProperties,
                'new_this_month' => (int)$newProperties
            ],
            'bookings' => [
                'total' => (int)$totalBookings,
                'active' => (int)$activeBookings
            ]
        ]);
    }

    public function export() {
        $format = $_GET['format'] ?? 'csv';
        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');
        
        $stmt = $this->db->prepare("
            SELECT 
                u.id as user_id,
                u.email,
                u.full_name,
                u.created_at as user_created,
                p.id as property_id,
                p.title,
                p.created_at as property_created,
                b.id as booking_id,
                b.check_in,
                b.check_out,
                b.total_price,
                b.status as booking_status,
                b.created_at as booking_created
            FROM users u
            LEFT JOIN properties p ON u.id = p.owner_id
            LEFT JOIN bookings b ON p.id = b.property_id
            WHERE u.created_at BETWEEN ? AND ?
            ORDER BY u.created_at DESC
        ");
        $stmt->execute([$startDate, $endDate]);
        $data = $stmt->fetchAll();
        
        if ($format === 'xlsx') {
            $this->exportXLSX($data, $startDate, $endDate);
        } elseif ($format === 'pdf') {
            $this->exportPDF($data, $startDate, $endDate);
        } else {
            $this->exportCSV($data, $startDate, $endDate);
        }
    }

    public function blockUser($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $blocked = $data['blocked'] ?? true;
            
            $stmt = $this->db->prepare("UPDATE users SET blocked = ? WHERE id = ?");
            $stmt->execute([$blocked ? 1 : 0, $id]);
            
            echo json_encode(['message' => 'User status updated successfully']);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function exportCSV($data, $startDate, $endDate) {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="homerent_export_' . $startDate . '_' . $endDate . '.csv"');
        
        $output = fopen('php://output', 'w');
        fputcsv($output, ['User ID', 'Email', 'Full Name', 'User Created', 'Property ID', 'Property Title', 'Property Created', 'Booking ID', 'Check In', 'Check Out', 'Total Price', 'Booking Status', 'Booking Created']);
        
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
        
        fclose($output);
    }

    private function exportXLSX($data, $startDate, $endDate) {
        // Placeholder - would need PhpSpreadsheet library
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="homerent_export_' . $startDate . '_' . $endDate . '.xlsx"');
        echo json_encode(['error' => 'XLSX export requires PhpSpreadsheet library']);
    }

    private function exportPDF($data, $startDate, $endDate) {
        // Placeholder - would need TCPDF or FPDF library
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="homerent_export_' . $startDate . '_' . $endDate . '.pdf"');
        echo json_encode(['error' => 'PDF export requires PDF library']);
    }
}

