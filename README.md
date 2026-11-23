# arls.dev deploy branch

Built static site + PHP API for https://arls.dev (cPanel Git deployment via `.cpanel.yml`).
Source lives on the `main` branch (`frontend/` and `backend/php-api/`). No secrets are stored here:
database and signing keys are kept in a config file outside the web root on the server.
