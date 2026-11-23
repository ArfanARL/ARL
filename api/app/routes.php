<?php
declare(strict_types=1);

require_once __DIR__ . '/lib.php';

function to_slug(string $value): string
{
    $s = preg_replace('/[^a-z0-9]+/', '-', mb_strtolower(trim($value), 'UTF-8'));
    return trim((string)$s, '-');
}

function page_slug(string $value): string
{
    return str_replace('/', '-', implode('-', preg_split('/ +/', mb_strtolower(trim($value), 'UTF-8'), -1, PREG_SPLIT_NO_EMPTY)));
}

function entry_dto(array $r): array
{
    $data = json_decode($r['data'], true);
    return [
        'id' => $r['id'], 'type' => $r['type'], 'slug' => $r['slug'], 'title' => $r['title'],
        'data' => (is_array($data) && $data !== []) ? $data : (object)[],
        'isPublished' => (bool)$r['is_published'], 'sortOrder' => (int)$r['sort_order'],
        'updatedAtUtc' => iso($r['updated_at']), 'updatedBy' => $r['updated_by'],
    ];
}

function enquiry_dto(array $r): array
{
    return [
        'id' => $r['id'], 'name' => $r['name'], 'email' => $r['email'], 'organisation' => $r['organisation'],
        'message' => $r['message'], 'createdAtUtc' => iso($r['created_at']), 'status' => $r['status'], 'notes' => $r['notes'],
    ];
}

function page_dto(array $r): array
{
    return [
        'id' => $r['id'], 'slug' => $r['slug'], 'title' => $r['title'], 'summary' => $r['summary'], 'body' => $r['body'],
        'isPublished' => (bool)$r['is_published'], 'sortOrder' => (int)$r['sort_order'],
        'updatedAtUtc' => iso($r['updated_at']), 'updatedBy' => $r['updated_by'],
    ];
}

function audit_dto(array $r): array
{
    return [
        'id' => $r['id'], 'atUtc' => iso($r['at_utc']), 'actor' => $r['actor'], 'action' => $r['action'],
        'entity' => $r['entity'], 'entityId' => $r['entity_id'], 'detail' => $r['detail'], 'ip' => $r['ip'],
    ];
}

function like_pattern(string $q): string
{
    return '%' . addcslashes(trim($q), '\\%_') . '%';
}

/** Validates an entry payload; returns [slug, errors]. */
function validate_entry(array $in, ?string $forcedType = null, ?bool $dataIsObject = null): array
{
    if ($dataIsObject === null) {
        $dataIsObject = ($GLOBALS['ARLS_OBJ']->data ?? null) instanceof stdClass;
    }
    $errors = [];
    $type = $forcedType ?? str_or_null($in['type'] ?? null);
    $title = str_or_null($in['title'] ?? null);
    $slugSource = array_key_exists('slug', $in) && $in['slug'] !== null ? (string)$in['slug'] : ($title ?? '');
    $slug = to_slug($slugSource);
    if ($type === null || trim($type) === '' || !in_array($type, ENTRY_TYPES, true)) {
        $errors['type'] = ['Type must be one of: ' . implode(', ', ENTRY_TYPES) . '.'];
    }
    if (blank($title)) $errors['title'] = ['Title is required.'];
    elseif (mb_len($title) > 300) $errors['title'] = ['Title must be 300 characters or fewer.'];
    if ($slug === '') $errors['slug'] = ['A URL slug is required.'];
    elseif (strlen($slug) > 140) $errors['slug'] = ['Slug must be 140 characters or fewer.'];
    $data = $in['data'] ?? null;
    if (!$dataIsObject || !is_array($data) || ($data !== [] && array_is_list($data))) {
        $errors['data'] = ['Data must be a JSON object.'];
    } elseif (strlen((string)json_encode($data, JSON_UNESCAPED_UNICODE)) > 200000) {
        $errors['data'] = ['Content is too large.'];
    }
    return [$slug, $errors, $type];
}

