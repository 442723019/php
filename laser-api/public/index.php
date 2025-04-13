<?php
// 确保在任何输出之前设置 CORS 头部
header('Access-Control-Allow-Origin: http://localhost:3001');  // 允许来自 localhost:3001 的请求
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');    // 缓存预检请求结果 24 小时

// 记录请求信息
error_log("=== 新请求开始 ===");
error_log("请求方法: " . $_SERVER['REQUEST_METHOD']);
error_log("请求URI: " . $_SERVER['REQUEST_URI']);
error_log("请求头: " . json_encode(getallheaders()));
error_log("请求体: " . file_get_contents('php://input'));

// 处理 OPTIONS 请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log("处理 OPTIONS 请求");
    http_response_code(200);
    exit();
}

// 启用错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// 设置响应头
header('Content-Type: application/json');

// 数据库连接
try {
    require_once __DIR__ . '/../vendor/autoload.php';
    $pdo = \Laser\Database::getInstance()->getConnection();
    error_log("数据库连接成功");
} catch (Exception $e) {
    error_log("数据库连接失败: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '数据库连接失败: ' . $e->getMessage()
    ]);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// 验证token的函数
function validateToken($headers) {
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    error_log("Token: " . ($token ?? 'null'));
    
    // 验证token格式
    if ($token === null) {
        error_log("Token为空，验证失败");
        return false;
    }
    
    // 检查是否是测试token
    if (strpos($token, 'test_token_') === 0) {
        error_log("测试token验证成功: " . $token);
        return true;
    }
    
    // 临时允许所有token通过，用于调试
    error_log("允许所有token通过，用于调试");
    return true;
}

if ($uri === '/api/auth/login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    error_log("登录请求数据: " . $json);
    
    if ($data['jobNumber'] === 'admin' && $data['password'] === '123456') {
        $response = [
            'success' => true,
            'message' => '登录成功',
            'token' => 'test_token_' . time(),
            'data' => [
                'id' => 1,
                'jobNumber' => 'admin',
                'name' => '管理员',
                'role' => 'admin',
                'company' => '示例公司',
                'lastLoginTime' => date('Y-m-d H:i:s')
            ]
        ];
        error_log("登录成功: " . json_encode($response));
        echo json_encode($response);
        exit;
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '用户名或密码错误'
        ]);
        exit;
    }
}

