<?php
declare(strict_types=1);

/**
 * Shared helpers for the Agentic Research Labs PHP API (shared-hosting port of the Core API).
 * Configuration lives OUTSIDE the web root: ~/arls-config/config.php (never committed).
 */

const ENTRY_TYPES = ['project', 'research', 'leader'];
const ASSIGNABLE_ROLES = ['Administrator', 'Editor'];
const ENQUIRY_STATUSES = ['new', 'in_review', 'responded', 'closed'];

function config(): array
{
    static $cfg = null;
    if ($cfg === null) {
        $path = getenv('ARLS_CONFIG') ?: dirname((string)($_SERVER['DOCUMENT_ROOT'] ?? '')) . '/arls-config/config.php';
        if (!is_file($path)) {
            send_json(503, ['error' => 'The service is not configured.']);
        }
        $cfg = require $path;
    }
    return $cfg;
}

function send_json(int $status, mixed $data = null): never
{
    http_response_code($status);
    if ($data !== null) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION | JSON_INVALID_UTF8_SUBSTITUTE);
    }
    exit;
}

function error_out(int $status, string $message): never
{
    send_json($status, ['error' => $message]);
}

/** ASP.NET-style validation problem so the existing front end reads `errors`. */
function validation_problem(array $errors): never
{
    send_json(400, [
        'type' => 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
        'title' => 'One or more validation errors occurred.',
        'status' => 400,
        'errors' => $errors,
    ]);
}

function now_db(): string
{
    return gmdate('Y-m-d H:i:s');
}

function iso(?string $db): ?string
{
    return $db === null ? null : str_replace(' ', 'T', $db) . 'Z';
}

function uuid4(): string
{
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}

function is_uuid(string $v): bool
{
    return (bool)preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $v);
}

function client_ip(): string
{
    return substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 64);
}

function body_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    try {
        $data = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
        // Object-typed copy so callers can tell {} from [] (PHP arrays cannot).
        $GLOBALS['ARLS_OBJ'] = json_decode($raw, false, 64, JSON_THROW_ON_ERROR);
    } catch (Throwable) {
        error_out(400, 'The request body is not valid JSON.');
    }
    return is_array($data) ? $data : [];
}

function str_or_null(mixed $v): ?string
{
    return is_string($v) ? $v : null;
}

function blank(?string $v): bool
{
    return $v === null || trim($v) === '';
}

function valid_email(?string $v): bool
{
    return $v !== null && strlen($v) <= 254 && filter_var($v, FILTER_VALIDATE_EMAIL) !== false;
}

function mb_len(?string $v): int
{
    return $v === null ? 0 : mb_strlen($v, 'UTF-8');
}

// ------------------------------------------------------------------ database

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = config()['db'];
        $pdo = new PDO(
            sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $c['host'] ?? 'localhost', $c['name']),
            $c['user'],
            $c['pass'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        $pdo->exec("SET time_zone = '+00:00'");
        ensure_schema($pdo);
    }
    return $pdo;
}