function encode_data(array $data): string
{
    return json_encode($data === [] ? (object)[] : $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function cors_headers(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = config()['cors_origins'] ?? [];
    if ($origin !== '' && in_array($origin, $allowed, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    }
}

function handle_request(): void
{
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $full = rtrim((string)parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
    $pos = strpos($full, '/api');
    $path = $pos === false ? $full : substr($full, $pos + 4);
    if ($path === '') $path = '/';

    cors_headers();
    if ($method === 'OPTIONS') {
        send_json(204);
    }

    try {
        route($method, $path);
    } catch (PDOException $e) {
        error_log('ARLS DB error: ' . $e->getMessage());
        error_out(500, 'An unexpected server error occurred.');
    } catch (Throwable $e) {
        error_log('ARLS error: ' . $e->getMessage());
        error_out(500, 'An unexpected server error occurred.');
    }
}

function route(string $method, string $path): void
{
    $m = [];

    if ($path === '/health') {
        db()->query('SELECT 1');
        send_json(200, ['status' => 'Healthy']);
    }
    if ($path === '/v1/platform' && $method === 'GET') {
        send_json(200, ['name' => 'Agentic Research Labs Core API', 'status' => 'operational', 'version' => '1.0.0-php']);
    }
    if ($path === '/setup' && $method === 'GET') {
        render_setup_page();
    }
    if ($path === '/v1/setup/status' && $method === 'GET') {
        send_json(200, ['needsSetup' => setup_open()]);
    }
    if ($path === '/v1/setup' && $method === 'POST') {
        do_setup();
    }

    // ---------------------------------------------------------------- public
    if ($path === '/v1/contact-enquiries' && $method === 'POST') {
        contact_enquiry();
    }
    if ($path === '/v1/content/pages' && $method === 'GET') {
        $rows = db()->query('SELECT * FROM content_pages WHERE is_published = 1 ORDER BY sort_order')->fetchAll();
        send_json(200, array_map(fn($r) => ['slug' => $r['slug'], 'title' => $r['title'], 'summary' => $r['summary'], 'body' => $r['body'], 'updatedAtUtc' => iso($r['updated_at'])], $rows));
    }
    if (preg_match('#^/v1/content/([a-z]+)$#', $path, $m) && $method === 'GET') {
        if (!in_array($m[1], ENTRY_TYPES, true)) send_json(404);
        $stmt = db()->prepare('SELECT * FROM content_entries WHERE type = ? AND is_published = 1 ORDER BY sort_order, title');
        $stmt->execute([$m[1]]);
        send_json(200, array_map(function ($r) {
            $d = json_decode($r['data'], true);
            return ['slug' => $r['slug'], 'title' => $r['title'], 'data' => (is_array($d) && $d !== []) ? $d : (object)[], 'updatedAtUtc' => iso($r['updated_at'])];
        }, $stmt->fetchAll()));
    }
    if ($path === '/v1/ai/capabilities' && $method === 'GET') {
        send_json(503, ['title' => 'AI integration is not configured.', 'status' => 503]);
    }

    // ---------------------------------------------------------------- auth
    if ($path === '/v1/admin/auth/login' && $method === 'POST') {
        login();
    }
    if ($path === '/v1/admin/auth/me' && $method === 'GET') {
        $u = require_auth();
        send_json(200, ['id' => $u['id'], 'name' => $u['display_name'], 'email' => $u['email'], 'roles' => [$u['role']]]);
    }
    if ($path === '/v1/admin/auth/change-password' && $method === 'POST') {
        $u = require_auth();
        $in = body_json();
        $cur = str_or_null($in['currentPassword'] ?? null);
        $new = str_or_null($in['newPassword'] ?? null);
        if (blank($cur) || blank($new)) error_out(400, 'Current and new password are required.');
        if (!password_verify($cur, $u['password_hash'])) error_out(400, 'Incorrect password.');
        $errs = password_errors($new);
        if ($errs) error_out(400, implode(' ', $errs));
        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([password_hash($new, PASSWORD_DEFAULT), $u['id']]);
        audit($u['email'], 'auth.password-change', 'user', $u['id']);
        send_json(200, ['changed' => true]);
    }

    // ---------------------------------------------------------------- dashboard
    if ($path === '/v1/admin/dashboard' && $method === 'GET') {
        dashboard(require_auth('editors'));
    }

    // ---------------------------------------------------------------- CMS pages
    if ($path === '/v1/admin/content/pages' && $method === 'GET') {
        require_auth('editors');
        send_json(200, array_map('page_dto', db()->query('SELECT * FROM content_pages ORDER BY sort_order')->fetchAll()));
    }
    if ($path === '/v1/admin/content/pages' && $method === 'POST') {
        $u = require_auth('editors');
        $in = body_json();
        $title = str_or_null($in['title'] ?? null);
        $slugIn = str_or_null($in['slug'] ?? null);
        if (blank($title) || blank($slugIn)) error_out(400, 'Title and slug are required.');
        $slug = page_slug($slugIn);
        $chk = db()->prepare('SELECT 1 FROM content_pages WHERE slug = ?');
        $chk->execute([$slug]);
        if ($chk->fetchColumn()) error_out(409, 'A page with this slug already exists.');
        $id = uuid4();
        db()->prepare('INSERT INTO content_pages (id, slug, title, summary, body, is_published, sort_order, updated_at, updated_by) VALUES (?,?,?,?,?,?,?,?,?)')
            ->execute([$id, $slug, trim($title), isset($in['summary']) ? trim((string)$in['summary']) : null, (string)($in['body'] ?? ''), !empty($in['isPublished']) ? 1 : 0, (int)($in['sortOrder'] ?? 0), now_db(), $u['email']]);
        $row = db()->query("SELECT * FROM content_pages WHERE id = '$id'")->fetch();
        send_json(201, page_dto($row));
    }
    if (preg_match('#^/v1/admin/content/pages/([0-9a-f-]{36})$#i', $path, $m)) {
        $id = strtolower($m[1]);
        if ($method === 'PUT') {
            $u = require_auth('editors');
            $sel = db()->prepare('SELECT * FROM content_pages WHERE id = ?');
            $sel->execute([$id]);
            if (!$sel->fetch()) send_json(404);
            $in = body_json();
            $title = str_or_null($in['title'] ?? null);
            $slugIn = str_or_null($in['slug'] ?? null);
            if (blank($title) || blank($slugIn)) error_out(400, 'Title and slug are required.');
            $slug = page_slug($slugIn);
            $chk = db()->prepare('SELECT 1 FROM content_pages WHERE slug = ? AND id <> ?');
            $chk->execute([$slug, $id]);
            if ($chk->fetchColumn()) error_out(409, 'A page with this slug already exists.');
            db()->prepare('UPDATE content_pages SET slug=?, title=?, summary=?, body=?, is_published=?, sort_order=?, updated_at=?, updated_by=? WHERE id=?')
                ->execute([$slug, trim($title), isset($in['summary']) ? trim((string)$in['summary']) : null, (string)($in['body'] ?? ''), !empty($in['isPublished']) ? 1 : 0, (int)($in['sortOrder'] ?? 0), now_db(), $u['email'], $id]);
            $sel->execute([$id]);
            send_json(200, page_dto($sel->fetch()));
        }
        if ($method === 'DELETE') {
            require_auth('admins');
            $del = db()->prepare('DELETE FROM content_pages WHERE id = ?');
            $del->execute([$id]);
            send_json($del->rowCount() ? 204 : 404);
        }
    }

    // ---------------------------------------------------------------- content entries
    if ($path === '/v1/admin/content/entries' && $method === 'GET') {
        require_auth('editors');
        $type = str_or_null($_GET['type'] ?? null);
        if (!blank($type)) {
            $stmt = db()->prepare('SELECT * FROM content_entries WHERE type = ? ORDER BY type, sort_order, title');
            $stmt->execute([$type]);
        } else {
            $stmt = db()->query('SELECT * FROM content_entries ORDER BY type, sort_order, title');
        }
        send_json(200, array_map('entry_dto', $stmt->fetchAll()));
    }
    if ($path === '/v1/admin/content/entries' && $method === 'POST') {
        $u = require_auth('editors');
        $in = body_json();
        [$slug, $errors, $type] = validate_entry($in);
        if ($errors) validation_problem($errors);
        $chk = db()->prepare('SELECT 1 FROM content_entries WHERE type = ? AND slug = ?');
        $chk->execute([$type, $slug]);
        if ($chk->fetchColumn()) error_out(409, 'An entry with this slug already exists.');
        $id = uuid4();
        db()->prepare('INSERT INTO content_entries (id, type, slug, title, data, is_published, sort_order, updated_at, updated_by) VALUES (?,?,?,?,?,?,?,?,?)')
            ->execute([$id, $type, $slug, trim((string)$in['title']), encode_data($in['data']), !empty($in['isPublished']) ? 1 : 0, (int)($in['sortOrder'] ?? 0), now_db(), $u['email']]);
        audit($u['email'], 'content.create', $type, $id, "$type/$slug");
        $row = db()->prepare('SELECT * FROM content_entries WHERE id = ?');
        $row->execute([$id]);
        send_json(201, entry_dto($row->fetch()));
    }
    if ($path === '/v1/admin/content/import' && $method === 'POST') {
        $u = require_auth('admins');
        $in = body_json();
        $created = 0;
        $skipped = 0;
        $objEntries = $GLOBALS['ARLS_OBJ']->entries ?? [];
        foreach (array_values($in['entries'] ?? []) as $idx => $item) {
            if (!is_array($item)) { $skipped++; continue; }
            $isObj = (is_array($objEntries) && isset($objEntries[$idx]->data)) ? ($objEntries[$idx]->data instanceof stdClass) : false;
            [$slug, $errors, $type] = validate_entry($item, null, $isObj);
            if ($errors) { $skipped++; continue; }
            $chk = db()->prepare('SELECT 1 FROM content_entries WHERE type = ? AND slug = ?');
            $chk->execute([$type, $slug]);
            if ($chk->fetchColumn()) { $skipped++; continue; }
            db()->prepare('INSERT INTO content_entries (id, type, slug, title, data, is_published, sort_order, updated_at, updated_by) VALUES (?,?,?,?,?,?,?,?,?)')
                ->execute([uuid4(), $type, $slug, trim((string)$item['title']), encode_data($item['data']), !empty($item['isPublished']) ? 1 : 0, (int)($item['sortOrder'] ?? 0), now_db(), $u['email']]);
            $created++;
        }
        audit($u['email'], 'content.import', 'content', null, "created $created, skipped $skipped");
        send_json(200, ['created' => $created, 'skipped' => $skipped]);
    }
    if (preg_match('#^/v1/admin/content/entries/([0-9a-f-]{36})$#i', $path, $m)) {
        $id = strtolower($m[1]);
        $sel = db()->prepare('SELECT * FROM content_entries WHERE id = ?');
        $sel->execute([$id]);
        if ($method === 'GET') {
            require_auth('editors');
            $r = $sel->fetch();
            $r ? send_json(200, entry_dto($r)) : send_json(404);
        }
        if ($method === 'PUT') {
            $u = require_auth('editors');
            $entry = $sel->fetch();
            if (!$entry) send_json(404);
            $in = body_json();
            [$slug, $errors] = validate_entry($in, $entry['type']);
            if ($errors) validation_problem($errors);
            $chk = db()->prepare('SELECT 1 FROM content_entries WHERE type = ? AND slug = ? AND id <> ?');
            $chk->execute([$entry['type'], $slug, $id]);
            if ($chk->fetchColumn()) error_out(409, 'An entry with this slug already exists.');
            $pub = !empty($in['isPublished']);
            $action = ((bool)$entry['is_published']) !== $pub ? ($pub ? 'content.publish' : 'content.unpublish') : 'content.update';
            db()->prepare('UPDATE content_entries SET slug=?, title=?, data=?, is_published=?, sort_order=?, updated_at=?, updated_by=? WHERE id=?')
                ->execute([$slug, trim((string)$in['title']), encode_data($in['data']), $pub ? 1 : 0, (int)($in['sortOrder'] ?? 0), now_db(), $u['email'], $id]);
            audit($u['email'], $action, $entry['type'], $id, $entry['type'] . '/' . $slug);
            $sel->execute([$id]);
            send_json(200, entry_dto($sel->fetch()));
        }
        if ($method === 'DELETE') {
            $u = require_auth('admins');
            $entry = $sel->fetch();
            if (!$entry) send_json(404);
            db()->prepare('DELETE FROM content_entries WHERE id = ?')->execute([$id]);
            audit($u['email'], 'content.delete', $entry['type'], $id, $entry['type'] . '/' . $entry['slug']);
            send_json(204);
        }
    }

    // ---------------------------------------------------------------- enquiries
    if ($path === '/v1/admin/contact-enquiries' && $method === 'GET') {
        require_auth('editors');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $size = min(100, max(1, (int)($_GET['pageSize'] ?? 25)));
        [$where, $params] = enquiry_filter();
        $total = db()->prepare("SELECT COUNT(*) FROM contact_enquiries $where");
        $total->execute($params);
        $stmt = db()->prepare("SELECT * FROM contact_enquiries $where ORDER BY created_at DESC LIMIT $size OFFSET " . (($page - 1) * $size));
        $stmt->execute($params);
        send_json(200, ['page' => $page, 'pageSize' => $size, 'total' => (int)$total->fetchColumn(), 'items' => array_map('enquiry_dto', $stmt->fetchAll())]);
    }
    if ($path === '/v1/admin/contact-enquiries/export.csv' && $method === 'GET') {
        $u = require_auth('editors');
        [$where, $params] = enquiry_filter(true);
        $stmt = db()->prepare("SELECT * FROM contact_enquiries $where ORDER BY created_at DESC");
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        $out = "\xEF\xBB\xBFReceived (UTC),Name,Email,Organisation,Status,Message,Notes\r\n";
        foreach ($rows as $e) {
            $out .= implode(',', [csv_cell(gmdate('Y-m-d H:i:s\Z', strtotime($e['created_at'] . ' UTC'))), csv_cell($e['name']), csv_cell($e['email']), csv_cell($e['organisation']), csv_cell($e['status']), csv_cell($e['message']), csv_cell($e['notes'])]) . "\r\n";
        }
        audit($u['email'], 'enquiry.export', 'enquiry', null, count($rows) . ' rows');
        http_response_code(200);
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="enquiries.csv"');
        echo $out;
        exit;
    }
    if (preg_match('#^/v1/admin/contact-enquiries/([0-9a-f-]{36})(/status)?$#i', $path, $m)) {
        $id = strtolower($m[1]);
        $statusOnly = ($m[2] ?? '') === '/status';
        $sel = db()->prepare('SELECT * FROM contact_enquiries WHERE id = ?');
        $sel->execute([$id]);
        if ($method === 'GET' && !$statusOnly) {
            require_auth('editors');
            $r = $sel->fetch();
            $r ? send_json(200, enquiry_dto($r)) : send_json(404);
        }
        if ($method === 'PATCH') {
            $u = require_auth('editors');
            $item = $sel->fetch();
            if (!$item) send_json(404);
            $in = body_json();
            $status = str_or_null($in['status'] ?? null);
            $notes = array_key_exists('notes', $in) ? str_or_null($in['notes']) : null;
            if ($statusOnly && $status === null) error_out(400, 'Invalid status.');
            if ($status !== null) {
                if (!in_array($status, ENQUIRY_STATUSES, true)) error_out(400, 'Invalid status.');
                if ($item['status'] !== $status) audit($u['email'], 'enquiry.status', 'enquiry', $id, $item['status'] . ' → ' . $status);
                db()->prepare('UPDATE contact_enquiries SET status = ? WHERE id = ?')->execute([$status, $id]);
            }
            if (!$statusOnly && $notes !== null) {
                if (mb_len($notes) > 4000) error_out(400, 'Notes must be 4,000 characters or fewer.');
                db()->prepare('UPDATE contact_enquiries SET notes = ? WHERE id = ?')->execute([blank($notes) ? null : trim($notes), $id]);
                audit($u['email'], 'enquiry.notes', 'enquiry', $id);
            }
            $sel->execute([$id]);
            $fresh = $sel->fetch();
            send_json(200, $statusOnly ? ['id' => $fresh['id'], 'status' => $fresh['status']] : enquiry_dto($fresh));
        }
        if ($method === 'DELETE' && !$statusOnly) {
            $u = require_auth('admins');
            $del = db()->prepare('DELETE FROM contact_enquiries WHERE id = ?');
            $del->execute([$id]);
            if (!$del->rowCount()) send_json(404);
            audit($u['email'], 'enquiry.delete', 'enquiry', $id);
            send_json(204);
        }
    }

    // ---------------------------------------------------------------- users
    if ($path === '/v1/admin/users' && $method === 'GET') {
        require_auth('admins');
        $now = now_db();
        send_json(200, array_map(fn($u) => [
            'id' => $u['id'], 'email' => $u['email'], 'displayName' => $u['display_name'], 'isEnabled' => (bool)$u['is_enabled'],
            'role' => $u['role'], 'lockedOut' => $u['lockout_until'] !== null && $u['lockout_until'] > $now,
        ], db()->query('SELECT * FROM users ORDER BY email')->fetchAll()));
    }
    if ($path === '/v1/admin/users' && $method === 'POST') {
        $actor = require_auth('admins');
        $in = body_json();
        $email = str_or_null($in['email'] ?? null);
        $name = str_or_null($in['displayName'] ?? null);
        $role = str_or_null($in['role'] ?? null);
        $pw = str_or_null($in['password'] ?? null);
        $errors = [];
        if (!valid_email($email)) $errors['email'] = ['A valid email address is required.'];
        if (blank($name)) $errors['displayName'] = ['Display name is required.'];
        if ($role === null || !in_array($role, ASSIGNABLE_ROLES, true)) $errors['role'] = ['Role must be Administrator or Editor.'];
        if (blank($pw)) $errors['password'] = ['A temporary password is required.'];
        if ($errors) validation_problem($errors);
        $email = trim((string)$email);
        $chk = db()->prepare('SELECT 1 FROM users WHERE email = ?');
        $chk->execute([$email]);
        if ($chk->fetchColumn()) error_out(409, 'A user with this email already exists.');
        $pe = password_errors((string)$pw);
        if ($pe) validation_problem(['password' => $pe]);
        $id = uuid4();
        db()->prepare('INSERT INTO users (id, email, display_name, password_hash, role, is_enabled, created_at) VALUES (?,?,?,?,?,1,?)')
            ->execute([$id, $email, trim((string)$name), password_hash((string)$pw, PASSWORD_DEFAULT), $role, now_db()]);
        audit($actor['email'], 'user.create', 'user', $id, "$email as $role");
        send_json(201, ['id' => $id, 'email' => $email, 'displayName' => trim((string)$name), 'isEnabled' => true, 'role' => $role]);
    }
    if (preg_match('#^/v1/admin/users/([0-9a-f-]{36})$#i', $path, $m) && $method === 'PUT') {
        $actor = require_auth('admins');
        $id = strtolower($m[1]);
        $sel = db()->prepare('SELECT * FROM users WHERE id = ?');
        $sel->execute([$id]);
        $user = $sel->fetch();
        if (!$user) send_json(404);
        $in = body_json();
        $isSelf = $actor['id'] === $id;
        $newRole = str_or_null($in['role'] ?? null) ?? $user['role'];
        $newEnabled = array_key_exists('isEnabled', $in) && $in['isEnabled'] !== null ? (bool)$in['isEnabled'] : (bool)$user['is_enabled'];
        if (!in_array($newRole, ASSIGNABLE_ROLES, true)) error_out(400, 'Role must be Administrator or Editor.');
        if ($isSelf && (!$newEnabled || $newRole !== 'Administrator')) error_out(400, 'You cannot disable or demote your own account.');
        $name = str_or_null($in['displayName'] ?? null);
        $newPw = str_or_null($in['newPassword'] ?? null);
        $hash = $user['password_hash'];
        if (!blank($newPw)) {
            $pe = password_errors($newPw);
            if ($pe) error_out(400, implode(' ', $pe));
            $hash = password_hash($newPw, PASSWORD_DEFAULT);
        }
        db()->prepare('UPDATE users SET display_name = ?, role = ?, is_enabled = ?, password_hash = ?, failed_count = 0, lockout_until = NULL WHERE id = ?')
            ->execute([blank($name) ? $user['display_name'] : trim($name), $newRole, $newEnabled ? 1 : 0, $hash, $id]);
        audit($actor['email'], 'user.update', 'user', $id, $user['email'] . ": role $newRole, enabled " . ($newEnabled ? 'True' : 'False') . (blank($newPw) ? '' : ', password reset'));
        send_json(200, ['id' => $id, 'email' => $user['email'], 'displayName' => blank($name) ? $user['display_name'] : trim($name), 'isEnabled' => $newEnabled, 'role' => $newRole]);
    }

    // ---------------------------------------------------------------- audit log
    if ($path === '/v1/admin/audit' && $method === 'GET') {
        require_auth('admins');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $size = min(200, max(1, (int)($_GET['pageSize'] ?? 50)));
        $q = str_or_null($_GET['q'] ?? null);
        $where = '';
        $params = [];
        if (!blank($q)) {
            $where = "WHERE actor LIKE ? ESCAPE '\\\\' OR action LIKE ? ESCAPE '\\\\' OR entity LIKE ? ESCAPE '\\\\' OR detail LIKE ? ESCAPE '\\\\'";
            $p = like_pattern($q);
            $params = [$p, $p, $p, $p];
        }
        $total = db()->prepare("SELECT COUNT(*) FROM audit_events $where");
        $total->execute($params);
        $stmt = db()->prepare("SELECT * FROM audit_events $where ORDER BY at_utc DESC LIMIT $size OFFSET " . (($page - 1) * $size));
        $stmt->execute($params);
        send_json(200, ['page' => $page, 'pageSize' => $size, 'total' => (int)$total->fetchColumn(), 'items' => array_map('audit_dto', $stmt->fetchAll())]);
    }

    send_json(404, ['error' => 'Not found.']);
}

function enquiry_filter(bool $statusOnly = false): array
{
    $where = [];
    $params = [];
    $status = str_or_null($_GET['status'] ?? null);
    if (!blank($status)) { $where[] = 'status = ?'; $params[] = $status; }
    $q = str_or_null($_GET['q'] ?? null);
    if (!$statusOnly && !blank($q)) {
        $p = like_pattern($q);
        $where[] = "(name LIKE ? ESCAPE '\\\\' OR email LIKE ? ESCAPE '\\\\' OR organisation LIKE ? ESCAPE '\\\\' OR message LIKE ? ESCAPE '\\\\')";
        array_push($params, $p, $p, $p, $p);
    }
    return [$where ? 'WHERE ' . implode(' AND ', $where) : '', $params];
}

function contact_enquiry(): void
{
    if (!rate_limit('contact', 5, 600)) {
        send_json(429);
    }
    $in = body_json();
    $name = str_or_null($in['name'] ?? null);
    $email = str_or_null($in['email'] ?? null);
    $org = str_or_null($in['organisation'] ?? null);
    $msg = str_or_null($in['message'] ?? null);
    $errors = [];
    if (blank($name)) $errors['name'] = ['Name is required.'];
    if (blank($email) || !valid_email(trim($email))) $errors['email'] = ['A valid email address is required.'];
    if (blank($msg)) $errors['message'] = ['Message is required.'];
    if (mb_len($name) > 120) $errors['name'] = ['Name must be 120 characters or fewer.'];
    if (mb_len($email) > 254) $errors['email'] = ['Email must be 254 characters or fewer.'];
    if (mb_len($org) > 160) $errors['organisation'] = ['Organisation must be 160 characters or fewer.'];
    if (mb_len($msg) > 5000) $errors['message'] = ['Message must be 5,000 characters or fewer.'];
    if ($errors) validation_problem($errors);

    $id = uuid4();
    $name = trim((string)$name);
    $email = strtolower(trim((string)$email));
    $org = blank($org) ? null : trim($org);
    $msg = trim((string)$msg);
    db()->prepare('INSERT INTO contact_enquiries (id, name, email, organisation, message, created_at, status, ip) VALUES (?,?,?,?,?,?,?,?)')
        ->execute([$id, $name, $email, $org, $msg, now_db(), 'new', client_ip()]);

    $to = config()['notify_to'] ?? 'info@arls.dev';
    send_mail(
        $to,
        'New website enquiry from ' . $name,
        "A new enquiry was received on arls.dev.\n\nName: $name\nEmail: $email\nOrganisation: " . ($org ?? '-') . "\n\nMessage:\n$msg\n\nManage it in the admin console: https://arls.dev/admin/enquiries/\n",
        $email
    );
    send_json(202, ['id' => $id, 'received' => true, 'message' => 'Thank you. Your enquiry has been received.']);
}

function login(): void
{
    if (!rate_limit('login', 5, 300)) {
        send_json(429);
    }
    $in = body_json();
    $email = str_or_null($in['email'] ?? null);
    $pw = str_or_null($in['password'] ?? null);
    if (blank($email) || blank($pw)) error_out(400, 'Email and password are required.');
    $email = trim($email);
    $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    $now = now_db();
    $locked = $user && $user['lockout_until'] !== null && $user['lockout_until'] > $now;
    $ok = $user && !$locked && (int)$user['is_enabled'] && password_verify($pw, $user['password_hash']);
    if (!$ok) {
        if ($user) {
            $count = (int)$user['failed_count'] + 1;
            if ($count >= 5) {
                db()->prepare('UPDATE users SET failed_count = 0, lockout_until = ? WHERE id = ?')->execute([gmdate('Y-m-d H:i:s', time() + 900), $user['id']]);
            } else {
                db()->prepare('UPDATE users SET failed_count = ? WHERE id = ?')->execute([$count, $user['id']]);
            }
        }
        audit($email, 'auth.login-failed', 'user', $user['id'] ?? null, null, client_ip());
        send_json(401);
    }
    db()->prepare('UPDATE users SET failed_count = 0, lockout_until = NULL WHERE id = ?')->execute([$user['id']]);
    audit($user['email'], 'auth.login', 'user', $user['id'], null, client_ip());
    $jwt = jwt_issue($user);
    send_json(200, [
        'accessToken' => $jwt['token'], 'tokenType' => 'Bearer', 'expiresAtUtc' => gmdate('Y-m-d\TH:i:s\Z', $jwt['exp']),
        'user' => ['displayName' => $user['display_name'], 'email' => $user['email'], 'roles' => [$user['role']]],
    ]);
}

function dashboard(array $user): void
{
    $pdo = db();
    $since = gmdate('Y-m-d H:i:s', time() - 7 * 86400);
    $by = $pdo->query('SELECT status, COUNT(*) AS c FROM contact_enquiries GROUP BY status')->fetchAll();
    $byStatus = array_map(fn($r) => ['status' => $r['status'], 'count' => (int)$r['c']], $by);
    $total = array_sum(array_column($byStatus, 'count'));
    $last7 = $pdo->prepare('SELECT COUNT(*) FROM contact_enquiries WHERE created_at >= ?');
    $last7->execute([$since]);
    $recent = array_map(function ($e) {
        $msg = $e['message'];
        return ['id' => $e['id'], 'name' => $e['name'], 'organisation' => $e['organisation'], 'status' => $e['status'], 'createdAtUtc' => iso($e['created_at']),
            'preview' => mb_strlen($msg) > 140 ? mb_substr($msg, 0, 140) . '…' : $msg];
    }, $pdo->query('SELECT * FROM contact_enquiries ORDER BY created_at DESC LIMIT 5')->fetchAll());
    $content = array_map(fn($r) => ['type' => $r['type'], 'total' => (int)$r['t'], 'published' => (int)$r['p']],
        $pdo->query('SELECT type, COUNT(*) AS t, SUM(is_published) AS p FROM content_entries GROUP BY type')->fetchAll());
    $isAdmin = $user['role'] === 'Administrator';
    $activity = $isAdmin ? array_map('audit_dto', $pdo->query('SELECT * FROM audit_events ORDER BY at_utc DESC LIMIT 8')->fetchAll()) : [];
    $users = $isAdmin ? (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn() : null;
    send_json(200, [
        'enquiries' => ['total' => $total, 'last7Days' => (int)$last7->fetchColumn(), 'byStatus' => $byStatus, 'recent' => $recent],
        'content' => $content, 'pages' => (int)$pdo->query('SELECT COUNT(*) FROM content_pages')->fetchColumn(),
        'users' => $users, 'activity' => $activity,
    ]);
}

// ---------------------------------------------------------------------- first-run setup

function setup_open(): bool
{
    $c = config();
    if (empty($c['setup_token_hash']) || (int)($c['setup_expires'] ?? 0) < time()) {
        return false;
    }
    return (int)db()->query('SELECT COUNT(*) FROM users')->fetchColumn() === 0;
}

function do_setup(): void
{
    if (!rate_limit('setup', 5, 600)) send_json(429);
    if (!setup_open()) error_out(403, 'Setup is not available.');
    $in = body_json();
    $code = (string)($in['code'] ?? '');
    $email = str_or_null($in['email'] ?? null);
    $name = str_or_null($in['displayName'] ?? null);
    $pw = str_or_null($in['password'] ?? null);
    if (!hash_equals((string)config()['setup_token_hash'], hash('sha256', $code))) error_out(403, 'The setup code is not valid.');
    $errors = [];
    if (!valid_email($email)) $errors['email'] = ['A valid email address is required.'];
    if (blank($name)) $errors['displayName'] = ['Display name is required.'];
    $pe = password_errors((string)$pw);
    if ($pe) $errors['password'] = $pe;
    if ($errors) validation_problem($errors);
    $id = uuid4();
    db()->prepare('INSERT INTO users (id, email, display_name, password_hash, role, is_enabled, created_at) VALUES (?,?,?,?,?,1,?)')
        ->execute([$id, trim((string)$email), trim((string)$name), password_hash((string)$pw, PASSWORD_DEFAULT), 'Administrator', now_db()]);
    audit(trim((string)$email), 'user.create', 'user', $id, 'initial administrator (setup)', client_ip());
    send_json(201, ['created' => true]);
}

function render_setup_page(): void
{
    $open = setup_open();
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow');
    header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'");
    http_response_code(200);
    $code = htmlspecialchars((string)($_GET['code'] ?? ''), ENT_QUOTES, 'UTF-8');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Administrator setup | Agentic Research Labs</title>'
        . '<style>body{font-family:Segoe UI,Arial,sans-serif;background:#0b2230;color:#e8f3f3;margin:0;display:grid;place-items:center;min-height:100vh}main{background:#10283c;border:1px solid #2f5c70;border-radius:14px;padding:32px;max-width:440px;width:92%}h1{font-size:22px;margin:0 0 6px}p{color:#a9c3c9;line-height:1.5}label{display:block;margin:14px 0 4px;font-size:14px}input{width:100%;box-sizing:border-box;padding:11px;border-radius:8px;border:1px solid #3f8f95;background:#0b1c27;color:#fff;font-size:15px}button{margin-top:20px;width:100%;padding:12px;border:0;border-radius:8px;background:#72cbb7;color:#06323f;font-weight:700;font-size:16px;cursor:pointer}.err{color:#ffb4b4}.ok{color:#9be8c6}a{color:#72cbb7}</style></head><body><main>';
    if (!$open) {
        echo '<h1>Setup is complete</h1><p>An administrator already exists, or the setup link has expired. <a href="/admin/login/">Go to the admin sign-in</a>.</p></main></body></html>';
        exit;
    }
    echo '<h1>Create the administrator account</h1><p>Choose your own password. It must be at least 14 characters with upper and lower case letters, a digit and a symbol. This page works once.</p>'
        . '<form id="f" autocomplete="off"><label for="code">Setup code</label><input id="code" value="' . $code . '" required>'
        . '<label for="name">Your name</label><input id="name" required><label for="email">Email address</label><input id="email" type="email" required>'
        . '<label for="pw">Password</label><input id="pw" type="password" minlength="14" required><label for="pw2">Repeat password</label><input id="pw2" type="password" minlength="14" required>'
        . '<button type="submit">Create administrator</button><p id="msg" role="status"></p></form>'
        . '<script>document.getElementById("f").addEventListener("submit",async function(e){e.preventDefault();var m=document.getElementById("msg");m.className="";'
        . 'var pw=document.getElementById("pw").value;if(pw!==document.getElementById("pw2").value){m.className="err";m.textContent="The passwords do not match.";return}'
        . 'var r=await fetch("/api/v1/setup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:document.getElementById("code").value.trim(),displayName:document.getElementById("name").value,email:document.getElementById("email").value,password:pw})});'
        . 'var j=await r.json().catch(function(){return{}});if(r.ok){m.className="ok";m.innerHTML="Administrator created. <a href=\"/admin/login/\">Sign in</a>.";document.getElementById("f").querySelectorAll("input,button").forEach(function(x){x.disabled=true})}'
        . 'else{m.className="err";var errs=j.errors?Object.values(j.errors).flat().join(" "):"";m.textContent=j.error||errs||"Setup failed ("+r.status+")."}});</script></main></body></html>';
    exit;
}
