-- MySQL 8 schema for the PHP API deployed on shared hosting (backend/php-api).
-- Schema only: no user accounts, password hashes, enquiries or audit data.
-- The API creates these tables itself on first request (app/lib.php ensure_schema); this file is for reference and manual restores.

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  failed_count INT NOT NULL DEFAULT 0,
  lockout_until DATETIME NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY ux_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_enquiries (
  id CHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  organisation VARCHAR(160) NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  status VARCHAR(30) NOT NULL,
  notes VARCHAR(4000) NULL,
  ip VARCHAR(64) NULL,
  KEY ix_enq_created (created_at),
  KEY ix_enq_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_entries (
  id CHAR(36) NOT NULL PRIMARY KEY,
  type VARCHAR(40) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  title VARCHAR(300) NOT NULL,
  data MEDIUMTEXT NOT NULL,
  is_published TINYINT(1) NOT NULL,
  sort_order INT NOT NULL,
  updated_at DATETIME NOT NULL,
  updated_by VARCHAR(254) NOT NULL,
  UNIQUE KEY ux_entries_type_slug (type, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_pages (
  id CHAR(36) NOT NULL PRIMARY KEY,
  slug VARCHAR(140) NOT NULL,
  title VARCHAR(200) NOT NULL,
  summary VARCHAR(500) NULL,
  body MEDIUMTEXT NOT NULL,
  is_published TINYINT(1) NOT NULL,
  sort_order INT NOT NULL,
  updated_at DATETIME NOT NULL,
  updated_by VARCHAR(254) NOT NULL,
  UNIQUE KEY ux_pages_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
  k VARCHAR(120) NOT NULL PRIMARY KEY,
  window_start INT NOT NULL,
  hits INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_events (
  id CHAR(36) NOT NULL PRIMARY KEY,
  at_utc DATETIME NOT NULL,
  actor VARCHAR(254) NOT NULL,
  action VARCHAR(80) NOT NULL,
  entity VARCHAR(80) NOT NULL,
  entity_id VARCHAR(80) NULL,
  detail VARCHAR(1000) NULL,
  ip VARCHAR(64) NULL,
  KEY ix_audit_at (at_utc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
