# ⚡ Quick Commands - Copy & Paste Ready

## ONE-TIME SETUP (Run Once)

```bash
# 1. Update Termux
pkg update && pkg upgrade

# 2. Install essentials
pkg install git curl nano

# 3. Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# 4. Enable storage
termux-setup-storage

# 5. Clone your repo
cd ~
git clone http://github.com/SoundsguyZA/android-mcp-server.git

# 6. Install dependencies
cd ~/android-mcp-server
bun install

# 7. Install MCP server dependencies
cd mini-services/mcp-server
bun install
```

---

## START SERVERS (Every Time)

**Terminal 1 - MCP Server:**
```bash
cd ~/android-mcp-server/mini-services/mcp-server
bun run dev
```

**Terminal 2 - Dashboard (NEW SESSION):**
```bash
cd ~/android-mcp-server
bun run dev
```

---

## ACCESS DASHBOARD

**On Your Phone:**
```
http://localhost:3000
```

**From Computer on Same WiFi:**
```
http://YOUR_PHONE_IP:3000
```

---

## TROUBLESHOOTING

**Restart everything:**
```bash
killall bun
```

**Reinstall dependencies:**
```bash
cd ~/android-mcp-server
bun install
cd mini-services/mcp-server && bun install
```

**Check if running:**
```bash
lsof -i :3000
lsof -i :3001
```

---

**That's it! 🚀**