// 获取加工历史数据
if ($uri === '/api/machines/history' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $headers = getallheaders();
    if (!validateToken($headers)) {
        http_response_code(401);
        echo json_encode([   
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        // 先获取所有表名
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        error_log("数据库表: " . implode(", ", $tables));

        // 检查表是否存在
        if (!in_array('machinerealinfohistorytb', $tables)) {
            throw new Exception('表 machinerealinfohistorytb 不存在');
        }

        // 获取表结构
        $columns = $pdo->query("SHOW COLUMNS FROM machinerealinfohistorytb")->fetchAll();
        error_log("machinerealinfohistorytb: " . json_encode($columns));

        // 查询设备历史数据
        $sql = "SELECT 
            id,
            machineId as machineCode,
            efficiency,
            electrifyTime as powerOnTime,
            processTime,
            prapareTime,
            alarmTime,  
            currentDate,
            (SELECT COUNT(*) FROM alarminfotb WHERE machineId = m.machineId AND updateFlag = 1) as alarmCount
        FROM machinerealinfohistorytb m
        ORDER BY id DESC";
        error_log("执行SQL: " . $sql);
        
        try {
            $stmt = $pdo->query($sql);
            $machines = $stmt->fetchAll();
           // echo json_encode($machines);
            error_log("查询结果liaopeng: " . json_encode($machines, JSON_PRETTY_PRINT));
            
            // 检查是否有数据
            if (empty($machines)) {
                error_log("警告: 没有找到任何设备数据");
            } else {
                error_log("找到 " . count($machines) . " 条设备数据");
            }
            
            $response = [
                'success' => true,
                'message' => '获取成功',
                'data' => $machines
            ];
            error_log("返回数据: " . json_encode($response, JSON_PRETTY_PRINT));
            echo json_encode($response);
            exit;
        } catch (Exception $e) {
            error_log("查询失败: " . $e->getMessage());
            error_log("错误详情: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => '获取设备数据失败: ' . $e->getMessage()
            ]);
            exit;
        }
    } catch (Exception $e) {
        error_log("查询失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '获取设备数据失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 获取设备实时数据
if ($uri === '/api/machines/realtime' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $headers = getallheaders();
    if (!validateToken($headers)) {
        http_response_code(401);
        echo json_encode([   
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        // 先获取所有表名
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        error_log("数据库表: " . implode(", ", $tables));

        // 检查表是否存在
        if (!in_array('machinerealinfotb', $tables)) {
            throw new Exception('表 machinerealinfotb 不存在');
        }

        // 获取表结构
        $columns = $pdo->query("SHOW COLUMNS FROM machinerealinfotb")->fetchAll();
        error_log("表结构machinerealinfotb: " . json_encode($columns));

        // 查询设备实时数据
        $sql = "SELECT 
            id,
            machineName,
            machineId as machineCode,
            machineStatus as status,
            ncPrg as currentProgram,
            dxfName,
            efficiency,
            electrifyTime as powerOnTime,
            processTime,
            prapareTime,
            alarmTime,  
            (SELECT COUNT(*) FROM alarminfotb WHERE machineId = m.machineId AND updateFlag = 1) as alarmCount,
            currentTime
        FROM machinerealinfotb m
        ORDER BY id DESC";
        error_log("执行SQL: " . $sql);
        
        try {
            $stmt = $pdo->query($sql);
            $machines = $stmt->fetchAll();
           // echo json_encode($machines);
            error_log("查询结果liaopeng: " . json_encode($machines, JSON_PRETTY_PRINT));
            
            // 检查是否有数据
            if (empty($machines)) {
                error_log("警告: 没有找到任何设备数据");
            } else {
                error_log("找到 " . count($machines) . " 条设备数据");
            }
            
            $response = [
                'success' => true,
                'message' => '获取成功',
                'data' => $machines
            ];
            error_log("返回数据: " . json_encode($response, JSON_PRETTY_PRINT));
            echo json_encode($response);
            exit;
        } catch (Exception $e) {
            error_log("查询失败: " . $e->getMessage());
            error_log("错误详情: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => '获取设备数据失败: ' . $e->getMessage()
            ]);
            exit;
        }
    } catch (Exception $e) {
        error_log("查询失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '获取设备数据失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 获取设备状态历史数据
if (($uri === '/api/machines/statusHistory') && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $headers = getallheaders();
    error_log("=== 状态历史请求开始 ===");
    error_log("请求URI: " . $uri);
    error_log("请求方法: " . $_SERVER['REQUEST_METHOD']);
    error_log("请求头: " . json_encode($headers));
    
    // 获取分页参数
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $pageSize = isset($_GET['pageSize']) ? intval($_GET['pageSize']) : 10;
    $offset = ($page - 1) * $pageSize;
    
    error_log("分页参数 - 页码: " . $page . ", 每页数量: " . $pageSize);
    
    if (!validateToken($headers)) {
        error_log("Token验证失败");
        http_response_code(401);
        echo json_encode([   
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        // 先获取所有表名
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        error_log("数据库中的所有表: " . implode(", ", $tables));

        // 检查表是否存在
        if (!in_array('machineinfotb', $tables)) {
            error_log("错误: machineinfotb表不存在");
            throw new Exception('表 machineinfotb 不存在');
        }

        // 获取表结构
        $columns = $pdo->query("SHOW COLUMNS FROM machineinfotb")->fetchAll();
        error_log("machineinfotb表结构: " . json_encode($columns, JSON_PRETTY_PRINT));

        // 获取总记录数
        $countSql = "SELECT COUNT(*) as total FROM machineinfotb";
        $count = $pdo->query($countSql)->fetch(PDO::FETCH_ASSOC)['total'];
        error_log("machineinfotb表中的记录数: " . $count);

        // 查询设备状态历史数据
        $sql = "SELECT 
            id,
            machineId as machineCode,
            machineStatus as status,
            ncPrg,
            dxfName,
            startTime,
            susTime,
            endTime
        FROM machineinfotb 
        ORDER BY id DESC
        LIMIT :offset, :pageSize";
        error_log("执行状态历史查询SQL: " . $sql);
        
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':pageSize', $pageSize, PDO::PARAM_INT);
            $stmt->execute();
            $machines = $stmt->fetchAll();
            error_log("状态历史查询结果: " . json_encode($machines, JSON_PRETTY_PRINT));
            
            // 检查是否有数据
            if (empty($machines)) {
                error_log("警告: 没有找到任何状态历史数据");
            } else {
                error_log("找到 " . count($machines) . " 条状态历史数据");
            }
            
            $response = [
                'success' => true,
                'message' => '获取成功',
                'data' => $machines,
                'pagination' => [
                    'total' => $count,
                    'page' => $page,
                    'pageSize' => $pageSize,
                    'totalPages' => ceil($count / $pageSize)
                ]
            ];
            error_log("返回状态历史数据: " . json_encode($response, JSON_PRETTY_PRINT));
            echo json_encode($response);
            exit;
        } catch (Exception $e) {
            error_log("状态历史查询失败: " . $e->getMessage());
            error_log("错误详情: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => '获取状态历史数据失败: ' . $e->getMessage()
            ]);
            exit;
        }
    } catch (Exception $e) {
        error_log("状态历史查询失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '获取状态历史数据失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 获取报警数据
if ($uri === '/api/alarms' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $headers = getallheaders();
    if (!validateToken($headers)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        // 检查表是否存在
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        if (!in_array('alarminfotb', $tables)) {
            throw new Exception('表 alarminfotb 不存在');
        }

        // 获取表结构
        $columns = $pdo->query("SHOW COLUMNS FROM alarminfotb")->fetchAll();
        error_log("报警表结构: " . json_encode($columns, JSON_PRETTY_PRINT));

        // 获取报警数据
        $sql = "SELECT * FROM alarminfotb WHERE updateFlag = 1 ORDER BY startTime DESC LIMIT 100";
        
        error_log("执行报警查询SQL: " . $sql);
        $stmt = $pdo->query($sql);
        $alarms = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("原始报警数据: " . json_encode($alarms, JSON_PRETTY_PRINT));
        
        // 转换数据格式以匹配前端期望的结构
        $alarms = array_map(function($alarm) {
            return [
                'id' => $alarm['id'],
                'machineId' => $alarm['machineId'],
                'ncPrg' => $alarm['ncPrg'],
                'warnNumber' => $alarm['warnNumber'],
                'warnType' => 1, // 默认设置为一般警告
                'content' => $alarm['content'],
                'priority' => $alarm['priority'],
                'startTime' => $alarm['startTime'],
                'endTime' => $alarm['endTime']
            ];
        }, $alarms);
        
        error_log("报警查询结果: " . json_encode($alarms));
        
        $response = [
            'success' => true,
            'message' => '获取成功',
            'data' => $alarms
        ];
        echo json_encode($response);
        exit;
    } catch (Exception $e) {
        error_log("报警查询失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '获取报警数据失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 获取NC加工信息
if ($uri === '/api/machines/ncInfo' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $headers = getallheaders();
    if (!validateToken($headers)) {
        http_response_code(401);
        echo json_encode([   
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        // 获取分页参数
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $pageSize = isset($_GET['pageSize']) ? max(1, intval($_GET['pageSize'])) : 10;
        $offset = ($page - 1) * $pageSize;

        // 先获取所有表名
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        error_log("数据库表: " . implode(", ", $tables));

        // 检查表是否存在
        if (!in_array('ncinfotb', $tables)) {
            throw new Exception('表 ncinfotb 不存在');
        }

        // 获取总记录数
        $countSql = "SELECT COUNT(*) as total FROM ncinfotb";
        $countStmt = $pdo->query($countSql);
        $count = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        // 查询NC加工数据
        $sql = "SELECT 
            id,
            ncPrg,
            dxfName,
            cutLength,
            ncPicture,
            beginTime,
            sustainTime,
            endTime
        FROM ncinfotb 
        ORDER BY id DESC
        LIMIT :offset, :pageSize";
        error_log("执行NC信息查询SQL: " . $sql);
        
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':pageSize', $pageSize, PDO::PARAM_INT);
            $stmt->execute();
            $ncInfo = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // 将 ncPicture 字段的 blob 数据转换为 base64
            foreach ($ncInfo as &$item) {
                if (!empty($item['ncPicture'])) {
                    $item['ncPicture'] = 'data:image/png;base64,' . base64_encode($item['ncPicture']);
                }
            }
            
            error_log("NC信息查询结果: " . json_encode($ncInfo, JSON_PRETTY_PRINT));
            
            // 检查是否有数据
            if (empty($ncInfo)) {
                error_log("警告: 没有找到任何NC加工数据");
            } else {
                error_log("找到 " . count($ncInfo) . " 条NC加工数据");
            }
            
            $response = [
                'success' => true,
                'message' => '获取成功',
                'data' => [
                    'data' => $ncInfo,
                    'total' => $count
                ]
            ];
            error_log("返回NC信息数据: " . json_encode($response, JSON_PRETTY_PRINT));
            echo json_encode($response);
            exit;
        } catch (Exception $e) {
            error_log("NC信息查询失败: " . $e->getMessage());
            error_log("错误详情: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => '获取NC加工数据失败: ' . $e->getMessage()
            ]);
            exit;
        }
    } catch (Exception $e) {
        error_log("NC信息查询失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '获取NC加工数据失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 获取用户列表
if ($uri === '/api/users' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $headers = getallheaders();
    if (!validateToken($headers)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        // 检查表是否存在
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        if (!in_array('usertb', $tables)) {
            // 如果表不存在，创建表
            $sql = "CREATE TABLE IF NOT EXISTS usertb (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL,
                status TINYINT DEFAULT 1,
                createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";
            $pdo->exec($sql);
            
            // 插入默认管理员账号
            $sql = "INSERT INTO usertb (username, password, role) VALUES ('admin', '123456', 'admin')";
            $pdo->exec($sql);
        }

        // 获取用户列表
        $sql = "SELECT id, username, role, status, createTime FROM usertb ORDER BY id DESC";
        $stmt = $pdo->query($sql);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => '获取成功',
            'data' => $users
        ]);
        exit;
    } catch (Exception $e) {
        error_log("获取用户列表失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '获取用户列表失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 创建用户
if ($uri === '/api/users' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $headers = getallheaders();
    if (!validateToken($headers)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        // 验证必填字段
        if (empty($data['username']) || empty($data['password']) || empty($data['role'])) {
            throw new Exception('用户名、密码和角色不能为空');
        }

        // 检查用户名是否已存在
        $stmt = $pdo->prepare("SELECT id FROM usertb WHERE username = ?");
        $stmt->execute([$data['username']]);
        if ($stmt->fetch()) {
            throw new Exception('用户名已存在');
        }

        // 插入新用户
        $sql = "INSERT INTO usertb (username, password, role) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['username'], $data['password'], $data['role']]);

        echo json_encode([
            'success' => true,
            'message' => '创建用户成功',
            'data' => [
                'id' => $pdo->lastInsertId(),
                'username' => $data['username'],
                'role' => $data['role'],
                'status' => 1,
                'createTime' => date('Y-m-d H:i:s')
            ]
        ]);
        exit;
    } catch (Exception $e) {
        error_log("创建用户失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '创建用户失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 更新用户
if (preg_match('/^\/api\/users\/(\d+)$/', $uri, $matches) && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $headers = getallheaders();
    if (!validateToken($headers)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        $userId = $matches[1];
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        // 验证必填字段
        if (empty($data['username']) || empty($data['role'])) {
            throw new Exception('用户名和角色不能为空');
        }

        // 检查用户名是否已存在（排除当前用户）
        $stmt = $pdo->prepare("SELECT id FROM usertb WHERE username = ? AND id != ?");
        $stmt->execute([$data['username'], $userId]);
        if ($stmt->fetch()) {
            throw new Exception('用户名已存在');
        }

        // 更新用户信息
        $sql = "UPDATE usertb SET username = ?, role = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data['username'], $data['role'], $userId]);

        echo json_encode([
            'success' => true,
            'message' => '更新用户成功'
        ]);
        exit;
    } catch (Exception $e) {
        error_log("更新用户失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '更新用户失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 删除用户
if (preg_match('/^\/api\/users\/(\d+)$/', $uri, $matches) && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $headers = getallheaders();
    if (!validateToken($headers)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        $userId = $matches[1];
        
        // 不允许删除管理员账号
        $stmt = $pdo->prepare("SELECT role FROM usertb WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user && $user['role'] === 'admin') {
            throw new Exception('不能删除管理员账号');
        }

        // 删除用户
        $sql = "DELETE FROM usertb WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);

        echo json_encode([
            'success' => true,
            'message' => '删除用户成功'
        ]);
        exit;
    } catch (Exception $e) {
        error_log("删除用户失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '删除用户失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 获取系统设置
if ($uri === '/api/settings' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $headers = getallheaders();
    if (!validateToken($headers)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        // 检查表是否存在
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        if (!in_array('system_settings', $tables)) {
            // 如果表不存在，创建表
            $sql = "CREATE TABLE IF NOT EXISTS system_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(50) NOT NULL UNIQUE,
                setting_value TEXT,
                updateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )";
            $pdo->exec($sql);
            
            // 插入默认设置
            $defaultSettings = [
                ['systemName', '激光设备管理系统'],
                ['companyName', '示例公司'],
                ['dataRetentionDays', '30'],
                ['autoBackup', '1'],
                ['backupTime', '00:00'],
                ['emailNotification', '0'],
                ['emailAddress', '']
            ];
            
            $sql = "INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)";
            $stmt = $pdo->prepare($sql);
            foreach ($defaultSettings as $setting) {
                $stmt->execute($setting);
            }
        }

        // 获取所有设置
        $sql = "SELECT setting_key, setting_value FROM system_settings";
        $stmt = $pdo->query($sql);
        $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 转换为前端需要的格式
        $formattedSettings = [];
        foreach ($settings as $setting) {
            $value = $setting['setting_value'];
            // 转换布尔值
            if ($value === '1' || $value === '0') {
                $value = (bool)$value;
            }
            // 转换数字
            elseif (is_numeric($value)) {
                $value = (int)$value;
            }
            $formattedSettings[$setting['setting_key']] = $value;
        }

        echo json_encode([
            'success' => true,
            'message' => '获取成功',
            'data' => $formattedSettings
        ]);
        exit;
    } catch (Exception $e) {
        error_log("获取系统设置失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '获取系统设置失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 更新系统设置
if ($uri === '/api/settings' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $headers = getallheaders();
    if (!validateToken($headers)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '未授权访问'
        ]);
        exit;
    }

    try {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        // 验证必填字段
        $requiredFields = ['systemName', 'companyName', 'dataRetentionDays', 'backupTime'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                throw new Exception("缺少必填字段: {$field}");
            }
        }

        // 更新设置
        $sql = "INSERT INTO system_settings (setting_key, setting_value) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)";
        $stmt = $pdo->prepare($sql);

        foreach ($data as $key => $value) {
            // 转换布尔值为字符串
            if (is_bool($value)) {
                $value = $value ? '1' : '0';
            }
            $stmt->execute([$key, (string)$value]);
        }

        echo json_encode([
            'success' => true,
            'message' => '保存设置成功'
        ]);
        exit;
    } catch (Exception $e) {
        error_log("保存系统设置失败: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => '保存系统设置失败: ' . $e->getMessage()
        ]);
        exit;
    }
}

// 其他API路由返回未授权
http_response_code(401);
echo json_encode([
    'success' => false,
    'message' => '未授权访问'
]); 