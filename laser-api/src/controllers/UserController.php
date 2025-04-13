<?php
namespace Laser\Controllers;

use Laser\Database;

class UserController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function login($jobNumber, $password) {
        try {
            $stmt = $this->db->prepare("
                SELECT id, jobNumber, staffName, authority, company, passWord, keyNum 
                FROM userregistertb 
                WHERE jobNumber = ? AND showFlag = 1
            ");
            $stmt->execute([$jobNumber]);
            $user = $stmt->fetch();

            if (!$user) {
                return ['success' => false, 'message' => '用户不存在'];
            }

            // 验证密码（这里应该使用更安全的密码验证方式）
            if (md5($password . $user['keyNum']) !== $user['passWord']) {
                return ['success' => false, 'message' => '密码错误'];
            }

            // 更新最后登录时间
            $updateStmt = $this->db->prepare("
                UPDATE userregistertb 
                SET lastLoginTime = NOW(), ip = ? 
                WHERE id = ?
            ");
            $updateStmt->execute([$_SERVER['REMOTE_ADDR'], $user['id']]);

            unset($user['passWord'], $user['keyNum']);
            return [
                'success' => true,
                'data' => $user,
                'token' => $this->generateToken($user)
            ];
        } catch (\PDOException $e) {
            return ['success' => false, 'message' => '登录失败：' . $e->getMessage()];
        }
    }

    public function getUsers() {
        try {
            $stmt = $this->db->query("
                SELECT id, jobNumber, staffName, authority, company, create_time, lastLoginTime 
                FROM userregistertb 
                WHERE showFlag = 1
                ORDER BY create_time DESC
            ");
            return ['success' => true, 'data' => $stmt->fetchAll()];
        } catch (\PDOException $e) {
            return ['success' => false, 'message' => '获取用户列表失败：' . $e->getMessage()];
        }
    }

    public function createUser($data) {
        try {
            $keyNum = substr(md5(uniqid()), 0, 6);
            $password = md5($data['password'] . $keyNum);

            $stmt = $this->db->prepare("
                INSERT INTO userregistertb (
                    jobNumber, staffName, passWord, authority, 
                    keyNum, company, create_time
                ) VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");

            $stmt->execute([
                $data['jobNumber'],
                $data['staffName'],
                $password,
                $data['authority'],
                $keyNum,
                $data['company']
            ]);

            return ['success' => true, 'message' => '用户创建成功'];
        } catch (\PDOException $e) {
            return ['success' => false, 'message' => '创建用户失败：' . $e->getMessage()];
        }
    }

    private function generateToken($user) {
        // 这里应该使用 JWT 或其他token生成方式
        $payload = [
            'id' => $user['id'],
            'jobNumber' => $user['jobNumber'],
            'authority' => $user['authority'],
            'exp' => time() + (24 * 60 * 60) // 24小时过期
        ];
        return base64_encode(json_encode($payload));
    }
} 