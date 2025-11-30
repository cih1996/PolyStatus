# PolyStatus

[English](./README.md) | [中文](./README_ZH.md)

PolyStatus 是一个轻量级的全栈状态监控与聚合面板，基于 SvelteKit 和 Prisma 构建。支持主动探测、被动心跳接收以及灵活的报警通知机制。

## 功能特性

- **📊 状态监控**
  - **主动监控**: 定时探测目标 URL (HTTP 状态码)。
  - **被动监控**: 提供 Webhook API，接收外部服务的心跳上报 (支持自定义 JSON 数据)。
- **⏱️ 超时检测**: 可为每个监控项设置心跳超时时间，自动判定离线状态。
- **🔔 报警通知**:
  - 支持 **QQ 机器人** 通知 (推荐配合 [NapCatQQ](https://github.com/NapNeko/NapCatQQ) 使用)。
  - 支持 **Bark (iOS)** 通知。
  - 当服务离线或恢复时自动发送提醒。
- **📱 响应式 UI**: 完美适配移动端和桌面端。

## 📷 界面预览

| 首页状态 | 添加/编辑 | 设置中心 |
| :---: | :---: | :---: |
| <img src="helper/screenshot/1.png" width="100%"> | <img src="helper/screenshot/2.png" width="100%"> | <img src="helper/screenshot/3.png" width="100%"> |

## 快速开始

### 1. 环境要求
- Node.js v18+
- MySQL 数据库

### 2. 安装依赖
```bash
pnpm install
```

### 3. 配置环境变量
复制项目根目录下的 `env.example` 文件为 `.env`，并根据实际情况修改配置：

```bash
cp env.example .env
```

配置文件内容示例：
```env
DATABASE_URL="mysql://user:pass@host:3306/poly"
ORIGIN="http://localhost:5173" # 生产环境请填实际域名

# 可选：QQ 机器人配置默认值
QQ_PROXY_URL="http://121.5.24.60:8999/proxy"
QQ_TARGET_URL="http://127.0.0.1:3000/send_private_msg"
```

### 4. 数据库初始化
```bash
npx prisma db push
```

### 5. 启动开发服务器
```bash
pnpm dev
```

## 生产环境部署

1. **构建**
   ```bash
   pnpm build
   ```

2. **启动**
   确保服务器安装了 `dotenv`（如果在 package.json 中没有）：
   ```bash
   npm install dotenv
   ```
   启动服务：
   ```bash
   npm start
   # 或者手动：
   node -r dotenv/config build
   ```

3. **Nginx 反向代理配置示例**
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host; # 关键配置：必须传递 Host 头以通过 CSRF 检查
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

## 💬 联系与赞助

如果你觉得这个项目对你有帮助，欢迎请作者喝杯咖啡 ☕️

- **微信**: cia8868
- **QQ**: 85913323

<img src="helper/screenshot/sponsor.jpg" alt="Sponsor" width="300" />

## 致谢

- QQ 机器人功能适配了 [NapCatQQ](https://github.com/NapNeko/NapCatQQ) 框架。

## 许可证
MIT

