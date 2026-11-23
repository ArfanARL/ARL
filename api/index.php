<?php
declare(strict_types=1);

// Front controller for https://arls.dev/api/* (see .htaccess). Source of truth for configuration: ~/arls-config/config.php
require __DIR__ . '/app/routes.php';
handle_request();
