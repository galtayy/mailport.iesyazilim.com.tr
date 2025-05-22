-- Users tablosunu oluştur
USE mailport_db;

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'destek') NOT NULL DEFAULT 'destek',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Varsayılan kullanıcıları ekle (şifre: 123456)
INSERT IGNORE INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@mailport.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A3/VTbZhG', 'Sistem Yöneticisi', 'admin'),
('destek', 'destek@mailport.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A3/VTbZhG', 'Destek Personeli', 'destek');

SELECT 'Users tablosu oluşturuldu ve test kullanıcıları eklendi' AS Result;