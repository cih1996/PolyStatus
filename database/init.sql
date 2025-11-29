-- 1. 用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '加密后的密码',
    `email` VARCHAR(100) NULL COMMENT '联系邮箱',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 监控项配置表
CREATE TABLE IF NOT EXISTS `monitors` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '归属用户',
    `name` VARCHAR(100) NOT NULL COMMENT '监控名称',
    `description` VARCHAR(255) NULL COMMENT '备注',
    
    -- 监控类型: 'ACTIVE' (主动去查) 或 'PASSIVE' (被动接收)
    `type` ENUM('ACTIVE', 'PASSIVE') NOT NULL DEFAULT 'PASSIVE',
    
    -- [主动模式配置]
    `active_url` VARCHAR(500) NULL COMMENT '主动监控的目标URL',
    `active_method` VARCHAR(10) DEFAULT 'GET' COMMENT 'HTTP方法',
    `active_interval` INT DEFAULT 60 COMMENT '检查频率(秒)',
    `active_timeout` INT DEFAULT 10 COMMENT '超时时间(秒)',
    
    -- [被动模式配置]
    `passive_key` VARCHAR(64) NULL UNIQUE COMMENT '系统生成的API Key，用于客户端上报',
    
    -- 当前状态缓存
    `status` ENUM('UP', 'DOWN', 'PENDING', 'MAINTENANCE') DEFAULT 'PENDING',
    `last_check_at` TIMESTAMP NULL COMMENT '最后一次检查时间',
    `last_latency` INT NULL COMMENT '最后一次耗时(ms)',
    
    `is_paused` BOOLEAN DEFAULT FALSE COMMENT '是否暂停监控',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_passive_key` (`passive_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 监控日志表 (记录每一次心跳)
CREATE TABLE IF NOT EXISTS `monitor_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `monitor_id` BIGINT UNSIGNED NOT NULL,
    
    `status` ENUM('UP', 'DOWN') NOT NULL,
    `latency` INT NOT NULL COMMENT '耗时(ms)',
    `status_code` INT NULL COMMENT 'HTTP状态码',
    `message` TEXT NULL COMMENT '错误信息或返回的简短Payload',
    
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`monitor_id`) REFERENCES `monitors`(`id`) ON DELETE CASCADE,
    -- 建立时间索引方便查询历史趋势
    INDEX `idx_monitor_time` (`monitor_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

