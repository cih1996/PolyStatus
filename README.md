# PolyStatus

[English](./README.md) | [中文](./README_ZH.md)

PolyStatus is a lightweight full-stack status monitoring and aggregation dashboard built with SvelteKit and Prisma. It supports active probing, passive heartbeat reception, and flexible alert notification mechanisms.

## Features

- **📊 Status Monitoring**
  - **Active Monitoring**: Regularly probes target URLs (HTTP status codes).
  - **Passive Monitoring**: Provides a Webhook API to receive heartbeat reports from external services (supports custom JSON data).
- **⏱️ Timeout Detection**: Set heartbeat timeout durations for each monitor to automatically determine offline status.
- **🔔 Alert Notifications**:
  - Supports **QQ Bot** notifications (Recommended to use with [NapCatQQ](https://github.com/NapNeko/NapCatQQ)).
  - Supports **Bark (iOS)** notifications.
  - Automatically sends alerts when a service goes offline or recovers.
- **📱 Responsive UI**: Perfectly adapted for both mobile and desktop.

## 📷 Interface Preview

| Dashboard | Add/Edit | Settings |
| :---: | :---: | :---: |
| <img src="helper/screenshot/1.png" width="100%"> | <img src="helper/screenshot/2.png" width="100%"> | <img src="helper/screenshot/3.png" width="100%"> |

## Quick Start

### 1. Requirements
- Node.js v18+
- MySQL Database

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Copy the `env.example` file in the project root to `.env` and modify the configuration as needed:

```bash
cp env.example .env
```

Example configuration:
```env
DATABASE_URL="mysql://user:pass@host:3306/poly"
ORIGIN="http://localhost:5173" # Use actual domain for production

# Optional: Default values for QQ Bot configuration
QQ_PROXY_URL="http://121.5.24.60:8999/proxy"
QQ_TARGET_URL="http://127.0.0.1:3000/send_private_msg"
```

### 4. Initialize Database
```bash
npx prisma db push
```

### 5. Start Development Server
```bash
pnpm dev
```

## Production Deployment

1. **Build**
   ```bash
   pnpm build
   ```

2. **Start**
   Ensure `dotenv` is installed on the server (if not in package.json):
   ```bash
   npm install dotenv
   ```
   Start the service:
   ```bash
   npm start
   # Or manually:
   node -r dotenv/config build
   ```

3. **Nginx Reverse Proxy Configuration Example**
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host; # Critical: Must pass Host header to pass CSRF checks
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

## 💬 Contact & Support

If you find this project helpful, feel free to buy the author a coffee ☕️

- **WeChat**: cia8868
- **QQ**: 85913323

<img src="helper/screenshot/sponsor.jpg" alt="Sponsor" width="300" />

## Acknowledgements

- QQ Bot functionality is adapted for the [NapCatQQ](https://github.com/NapNeko/NapCatQQ) framework.

## License
MIT
