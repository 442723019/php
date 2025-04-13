<?php
namespace Laser\Controllers;

use Laser\Database;

class MachineController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getMachineStatus() {
        try {
            $stmt = $this->db->query("
                SELECT * FROM machinerealinfotb 
                ORDER BY currentTime DESC
            ");
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error fetching machine status: " . $e->getMessage());
        }
    }

    public function getAlarms() {
        try {
            $stmt = $this->db->query("
                SELECT * FROM alarminfotb 
                ORDER BY startTime DESC 
                LIMIT 100
            ");
            return $stmt->fetchAll();
        } catch (\PDOException $e) {
            throw new \Exception("Error fetching alarms: " . $e->getMessage());
        }
    }

    public function getMachineStatistics() {
        try {
            $result = [
                'total' => 0,
                'running' => 0,
                'alarm' => 0,
                'efficiency' => 0
            ];

            $stmt = $this->db->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN machineStatus = 1 THEN 1 ELSE 0 END) as running,
                    SUM(CASE WHEN machineStatus = 2 THEN 1 ELSE 0 END) as alarm,
                    AVG(CAST(REPLACE(efficiency, '%', '') AS DECIMAL(5,2))) as avg_efficiency
                FROM machinerealinfotb 
            ");
            
            $data = $stmt->fetch();
            if ($data) {
                $result['total'] = (int)$data['total'];
                $result['running'] = (int)$data['running'];
                $result['alarm'] = (int)$data['alarm'];
                $result['efficiency'] = round($data['avg_efficiency'], 2);
            }

            return $result;
        } catch (\PDOException $e) {
            throw new \Exception("Error fetching statistics: " . $e->getMessage());
        }
    }
} 