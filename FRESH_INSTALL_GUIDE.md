# 🚀 Android MCP Server - FRESH START Guide
## Complete Clean Install for Huawei Pura80 Pro

**This guide assumes you're starting with a clean Termux.**

---

## 📋 PREPARATION - Backup Your Data

**IMPORTANT:** If you have any important files in Termux, back them up first!

```bash
# Check what's in your home directory
ls -la ~

# If you see anything important, move it to storage
cp -r ~/important-files ~/storage/shared/Documents/

# Then continue
```

---

## STEP 1: Complete Cleanup

**Open Termux and run these commands one by one:**

```bash
# Kill any running processes
killall node 2>/dev/null
killall npm 2>/dev/null

# Remove the old project completely
cd ~
rm -rf ~/android-mcp-server

# Remove broken bun if it exists
rm -rf ~/.bun

# Clean .bashrc
echo "" > ~/.bashrc

# Clean npm cache
rm -rf ~/.npm

# Verify cleanup
ls -la ~
```

**You should NOT see `android-mcp-server` folder anymore.**

---

## STEP 2: Update and Install Essentials

```bash
# Update Termux packages
pkg update && pkg upgrade

# Install essential tools
pkg install git curl nano nodejs

# Verify installations
git --version
node --version
npm --version
```

**Expected Output:**
- git: `git version 2.x.x`
- node: `v20.x.x` or similar
- npm: `10.x.x` or similar

**Press Y** if asked to confirm installations.

---

## STEP 3: Enable Storage Access

```bash
# Run storage setup
termux-setup-storage
```

**Tap "Allow"** on the popup that appears.

---

## STEP 4: Clone Your Repository

```bash
# Go to home directory
cd ~

# Clone from GitHub
git clone http://github.com/SoundsguyZA/android-mcp-server.git

# Go into the project
cd ~/android-mcp-server

# Verify you're in the right place
pwd
```

**Expected Output:** `/data/data/com.termux/files/home/android-mcp-server`

```bash
# Check what's in the project
ls -la
```

**You should see:**
- `package.json`
- `src/` folder
- `mini-services/` folder
- `prisma/` folder
- Other files

---

## STEP 5: Install Project Dependencies

```bash
# Make sure you're in project directory
cd ~/android-mcp-server

# Install main dependencies
npm install
```

**This will take 3-5 minutes.** Be patient and wait for it to complete.

**Expected Output:**
```
added 826 packages in 45s
found 0 vulnerabilities
```

---

## STEP 6: Install MCP Server Dependencies

```bash
# Go to MCP server directory
cd ~/android-mcp-server/mini-services/mcp-server

# Install MCP server dependencies
npm install
```

**Expected Output:**
```
added 22 packages in 12s
```

---

## STEP 7: Verify Installation

```bash
# Go back to project root
cd ~/android-mcp-server

# Check that node_modules exists
ls node_modules | head -20

# Check MCP server has dependencies
ls mini-services/mcp-server/node_modules
```

**If you see lists of packages, everything is installed!**

---

## STEP 8: Build the Next.js Project

**We're using production build from the start to avoid Turbopack issues.**

```bash
# Make sure you're in project root
cd ~/android-mcp-server

# Clean any existing build
rm -rf .next

# Build the project
npm run build
```

**This will take 3-5 minutes.** Wait for completion.

**Expected Output:**
```
✓ Compiled successfully
```

**If you see ANY errors, STOP and tell me what they say.**

---

## STEP 9: Start MCP Server (Terminal 1)

**You'll need TWO Termux sessions.**

**In Terminal 1:**

```bash
cd ~/android-mcp-server/mini-services/mcp-server
node index.ts
```

