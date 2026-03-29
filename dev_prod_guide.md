# MetaLaw: Development & Production Guide

This guide explains the workflow for managing the MetaLaw application.

## 🚀 Production Environment

The production app is managed by **PM2** to ensure it stays online 24/7.

- **Public URL**: [https://desktop-5edm0fl.tail2bd68f.ts.net/](https://desktop-5edm0fl.tail2bd68f.ts.net/)
- **Local Port**: `3001` (Unified Backend & Frontend)
- **Public Port**: `443` (Tailscale Funnel)

### **Production Management Scripts**
- **`start_prod.bat`**: Starts the application via PM2 and enables the public funnel on the default port.
- **`stop_prod.bat`**: Safely disables the public funnel and stops the PM2 process.
- **`update_prod.bat`**: **The One-Click Deploy Script.** It pulls from Git, rebuilds the frontend, and restarts the server.
- **`view_logs.bat`**: Shows live production logs and errors.
- **`view_dev_logs.bat`**: Shows live development API logs and errors.

---

## 🛠️ Development Environment

Development is isolated to ensure you don't break the production site while working.

- **Local UI**: `http://localhost:5175`
- **Backend API**: `http://localhost:8002`

### **Development Workflow**
1.  **Start Dev Mode**: Run `start_dev.bat`. 
2.  **Coding**: Make your changes in VS Code. The UI and API will hot-reload.
3.  **Deployment**: 
    - Push your changes to GitHub: `git push origin main`.
    - Go to the server and run `update_prod.bat`.

---

## ⚠️ Important Notes
- **Tailscale**: The public URL uses port 443. Do not run `tailscale serve reset` manually, as it will break public access for Aviation Fuel. Always use the provided `.bat` scripts.
- **Persistence**: If the server reboots, PM2 will ensure MetaLaw starts automatically.
