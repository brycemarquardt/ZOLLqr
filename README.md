# ZOLLqr - Optimized for ARM64 devices like a RaspberryPi
## MUST MAKE THESE CHANGES IN .env WHEN INSTALLING
- Customize DB_PASSWORD & MYSQL_ROOT_PASSWORD with secure values
- Set JWT_SECRET in with a secure, random string (e.g., generated using ```openssl rand -base64 32```)
- Ensure DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME are set in .env. Defaults are for Docker Compose
## DEPLOYMENT INSTRUCTIONS
1. Clone this repository
2. Make your changes to .env in the root directory -> DB_HOST, DB_USER, DB_PASSWORD and DB_NAME are defaults for Docker Compose
3. Build and run with ```docker-compose up --build```
4. Access the app at http://localhost:3000 (or the server’s IP). You will be redirected to "/login.html"
5. Login with Username:Admin Password:ZOLLcodes2025
## KEY FEATURES
- **File System Storage:** Files (QR code PNG, PDF, PDF-as-PNG) are stored in /app/storage/ subdirectories (qr_codes/, pdfs/, pdf_pngs/). The MySQL files table stores file paths instead of BLOBs, reducing database size and improving performance.
- **JWT Authentication:** The backend uses JWT to protect /api/files routes, ensuring only authenticated users access the app.
- **ARM64 Compatibility:** Docker images (node:14-alpine, mysql:8.0 with platform: linux/arm64/v8) ensure compatibility with Raspberry Pi.
- **Persistent Storage:** A Docker volume (storage) ensures files persist across container restarts.
## NOTES
- **Security:** The .env file must be kept secure and not committed to GitHub. The JWT secret should be a strong, unique value.
- **Customization:** Adjust file naming, PDF layout, or styling in files.js and style.css as needed.