**Expected Output:**
```
============================================================
🚀 Android MCP Server Started!
============================================================
📡 HTTP Server: http://localhost:3001
🔌 WebSocket: ws://localhost:3001
🛠️  Tools Available: 14
📱 Platform: android arm64
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

**✅ MCP Server is RUNNING! Keep this terminal open!**

---

## STEP 10: Start Next.js Dashboard (Terminal 2)

**Open a NEW Termux session:**
- Tap the screen
- Tap "NEW SESSION" button (usually bottom left)

**In the NEW Terminal 2:**

```bash
cd ~/android-mcp-server
npm start
```

**Expected Output:**
```
NODE_ENV=production node .next/standalone/server.js
```

Wait 10-20 seconds. The server should start without errors.

**If you see "Ready" or similar, the dashboard is RUNNING!**

---

## STEP 11: Access the Dashboard

**On your Huawei Pura80 Pro:**

1. Open **Chrome browser**
2. Type in address bar: `http://localhost:3000`
3. Press Enter

**What You Should See:**
- ✅ Beautiful Android MCP Dashboard
- ✅ Green "Connected" status at top right
- ✅ Four status cards:
  - Platform: `android arm64`
  - Tools: `14`
  - Home Directory: `/data/data/com.termux/files/home`
  - Server Status: `Active` (green)
- ✅ Tabs: Tools, Terminal, Filesystem, System

**🎉 SUCCESS! Everything is working!**

---

## STEP 12: Test Your Setup

### Test 1: List Files
1. Click the **"Tools"** tab
2. Click on **`filesystem_list_directory`**
3. Click **"Execute Tool"** button
4. **You should see:** A list of files and folders

### Test 2: Run Terminal Command
1. Click the **"Terminal"** tab
2. Type: `ls -la`
3. Click **"Run"** button
4. **You should see:** Detailed file listing with streaming output

### Test 3: Check System Info
1. Click the **"System"** tab
2. Click **"Get Memory Info"** button
3. **You should see:** Your 16GB RAM usage details

---

## ✅ Success Checklist

When you're done, verify:
- ✅ MCP server running in Terminal 1 with no errors
- ✅ Next.js dashboard running in Terminal 2 with no errors
- ✅ Can access http://localhost:3000 in Chrome
- ✅ Dashboard shows green "Connected" status
- ✅ Can list files via Tools tab
- ✅ Can run commands via Terminal tab
- ✅ System info displays correctly

---

## 📱 How to Start in the Future

After the fresh install, starting the servers is simple:

### **Start MCP Server (Terminal 1):**
```bash
cd ~/android-mcp-server/mini-services/mcp-server
node index.ts
```

### **Start Dashboard (Terminal 2 - NEW SESSION):**
```bash
cd ~/android-mcp-server
npm start
```

### **Stop Everything:**
```bash
# In both terminals, press:
Ctrl+C

# Or force kill:
killall node
```

---

## 🔧 Quick Commands Reference

### **Daily Use:**
```bash
# Start servers (2 terminals)
# Terminal 1:
cd ~/android-mcp-server/mini-services/mcp-server && node index.ts

# Terminal 2:
cd ~/android-mcp-server && npm start
```

### **Update Project Later:**
```bash
# Stop servers first (Ctrl+C in both terminals)

# Go to project
cd ~/android-mcp-server

# Pull latest changes
git pull

# Reinstall dependencies (if needed)
npm install
cd mini-services/mcp-server && npm install
cd ~/android-mcp-server

# Rebuild
rm -rf .next
npm run build

# Start servers again
```

---

## 🆘 Troubleshooting

### "Command not found: node"
```bash
# Install Node.js
pkg install nodejs
```

### "Cannot find module"
```bash
cd ~/android-mcp-server
npm install
cd mini-services/mcp-server && npm install
```

### "Port already in use"
```bash
# Kill all node processes
killall node

# Try again
```

### "Build failed"
```bash
cd ~/android-mcp-server
rm -rf .next
npm run build
```

### "Dashboard shows 'Not Connected'"
- Make sure Terminal 1 is still running
- Check MCP server has no errors
- Restart MCP server in Terminal 1