function ensure_schema(PDO $pdo): void
{
    $exists = $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'audit_events'")->fetchColumn();
    if ((int)$exists > 0) {
        return;
    }
    $opts = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) NOT NULL PRIMARY KEY, email VARCHAR(254) NOT NULL, display_name VARCHAR(200) NOT NULL,
        password_hash VARCHAR(255) NOT NULL, role VARCHAR(30) NOT NULL, is_enabled TINYINT(1) NOT NULL DEFAULT 1,
        failed_count INT NOT NULL DEFAULT 0, lockout_until DATETIME NULL, created_at DATETIME NOT NULL,
        UNIQUE KEY ux_users_email (email)) $opts");
    $pdo->exec("CREATE TABLE IF NOT EXISTS contact_enquiries (
        id CHAR(36) NOT NULL PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL,
        organisation VARCHAR(160) NULL, message TEXT NOT NULL, created_at DATETIME NOT NULL, status VARCHAR(30) NOT NULL,
        notes VARCHAR(4000) NULL, ip VARCHAR(64) NULL, KEY ix_enq_created (created_at), KEY ix_enq_status (status)) $opts");
    $pdo->exec("CREATE TABLE IF NOT EXISTS content_entries (
        id CHAR(36) NOT NULL PRIMARY KEY, type VARCHAR(40) NOT NULL, slug VARCHAR(140) NOT NULL, title VARCHAR(300) NOT NULL,
        data MEDIUMTEXT NOT NULL, is_published TINYINT(1) NOT NULL, sort_order INT NOT NULL, updated_at DATETIME NOT NULL,
        updated_by VARCHAR(254) NOT NULL, UNIQUE KEY ux_entries_type_slug (type, slug)) $opts");
    $pdo->exec("CREATE TABLE IF NOT EXISTS content_pages (
        id CHAR(36) NOT NULL PRIMARY KEY, slug VARCHAR(140) NOT NULL, title VARCHAR(200) NOT NULL, summary VARCHAR(500) NULL,
        body MEDIUMTEXT NOT NULL, is_published TINYINT(1) NOT NULL, sort_order INT NOT NULL, updated_at DATETIME NOT NULL,
        updated_by VARCHAR(254) NOT NULL, UNIQUE KEY ux_pages_slug (slug)) $opts");
    $pdo->exec("CREATE TABLE IF NOT EXISTS rate_limits (
        k VARCHAR(120) NOT NULL PRIMARY KEY, window_start INT NOT NULL, hits INT NOT NULL) $opts");
    $pdo->exec("CREATE TABLE IF NOT EXISTS audit_events (
        id CHAR(36) NOT NULL PRIMARY KEY, at_utc DATETIME NOT NULL, actor VARCHAR(254) NOT NULL, action VARCHAR(80) NOT NULL,
        entity VARCHAR(80) NOT NULL, entity_id VARCHAR(80) NULL, detail VARCHAR(1000) NULL, ip VARCHAR(64) NULL,
        KEY ix_audit_at (at_utc)) $opts");
    seed_entries($pdo);
}

