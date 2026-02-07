# 📱 Android MCP Server - Complete Setup Guide
## For Huawei Pura80 Pro with Termux

**Your Monster Device:** 16GB RAM, 512GB Storage, Kirin Chip 🚀

---

## 📋 What You'll Need

✅ Huawei Pura80 Pro (you have it!)
✅ Termux installed and open (you're ready!)
✅ This guide (save it for reference)
✅ GitHub repo: `http://github.com/SoundsguyZA/android-mcp-server`
✅ A .tar file on your phone (we'll use this!)

---

## 🎯 Prerequisites Checklist

### Termux Installation

If you haven't installed Termux yet:

1. **Download Termux** from F-Droid (NOT Play Store - F-Droid version has full features)
   - Website: https://f-droid.org/en/packages/com.termux/

2. **Install it** on your Pura80 Pro

3. **Open Termux** (you're here!)

---

## 🚀 Step-by-Step Setup

### STEP 1: Update Termux and Install Essential Packages

**Copy and paste these commands one by one:**

```bash
# Update package lists
pkg update && pkg upgrade
```

**Press Y when asked to confirm** - this may take a few minutes.

```bash
# Install git (to clone from GitHub)
pkg install git

# Install curl (for downloading files)
pkg install curl

# Install nano text editor (easier than vim)
pkg install nano
```

**Expected Output:** Packages install successfully.

---

### STEP 2: Install Bun (Super Fast JavaScript Runtime)

Bun is 3-4x faster than Node.js - perfect for your Pura80 Pro!

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

**Wait for installation** (30-60 seconds)

```bash
# Reload your shell so Bun is available
source ~/.bashrc
```

```bash
# Verify Bun is installed
bun --version
```

**Expected Output:** Something like `1.3.7` or similar

---

### STEP 3: Enable Storage Access

This allows Termux to access your phone's storage where your .tar file is!

```bash
# Run storage setup
termux-setup-storage
```

**Tap "Allow"** on the popup that appears.

**This creates a symlink:** `~/storage` → `/storage/emulated/0`

---

### STEP 4: Download Your Code from GitHub

**Method A: Clone from GitHub (RECOMMENDED)**

```bash
# Go to your home directory
cd ~

# Clone your repository
git clone http://github.com/SoundsguyZA/android-mcp-server.git
```

**Expected Output:** Repository cloned successfully.

```bash
# Go into the project directory
cd ~/android-mcp-server
```

**Method B: Extract from .tar file (Alternative)**

If you prefer using your .tar file:

```bash
# First, find your .tar file in storage
ls ~/storage/shared/

# If you see your .tar file, extract it to home directory
cd ~
tar -xvf ~/storage/shared/YOUR_TAR_FILE_NAME.tar
```

Replace `YOUR_TAR_FILE_NAME.tar` with the actual name.

---

### STEP 5: Verify Your Project Structure

Make sure you're in the right directory and see the files:

```bash
# Make sure you're in the project directory
pwd
```

**Expected Output:** `/data/data/com.termux/files/home/android-mcp-server`

```bash
# List files
ls -la
```

**You should see:**
- `package.json`
- `src/` folder
- `mini-services/` folder
- `prisma/` folder
- Other project files

**If you DON'T see these files:**
```bash
# Go back to home and check what you have
cd ~
ls -la

# Navigate to the correct folder
cd android-mcp-server
```

---

### STEP 6: Install Project Dependencies

Now let's install everything needed for the Next.js app and MCP server!

```bash
# Install dependencies
bun install
```

**This will take 1-3 minutes** - be patient! You have 16GB RAM, so it'll be fast.

**Expected Output:** Dependencies installed, lockfile saved.

---

### STEP 7: Set Up MCP Server

Navigate to the MCP server mini-service:

```bash
# Go to MCP server directory
cd ~/android-mcp-server/mini-services/mcp-server
```

```bash
# Install MCP server dependencies
bun install
```

**Expected Output:** 22 packages installed (or similar)

---

### STEP 8: Start the MCP Server

**KEEP THIS TERMINAL OPEN!** The server needs to keep running.

```bash
# Start MCP server in development mode
bun run dev
```

**Expected Output:**
```
🚀 Android MCP Server Started!
============================================================
📡 HTTP Server: http://localhost:3001
🔌 WebSocket: ws://localhost:3001
🛠️  Tools Available: 14
📱 Platform: android aarch64
🏠 Allowed Paths: /data/data/com.termux/files/home, /tmp
============================================================

Available Endpoints:
  GET  /health     - Health check
  GET  /tools      - List all tools
  POST /execute    - Execute a tool
  GET  /mcp        - MCP protocol info

WebSocket Events:
  client -> server: execute, command
  server -> client: tools, result, command_output
============================================================
```

**✅ Success!** MCP Server is running on port 3001!

**⚠️ IMPORTANT:** Don't close this terminal! Keep it open.

---

### STEP 9: Start the Next.js Dashboard (New Terminal)

You need to open a **new Termux session** for the dashboard.

**Method A: Split Screen in Termux (RECOMMENDED)**

1. In Termux, tap the screen
2. Tap the **"NEW SESSION"** button (usually bottom left)
3. You'll now have two Termux windows

**Method B: Use Termux:Boot (Background)**

```bash
# In the NEW terminal, go back to project root
cd ~/android-mcp-server

# Start the Next.js development server
bun run dev
```

**Expected Output:**
```
▲ Next.js 16.1.3 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.x.x:3000

✓ Ready in 2-3 seconds
```

**✅ Success!** The dashboard is running on port 3000!

---

### STEP 10: Access the Dashboard

**Method A: Use Your Phone's Browser**

1. **Open Chrome** on your Pura80 Pro
2. Type in address bar: `http://localhost:3000`
3. **Hit Enter**

**You should see:**
- Beautiful Android MCP Dashboard
- Green "Connected" status
- System info cards showing:
  - Platform: `android`
  - Architecture: `aarch64`
  - Tools: `14`
  - Server Status: `Active`

**Method B: Use Your Computer's Browser**

If your phone and computer are on the same WiFi:

1. **Find your phone's IP:**
   - Settings → About Phone → Status
   - Look for "IP address" (e.g., 192.168.1.100)

2. **On your computer, open browser and type:**
   - `http://192.168.1.100:3000` (replace with your actual IP)

---

## 🧪 Testing Your Setup

### Test 1: List Files

1. **Go to "Tools" tab** in the dashboard
2. **Click** `filesystem_list_directory`
3. **Click** "Execute Tool"
4. **You should see:** List of files in your current directory

### Test 2: Run Terminal Command

1. **Go to "Terminal" tab**
2. **Type:** `ls -la`
3. **Click** "Run"
4. **You should see:** Detailed file listing with streaming output

### Test 3: Check Memory

1. **Go to "System" tab**
2. **Click** "Get Memory Info"
3. **You should see:** Your 16GB RAM usage details

---

## 📱 Using on Your Huawei Pura80 Pro

### Access from Your Phone

**Best Experience - Chrome Browser:**

1. Open Chrome
2. Go to `http://localhost:3000`
3. Tap **"Add to Home Screen"** (menu → Add to Home Screen)
4. Now it works like a native app!

### Auto-Start on Boot (Optional)

If you want it to start automatically:

```bash
# Install Termux:Boot
pkg install termux-boot

# Create startup script
mkdir -p ~/.termux/boot
nano ~/.termux/boot/start-mcp.sh
```

**Add these lines:**
```bash
#!/data/data/com.termux/files/usr/bin/bash
cd ~/android-mcp-server/mini-services/mcp-server
bun run dev &
cd ~/android-mcp-server
bun run dev
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

```bash
# Make script executable
chmod +x ~/.termux/boot/start-mcp.sh
```

---

## 🔧 Troubleshooting

### Problem: "Command not found: bun"

**Solution:**
```bash
# Reload your shell
source ~/.bashrc

# If that doesn't work, reinstall bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

---

### Problem: "Port already in use: 3000" or "Port already in use: 3001"

**Solution:**
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or kill all node/bun processes
killall node
killall bun
```

---

### Problem: "Cannot find module 'socket.io'"

**Solution:**
```bash
# Go to MCP server directory
cd ~/android-mcp-server/mini-services/mcp-server

# Install dependencies
bun install
```

---

### Problem: "Storage permission denied"

**Solution:**
```bash
# Run storage setup again
termux-setup-storage

# Tap "Allow" on the popup
```

---

### Problem: "Dashboard shows 'Server Not Connected'"

**Solution:**
```bash
# Make sure MCP server is running
# Check the terminal where you ran: bun run dev

# If it stopped, restart it
cd ~/android-mcp-server/mini-services/mcp-server
bun run dev
```

---

### Problem: "git clone fails"

**Solution:**
```bash
# Update git first
pkg update && pkg upgrade git

# Try cloning with full URL
git clone https://github.com/SoundsguyZA/android-mcp-server.git

# If using http instead:
git clone http://github.com/SoundsguyZA/android-mcp-server.git
```

---

### Problem: "Out of memory" (unlikely with 16GB RAM!)

**Solution:**
```bash
# Increase memory limit for Node.js
export NODE_OPTIONS="--max-old-space-size=8192"

# Then run your commands
bun run dev
```

---

## 📊 Performance Tips for Your Pura80 Pro

### Optimize for Speed

```bash
# Use bun instead of node (already done!)
bun --version

# Keep Termux in background, don't minimize
# Termux:Float can help (install from F-Droid)

# Close unnecessary apps to free RAM
```

### Battery Optimization

1. **Add Termux to battery whitelist:**
   - Settings → Battery → App Launch Management
   - Find Termux → Enable "Manage automatically"

2. **Use while charging** for long-running tasks

3. **Disable aggressive doze mode** for Termux

---

## 🎯 Quick Reference Commands

```bash
# Go to project
cd ~/android-mcp-server

# Start Next.js dashboard (port 3000)
bun run dev

# Start MCP server (port 3001) - in separate terminal
cd mini-services/mcp-server
bun run dev

# Update everything
cd ~/android-mcp-server && git pull && bun install

# Check server logs
# Just look at the terminal where you ran bun run dev

# Stop all servers
killall bun
```

---

## 🌐 Network Access (Access from Other Devices)

### Find Your Phone's IP

```bash
# Show IP address
ip addr show | grep inet
```

### Access from Your Computer

If your phone and computer are on same WiFi:

```
http://YOUR_PHONE_IP:3000
```

For example: `http://192.168.1.100:3000`

### Use ngrok for External Access (Advanced)

```bash
# Install ngrok
pkg install wget
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
tar -xvf ngrok-v3-stable-linux-arm64.tgz

# Start ngrok tunnel (in new terminal)
./ngrok http 3000

# You'll get a URL like: https://xyz.ngrok.io
# Share this URL to access from anywhere!
```

---

## 📚 Next Steps After Setup

### 1. Connect AI Assistants

Now that it's running, you can connect:
- **Claude Desktop** - Add to MCP config
- **Genspark** - Use HTTP API
- **Z.ai** - Use MCP endpoint
- **Any AI** - Use WebSocket for real-time

### 2. Create Useful Automations

```bash
# Example: Backup script
# Create: ~/backup.sh
nano ~/backup.sh

# Add:
#!/data/data/com.termux/files/usr/bin/bash
# Backup your important files
tar -czf ~/backup-$(date +%Y%m%d).tar.gz ~/storage/shared/Documents
```

### 3. Learn More

- Read `QUICKSTART.md` for advanced usage
- Read `mini-services/mcp-server/README.md` for API docs
- Experiment with the 14 available tools!

---

## ✅ Success Checklist

When you're done, you should have:

- ✅ Termux updated with git, curl, nano
- ✅ Bun installed and working
- ✅ Storage access enabled
- ✅ Project cloned from GitHub
- ✅ All dependencies installed
- ✅ MCP server running (port 3001)
- ✅ Next.js dashboard running (port 3000)
- ✅ Dashboard accessible at http://localhost:3000
- ✅ Status showing "Connected" in green
- ✅ Tools listing showing 14 available tools

---

## 🎉 You're All Set!

Your **Huawei Pura80 Pro** is now a powerful AI-powered development platform!

With 16GB RAM and this MCP server, you can:
- ✅ Write code with AI assistance
- ✅ Run terminal commands from anywhere
- ✅ Manage files remotely
- ✅ Monitor system resources
- ✅ Create automations
- ✅ Much more!

---

## 🆘 Need Help?

If something doesn't work:

1. **Check this guide** - most solutions are here
2. **Check the README** - `mini-services/mcp-server/README.md`
3. **Check terminal logs** - they often tell you what's wrong
4. **Try one command at a time** - make sure each works before moving on
5. **Restart Termux** - sometimes fixes weird issues

---

**Made for your Huawei Pura80 Pro 📱✨**
*16GB RAM, 512GB Storage, Kirin Chip - A True Development Powerhouse!*

---

## 📞 Quick Commands Summary

```bash
# Setup (one-time)
pkg update && pkg upgrade
pkg install git curl nano
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
termux-setup-storage

# Clone and Install (one-time)
cd ~
git clone http://github.com/SoundsguyZA/android-mcp-server.git
cd ~/android-mcp-server
bun install
cd mini-services/mcp-server && bun install && cd ~/android-mcp-server

# Run (every time)
# Terminal 1: MCP Server
cd ~/android-mcp-server/mini-services/mcp-server
bun run dev

# Terminal 2: Dashboard (open new session)
cd ~/android-mcp-server
bun run dev

# Access
# Open Chrome: http://localhost:3000
```

---

**Good luck and enjoy your AI-powered Android development experience!** 🚀