---

## 📊 What You Just Installed

After this fresh install, you have:

1. **Node.js** - JavaScript runtime (v20.x.x)
2. **npm** - Package manager (v10.x.x)
3. **Your Project** - Cloned from GitHub
4. **826 Dependencies** - All installed and working
5. **MCP Server** - Ready to run on port 3001
6. **Next.js Dashboard** - Built and ready on port 3000
7. **14 AI Tools** - Filesystem, shell, and system operations
8. **Real-time Terminal** - WebSocket-based command execution

---

## 🎯 Next Steps After Success

Once everything is working:

1. **Add to Home Screen:**
   - In Chrome, tap menu (three dots)
   - Tap "Add to Home Screen"
   - Now it works like a native app!

2. **Connect AI Assistants:**
   - Read `mini-services/mcp-server/README.md`
   - Follow instructions for Claude, Genspark, or Z.ai

3. **Explore the Tools:**
   - Read `QUICKSTART.md` for tool descriptions
   - Try each tool from the dashboard

4. **Create Automations:**
   - Use the terminal to create scripts
   - Execute them via MCP server

---

## 💡 Important Reminders

1. **Always use 2 Termux sessions:**
   - Terminal 1: MCP server (port 3001)
   - Terminal 2: Dashboard (port 3000)

2. **Keep Termux open:**
   - Don't minimize both terminals
   - Use Termux:Float for better multitasking (install from F-Droid)

3. **Save this guide:**
   - Copy it to your phone's storage
   - Keep for future reference

4. **Node.js vs Bun:**
   - We're using Node.js (not Bun)
   - It's more stable on ARM64 Android
   - Works perfectly with your Pura80 Pro

---

## 🎉 You're Ready!

Follow this guide step by step, and you'll have a perfectly working Android MCP Server!

**Take your time, don't rush, and verify each step before moving to the next.**

---

## 📞 If You Get Stuck

**Before asking, check:**
1. Did you complete the previous step successfully?
2. Are you in the correct directory? (use `pwd` to check)
3. Do you see the expected output?
4. Is there an error message? What does it say?

**Tell me:**
1. Which STEP you're on
2. The exact command you ran
3. The exact output/error you see

---

**Good luck! Your Huawei Pura80 Pro is about to become an AI-powered development platform!** 🚀

---

## 📋 Quick Reference - All Commands

```bash
# === STEP 1: Cleanup ===
killall node 2>/dev/null
cd ~
rm -rf ~/android-mcp-server
rm -rf ~/.bun
echo "" > ~/.bashrc
rm -rf ~/.npm

# === STEP 2: Install Essentials ===
pkg update && pkg upgrade
pkg install git curl nano nodejs
git --version
node --version
npm --version

# === STEP 3: Storage ===
termux-setup-storage

# === STEP 4: Clone ===
cd ~
git clone http://github.com/SoundsguyZA/android-mcp-server.git
cd ~/android-mcp-server
pwd
ls -la

# === STEP 5: Install Dependencies ===
cd ~/android-mcp-server
npm install

# === STEP 6: MCP Server Dependencies ===
cd ~/android-mcp-server/mini-services/mcp-server
npm install

# === STEP 7: Verify ===
cd ~/android-mcp-server
ls node_modules | head -20
ls mini-services/mcp-server/node_modules

# === STEP 8: Build ===
cd ~/android-mcp-server
rm -rf .next
npm run build

# === STEP 9: Start MCP Server (Terminal 1) ===
cd ~/android-mcp-server/mini-services/mcp-server
node index.ts

# === STEP 10: Start Dashboard (Terminal 2 - NEW SESSION) ===
cd ~/android-mcp-server
npm start

# === STEP 11: Access ===
# Open Chrome: http://localhost:3000
```

---

**Copy this entire guide to your phone for offline reference!** 📱
