-- 创建用户表
CREATE TABLE IF NOT EXISTS userregistertb (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobNumber VARCHAR(50) NOT NULL UNIQUE,
    staffName VARCHAR(100) NOT NULL,
    passWord VARCHAR(32) NOT NULL,
    keyNum VARCHAR(6) NOT NULL,
    authority INT NOT NULL DEFAULT 1,
    company VARCHAR(100),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLoginTime DATETIME,
    ip VARCHAR(50),
    showFlag TINYINT DEFAULT 1
);

-- 创建测试账号 (密码: 123456)
INSERT INTO userregistertb (jobNumber, staffName, passWord, keyNum, authority, company)
VALUES ('admin', '管理员', 'e10adc3949ba59abbe56e057f20f883e', '123456', 9, '激光科技'); 