function seed_entries(PDO $pdo): void
{
    $file = __DIR__ . '/../seed/entries.json';
    if (!is_file($file)) {
        return;
    }
    $items = json_decode((string)file_get_contents($file), true);
    if (!is_array($items)) {
        return;
    }
    $stmt = $pdo->prepare('INSERT IGNORE INTO content_entries (id, type, slug, title, data, is_published, sort_order, updated_at, updated_by) VALUES (?,?,?,?,?,?,?,?,?)');
    foreach ($items as $i) {
        $stmt->execute([
            uuid4(), $i['type'], $i['slug'], mb_substr((string)$i['title'], 0, 300),
            json_encode($i['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            !empty($i['isPublished']) ? 1 : 0, (int)($i['sortOrder'] ?? 0), now_db(), 'initial import',
        ]);
    }
}

// ------------------------------------------------------------------ audit + rate limit

function audit(string $actor, string $action, string $entity, ?string $entityId = null, ?string $detail = null, ?string $ip = null): void
{
    $stmt = db()->prepare('INSERT INTO audit_events (id, at_utc, actor, action, entity, entity_id, detail, ip) VALUES (?,?,?,?,?,?,?,?)');
    $stmt->execute([
        uuid4(), now_db(), mb_substr($actor, 0, 254), $action, $entity, $entityId,
        $detail === null ? null : mb_substr($detail, 0, 1000), $ip,
    ]);
}

/** Fixed-window limiter. Returns false when the limit is exceeded. */
function rate_limit(string $name, int $limit, int $windowSeconds): bool
{
    $key = substr($name . ':' . client_ip(), 0, 120);
    $now = time();
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $sel = $pdo->prepare('SELECT window_start, hits FROM rate_limits WHERE k = ? FOR UPDATE');
        $sel->execute([$key]);
        $row = $sel->fetch();
        if (!$row || $now - (int)$row['window_start'] >= $windowSeconds) {
            $pdo->prepare('REPLACE INTO rate_limits (k, window_start, hits) VALUES (?,?,1)')->execute([$key, $now]);
            $ok = true;
        } else {
            $hits = (int)$row['hits'] + 1;
            $pdo->prepare('UPDATE rate_limits SET hits = ? WHERE k = ?')->execute([$hits, $key]);
            $ok = $hits <= $limit;
        }
        $pdo->commit();
        return $ok;
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

// ------------------------------------------------------------------ passwords + JWT

function password_errors(string $pw): array
{
    $e = [];
    if (mb_strlen($pw) < 14) $e[] = 'Passwords must be at least 14 characters.';
    if (!preg_match('/\d/', $pw)) $e[] = "Passwords must have at least one digit ('0'-'9').";
    if (!preg_match('/[A-Z]/', $pw)) $e[] = "Passwords must have at least one uppercase ('A'-'Z').";
    if (!preg_match('/[a-z]/', $pw)) $e[] = "Passwords must have at least one lowercase ('a'-'z').";
    if (!preg_match('/[^A-Za-z0-9]/', $pw)) $e[] = 'Passwords must have at least one non alphanumeric character.';
    return $e;
}

function b64url(string $s): string
{
    return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}

function b64url_dec(string $s): string
{
    return (string)base64_decode(strtr($s, '-_', '+/'), false);
}

function jwt_issue(array $user, int $ttlSeconds = 1800): array
{
    $c = config();
    $now = time();
    $payload = [
        'iss' => $c['jwt_issuer'] ?? 'AgenticResearchLabs', 'aud' => $c['jwt_audience'] ?? 'AgenticResearchLabs.Admin',
        'sub' => $user['id'], 'email' => $user['email'], 'name' => $user['display_name'], 'roles' => [$user['role']],
        'iat' => $now, 'nbf' => $now, 'exp' => $now + $ttlSeconds,
    ];
    $h = b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $p = b64url(json_encode($payload, JSON_UNESCAPED_UNICODE));
    $sig = b64url(hash_hmac('sha256', "$h.$p", $c['jwt_secret'], true));
    return ['token' => "$h.$p.$sig", 'exp' => $payload['exp']];
}

function jwt_verify(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $s] = $parts;
    $c = config();
    $calc = b64url(hash_hmac('sha256', "$h.$p", $c['jwt_secret'], true));
    if (!hash_equals($calc, $s)) return null;
    $hdr = json_decode(b64url_dec($h), true);
    if (!is_array($hdr) || ($hdr['alg'] ?? '') !== 'HS256') return null;
    $pl = json_decode(b64url_dec($p), true);
    if (!is_array($pl)) return null;
    $now = time();
    if (($pl['exp'] ?? 0) < $now - 30 || ($pl['nbf'] ?? 0) > $now + 30) return null;
    if (($pl['iss'] ?? '') !== ($c['jwt_issuer'] ?? 'AgenticResearchLabs')) return null;
    if (($pl['aud'] ?? '') !== ($c['jwt_audience'] ?? 'AgenticResearchLabs.Admin')) return null;
    return $pl;
}

function bearer_token(): string
{
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if ($h === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $k => $v) {
            if (strcasecmp($k, 'Authorization') === 0) { $h = $v; break; }
        }
    }
    return preg_match('/^Bearer\s+(.+)$/i', $h, $m) ? trim($m[1]) : '';
}

/** Authenticates the request. $policy: null = any signed-in user, 'editors' or 'admins'. */
function require_auth(?string $policy = null): array
{
    $claims = jwt_verify(bearer_token());
    if ($claims === null) {
        send_json(401);
    }
    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$claims['sub'] ?? '']);
    $user = $stmt->fetch();
    if (!$user || !(int)$user['is_enabled']) {
        send_json(401);
    }
    $role = $user['role'];
    if ($policy === 'admins' && $role !== 'Administrator') send_json(403);
    if ($policy === 'editors' && !in_array($role, ['Administrator', 'Editor'], true)) send_json(403);
    return $user;
}

// ------------------------------------------------------------------ mail

function send_mail(string $to, string $subject, string $body, ?string $replyTo = null): bool
{
    $c = config();
    $from = $c['mail_from'] ?? 'info@arls.dev';
    $clean = static fn(string $s): string => trim(preg_replace('/[\r\n]+/', ' ', $s));
    $headers = [
        'From: ' . mb_encode_mimeheader('Agentic Research Labs', 'UTF-8') . " <$from>",
        'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: 8bit',
    ];
    if ($replyTo !== null && valid_email($replyTo)) {
        $headers[] = 'Reply-To: ' . $clean($replyTo);
    }
    try {
        return @mail($to, mb_encode_mimeheader($clean($subject), 'UTF-8'), $body, implode("\r\n", $headers), '-f' . $from);
    } catch (Throwable) {
        return false;
    }
}

function csv_cell(?string $v): string
{
    $v ??= '';
    if ($v !== '' && str_contains("=+-@\t\r", $v[0])) {
        $v = "'" . $v;
    }
    return '"' . str_replace('"', '""', $v) . '"';
}
