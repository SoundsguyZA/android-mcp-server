# 🚀 Android MCP Server - Quick Start Guide

**Desktop Agent Capabilities on Android - Get Started in 5 Minutes!**

---

## 📱 What You've Built

A complete MCP (Model Context Protocol) server that enables AI assistants like Claude, Genspark, and Z.ai to:

- ✅ Read/write files on your Android device
- ✅ Execute shell commands with real-time output
- ✅ Browse and manage your filesystem
- ✅ Monitor system resources (CPU, memory, disk)
- ✅ List and manage running processes
- ✅ All accessible from a beautiful web dashboard!

---

## 🎯 Current Status

✅ **Web Dashboard**: Running on port 3000 (Preview Panel)
✅ **MCP Server**: Ready to start on port 3001
✅ **Dependencies**: Installed and ready

---

## ⚡ Quick Start (3 Steps)

### Step 1: Start the MCP Server

Open a terminal and run:

```bash
cd mini-services/mcp-server
bun run dev
```

You should see:

```
🚀 Android MCP Server Started!
📡 HTTP Server: http://localhost:3001
🔌 WebSocket: ws://localhost:3001
🛠️  Tools Available: 14
```

**Keep this terminal open!** The server needs to stay running.

### Step 2: Open the Dashboard

1. Look at the **Preview Panel** on the right side of this interface
2. Click **"Open in New Tab"** button above the Preview Panel
3. You'll see the Android MCP Dashboard with:
   - Connection status (should show "Connected" green)
   - System information
   - Available tools
   - Terminal interface

### Step 3: Test It!

Try these from the dashboard:

**Filesystem Test:**
1. Go to "Tools" tab
2. Click "filesystem_list_directory"
3. Click "Execute Tool"
4. See your current directory contents!

**Terminal Test:**
1. Go to "Terminal" tab
2. Type: `ls -la`
3. Click "Run"
4. Watch real-time output streaming!

**System Test:**
1. Go to "System" tab
2. Click "Get Memory Info"
3. See your device's memory statistics!

---

## 🔌 Connecting AI Assistants

### Option 1: Direct HTTP Integration

Use this Python example to connect any AI assistant:

```python
import requests
import json

SERVER_URL = "http://localhost:3001"

def execute_tool(tool_name, params):
    response = requests.post(
        f"{SERVER_URL}/execute",
        json={"tool": tool_name, "params": params}
    )
    return response.json()

# Example: List files
result = execute_tool("filesystem_list_directory", {
    "path": ".",
    "recursive": False
})
print(result)
```

### Option 2: WebSocket Integration (Real-time)

```python
import asyncio
import websockets
import json

async def connect_mcp():
    uri = "ws://localhost:3001"
    async with websockets.connect(uri) as websocket:
        # Receive available tools
        tools = await websocket.recv()
        print(f"Available tools: {tools}")
        
        # Execute a tool
        await websocket.send(json.dumps({
            "tool": "system_get_info",
            "params": {}
        }))
        
        result = await websocket.recv()
        print(f"Result: {result}")

asyncio.run(connect_mcp())
```

### Option 3: Connect to Claude Desktop

Create/edit this file:

**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "android": {
      "command": "node",
      "args": ["/home/z/my-project/mini-services/mcp-server/index.js"]
    }
  }
}
```

Restart Claude Desktop, and you'll have access to all Android tools!

---

## 🛠️ Available Tools

### Filesystem (8 tools)
- `filesystem_read_file` - Read any file
- `filesystem_write_file` - Write/create files
- `filesystem_list_directory` - Browse directories
- `filesystem_get_info` - Get file details
- `filesystem_create_directory` - Create folders
- `filesystem_delete` - Delete files/folders ⚠️
- `filesystem_copy` - Copy files
- `filesystem_move` - Move/rename files

### Shell (2 tools)
- `shell_execute` - Run commands (with timeout)
- `shell_execute_interactive` - Run with real-time output ⚠️

### System (4 tools)
- `system_get_info` - Get platform info
- `system_get_disk_usage` - Check disk space
- `system_get_memory_info` - Check RAM usage
- `system_list_processes` - See running processes

---

## 📱 Android/Termux Setup (On Your Device)

If deploying to your Huawei Pura80 Pro:

### 1. Install Termux

Download from F-Droid or GitHub (not Play Store for full features)

### 2. Setup in Termux

```bash
# Update packages
pkg update && pkg upgrade

# Install bun
curl -fsSL https://bun.sh/install | bash

# Enable storage access
termux-setup-storage

# Clone your project
cd ~
git clone <your-repo-url>
cd <your-repo>/mini-services/mcp-server

# Install dependencies
bun install

# Start server
bun run dev
```

### 3. Access from Android Browser

- Open Chrome/Firefox on your Android device
- Navigate to `http://localhost:3000`
- Dashboard will auto-connect to MCP server

