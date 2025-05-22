-- Mail Port - Kurumsal E-posta Yönetim Sistemi
-- Veritabanı Şeması

CREATE DATABASE IF NOT EXISTS mailport_db;
USE mailport_db;

-- E-posta tablosu
CREATE TABLE emails (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    date_received DATETIME NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    company_name VARCHAR(255),
    subject TEXT,
    content LONGTEXT,
    html_content LONGTEXT,
    has_attachments BOOLEAN DEFAULT FALSE,
    is_company_name_manual BOOLEAN DEFAULT FALSE,
    is_sender_name_manual BOOLEAN DEFAULT FALSE,
    status ENUM('unread', 'read', 'forwarded', 'replied') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date_received (date_received),
    INDEX idx_sender_email (sender_email),
    INDEX idx_company_name (company_name),
    INDEX idx_status (status)
);

-- E-posta eklentileri tablosu
CREATE TABLE email_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
    INDEX idx_email_id (email_id)
);

-- Kullanıcı işlem logları tablosu
CREATE TABLE action_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email_id INT NOT NULL,
    action_type ENUM('forward', 'reply', 'edit_company', 'edit_sender', 'mark_read') NOT NULL,
    old_value TEXT,
    new_value TEXT,
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
    INDEX idx_email_id (email_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);

-- İletme işlemleri tablosu
CREATE TABLE forwarded_emails (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email_id INT NOT NULL,
    forwarded_to VARCHAR(255) NOT NULL,
    forwarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message TEXT,
    FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
    INDEX idx_email_id (email_id),
    INDEX idx_forwarded_at (forwarded_at)
);

-- Cevap işlemleri tablosu
CREATE TABLE replied_emails (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email_id INT NOT NULL,
    reply_subject TEXT,
    reply_content LONGTEXT NOT NULL,
    replied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message TEXT,
    FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
    INDEX idx_email_id (email_id),
    INDEX idx_replied_at (replied_at)
);

-- Kullanıcılar tablosu
CREATE TABLE users (
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

-- Sistem ayarları tablosu
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Varsayılan ayarları ekle
INSERT INTO settings (setting_key, setting_value, description) VALUES
('smtp_host', '', 'SMTP sunucu adresi'),
('smtp_port', '587', 'SMTP portu'),
('smtp_user', '', 'SMTP kullanıcı adı'),
('smtp_password', '', 'SMTP şifresi'),
('imap_host', '', 'IMAP sunucu adresi'),
('imap_port', '993', 'IMAP portu'),
('imap_user', '', 'IMAP kullanıcı adı'),
('imap_password', '', 'IMAP şifresi'),
('forward_email', '', 'Varsayılan iletme e-posta adresi'),
('company_from_email_domain', '1', 'E-posta domain\'inden firma adı çıkar'),
('auto_extract_sender_name', '1', 'Gönderen adını otomatik çıkar');

-- Varsayılan kullanıcıları ekle
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@mailport.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A3/VTbZhG', 'Sistem Yöneticisi', 'admin'),
('destek', 'destek@mailport.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/A3/VTbZhG', 'Destek Personeli', 'destek');