---

## 🎨 Dashboard Features

### **Tools Tab**
- Browse all 14 available tools
- Select any tool and fill in parameters
- Execute and see results immediately
- Dangerous operations are marked with red badges

### **Terminal Tab**
- Interactive shell with real-time output
- Color-coded output (stdout, stderr, errors)
- Perfect for long-running commands

### **Filesystem Tab**
- Quick access to common file operations
- Last result display
- Easy navigation

### **System Tab**
- System information at a glance
- Quick buttons for common queries
- Detailed command results

---

## 🔒 Security Notes

⚠️ **Important**: This server gives filesystem and shell access!

- Path restrictions are configured in `ALLOWED_PATHS`
- Destructive tools are marked as "dangerous"
- Commands have timeout protection (default 30-60s)
- **Never expose this server to the public internet!**

### Adding API Key Protection (Optional)

Edit `mini-services/mcp-server/index.ts` and add:

```typescript
const API_KEY = "your-secret-key-here";

// Add before route handlers
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});
```

Then include header in requests:
```javascript
headers: { "Authorization": "Bearer your-secret-key-here" }
```

---

## 💡 Use Case Examples

### 1. Code Development with Claude

```
Claude: "Read the app.tsx file"
→ Claude can now read from your Android device!

Claude: "Write a new component to src/components/Widget.tsx"
→ Claude creates the file on your device!

Claude: "Run the tests with npm test"
→ Claude executes command and sees results in real-time!
```

### 2. File Management

```
AI: "List all PDF files in ~/Downloads"
→ Scans recursively and shows results

AI: "Create a backup of my project folder"
→ Copies files, compresses if needed
```

### 3. System Monitoring

```
AI: "Check if any process is using too much memory"
→ Lists processes, identifies memory hogs

AI: "How much free disk space do I have?"
→ Gets disk usage information
```

### 4. Automation

```
AI: "Create a script to backup my photos daily"
→ Writes shell script, saves to crontab

AI: "Run a build and email me if it fails"
→ Executes build, monitors output
```

---

## 🐛 Troubleshooting

### "Server Not Connected" Error

**Solution:** The MCP server isn't running. Start it:

```bash
cd mini-services/mcp-server
bun run dev
```

### Command Times Out

**Solution:** Increase timeout in tool parameters:

```javascript
{
  tool: "shell_execute",
  params: {
    command: "long-running-command",
    timeout: 300  // 5 minutes
  }
}
```

### Permission Denied

**Solution:** In Termux, run:

```bash
termux-setup-storage
```

This grants file system permissions.

### Port Already in Use

**Solution:** Kill the process:

```bash
lsof -i :3001
kill -9 <PID>
```

---

## 📊 Performance Notes

**On Your Huawei Pura80 Pro:**
- ✅ 16GB RAM: Can handle multiple concurrent operations
- ✅ 512GB Storage: Plenty of space for projects
- ✅ Kirin Chip: Optimized with Bun runtime
- ✅ Should handle most development tasks smoothly!

**Optimizations:**
- Using Bun instead of Node for 3-4x faster startup
- WebSocket for real-time, low-latency communication
- Streaming output for large responses
- Efficient path validation

---

## 🎉 What's Next?

### Possible Enhancements:

1. **Screen Capture Tool** - Add Android-specific screen reading
2. **Clipboard Integration** - Read/write clipboard content
3. **Notification Tool** - Send Android notifications
4. **Database Tools** - Built-in database management
5. **Web Server Tool** - Start local web servers
6. **Git Integration** - Enhanced git operations
7. **AI Integration** - Built-in AI assistant connection

### Integration with AI Platforms:

- **Claude Desktop**: Use MCP configuration
- **Claude Web**: Use HTTP/WebSocket API
- **Genspark**: Use HTTP API
- **Z.ai**: Use MCP endpoint
- **Custom AI Agents**: Use WebSocket for real-time

---

## 📚 Full Documentation

Complete documentation available at:
```
mini-services/mcp-server/README.md
```

Includes:
- Detailed API documentation
- Security best practices
- Android optimization tips
- Troubleshooting guide
- Example integrations

---

## 🤝 Need Help?

1. Check the README in `mini-services/mcp-server/`
2. Review this Quick Start guide
3. Check terminal logs for errors
4. Test with the dashboard first before AI integration

---

## 🌟 You're Pioneering!

This is one of the first **Android-native MCP servers** that enables AI assistants to have desktop agent capabilities on mobile devices!

You've successfully:
- ✅ Built a complete MCP server
- ✅ Created a beautiful web dashboard
- ✅ Enabled real-time command execution
- ✅ Prepared for AI assistant integration

**Enjoy your new capabilities!** 🎊

---

*Made with ❤️ for your Huawei Pura80 Pro*
*Android + AI = Infinite Possibilities* 🚀
