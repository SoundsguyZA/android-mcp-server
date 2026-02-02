# Android MCP Server

**Desktop Agent Capabilities on Android** 🚀

Bring the power of desktop agent tools to your Android device! This MCP (Model Context Protocol) server enables AI assistants like Claude, Genspark, and Z.ai to access filesystem, execute commands, and interact with your Android system from a web browser.

## 🎯 Features

- **Filesystem Operations**: Read, write, list, delete, copy, and move files
- **Command Execution**: Run shell commands with real-time output streaming
- **System Information**: Get CPU, memory, disk usage, and process information
- **MCP Protocol Compatible**: Standard protocol for AI assistant integration
- **WebSocket Support**: Real-time bidirectional communication
- **Web Dashboard**: Beautiful UI for manual control and monitoring
- **Android/Termux Optimized**: Designed specifically for Android environment

## 📱 Requirements

- Android device (tested on Huawei Pura80 Pro with 16GB RAM, 512GB storage)
- Termux installed (Linux environment on Android)
- Node.js/Bun runtime
- Web browser (Chrome/Firefox/Safari)

## 🛠️ Installation

### 1. Install Termux on Android

```bash
# Update packages
pkg update && pkg upgrade

# Install required packages
pkg install nodejs git curl

# Or install bun for faster performance
curl -fsSL https://bun.sh/install | bash
```

### 2. Clone and Setup

```bash
# Clone your project repository
git clone <your-repo-url>
cd your-repo/mini-services/mcp-server

# Install dependencies
bun install

# Or with npm
npm install
```

## 🚀 Running the Server

### Development Mode (with hot reload)

```bash
bun run dev
```

### Production Mode

```bash
bun run start
```

The server will start on **port 3001** by default.

## 🌐 Accessing the Dashboard

Once the server is running:

1. Open your web browser on Android
2. Navigate to the Next.js app (usually on port 3000)
3. The dashboard will auto-connect to the MCP server on port 3001
4. Or directly access: `http://localhost:3001`

## 🔧 Available Tools

### Filesystem Tools

1. **`filesystem_read_file`** - Read file contents
   - Parameters: `path`, `encoding` (optional)

2. **`filesystem_write_file`** - Write content to a file
   - Parameters: `path`, `content`, `encoding` (optional)

3. **`filesystem_list_directory`** - List directory contents
   - Parameters: `path`, `recursive`, `showHidden`

4. **`filesystem_get_info`** - Get file/directory information
   - Parameters: `path`

5. **`filesystem_create_directory`** - Create directory
   - Parameters: `path`, `recursive`

6. **`filesystem_delete`** - Delete file/directory ⚠️
   - Parameters: `path`, `recursive`

7. **`filesystem_copy`** - Copy file/directory
   - Parameters: `source`, `destination`

8. **`filesystem_move`** - Move/rename file/directory
   - Parameters: `source`, `destination`

### Shell Tools

9. **`shell_execute`** - Execute shell command ⚠️
   - Parameters: `command`, `timeout`, `cwd`

10. **`shell_execute_interactive`** - Execute with streaming output ⚠️
    - Parameters: `command`, `timeout`, `cwd`

### System Tools

11. **`system_get_info`** - Get system information
    - No parameters

12. **`system_get_disk_usage`** - Get disk usage
    - Parameters: `path` (optional)

13. **`system_get_memory_info`** - Get memory information
    - No parameters

14. **`system_list_processes`** - List running processes
    - Parameters: `filter` (optional)

## 🔌 Connecting AI Assistants

### Connecting via HTTP

The MCP server exposes a REST API:

```javascript
// List available tools
const toolsResponse = await fetch('http://localhost:3001/tools');
const { tools } = await toolsResponse.json();

// Execute a tool
const result = await fetch('http://localhost:3001/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'filesystem_list_directory',
    params: {
      path: '.',
      recursive: false
    }
  })
});
const data = await result.json();
console.log(data);
```

### Connecting via WebSocket (Recommended)

For real-time streaming:

```javascript
const socket = new WebSocket('ws://localhost:3001');

socket.onopen = () => {
  console.log('Connected to MCP server');
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.tools) {
    console.log('Available tools:', message.tools);
  }
  
  if (message.result) {
    console.log('Tool result:', message.result);
  }
  
  if (message.command_output) {
    console.log('Command output:', message.command_output);
  }
};

// Execute a tool
socket.send(JSON.stringify({
  tool: 'system_get_info',
  params: {}
}));

// Execute interactive command
socket.send(JSON.stringify({
  command: 'ls -la',
  cwd: '.',
  timeout: 60
}));
```

### Connecting to Claude Desktop

Create a Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "android": {
      "command": "node",
      "args": ["/path/to/mcp-server/index.js"],
      "env": {
        "SERVER_URL": "http://localhost:3001"
      }
    }
  }
}
```

### Connecting to Z.ai

Use the MCP protocol endpoint:

```javascript
// Get server info
const mcpInfo = await fetch('http://localhost:3001/mcp');
const serverConfig = await mcpInfo.json();

console.log('MCP Server:', serverConfig);
// Use serverConfig.tools to integrate with Z.ai
```

## 🔒 Security Considerations

⚠️ **Important**: This server provides filesystem and shell access. Use with caution!

1. **Path Restrictions**: The server only allows access to specific paths (configured in `ALLOWED_PATHS`)
2. **Destructive Operations**: Tools marked as `dangerous` should be used with extreme caution
3. **Authentication**: Consider adding authentication for production use
4. **Network Access**: Ensure the server is not exposed to public networks
5. **Command Timeout**: Commands have default timeouts to prevent hanging

### Adding Authentication (Example)

```typescript
// Add to index.ts
const API_KEY = process.env.API_KEY || 'your-secret-key';

app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

## 📱 Android-Specific Tips

### Termux Configuration

```bash
# Enable storage access
termux-setup-storage

# Install additional tools
pkg install python git vim htop

# Start server automatically on boot
# Add to Termux:Boot script
cd /path/to/mcp-server && bun run start
```

### Performance Optimization

```bash
# Use bun instead of node for better performance on Android
curl -fsSL https://bun.sh/install | bash

# Increase memory limit if needed
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Battery Optimization

- Add Termux to battery whitelist
- Disable aggressive doze mode for Termux
- Consider using a charging cable for long-running operations

## 🌟 Use Cases

1. **Remote Code Development**: Use Claude/Genspark to write, run, and debug code on your phone
2. **File Management**: Organize files, batch rename, search content
3. **System Monitoring**: Check resources, running processes, disk usage
4. **Automation**: Create and run automation scripts
5. **Learning**: Experiment with Linux commands and shell scripting
6. **Development Testing**: Test web applications locally on your Android device

## 🐛 Troubleshooting

### Server won't start

```bash
# Check if port is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Check logs
bun run dev 2>&1 | tee server.log
```

### Connection refused

- Ensure Termux is running
- Check if the server is actually running
- Verify firewall settings
- Try connecting via HTTP first

### Filesystem access denied

- Run `termux-setup-storage` to grant storage permissions
- Check the `ALLOWED_PATHS` configuration
- Verify the path exists

### Command timeout

- Increase timeout parameter
- Check if command requires user input
- Use interactive mode for long-running commands

## 📊 Monitoring and Debugging

The dashboard provides real-time information:

- Connection status
- Available tools
- System information
- Command output
- Tool execution results

## 🤝 Contributing

This is a pioneering project! Suggestions and contributions welcome:

1. Additional tools (screen capture, clipboard, etc.)
2. Better security mechanisms
3. Mobile-optimized features
4. AI assistant integrations
5. Performance optimizations

## 📝 License

MIT License - Feel free to use and modify!

## 🎉 Acknowledgments

- Built for the Huawei Pura80 Pro (16GB RAM, 512GB Storage)
- Powered by Kirin chip
- Termux community for making Android development possible
- MCP (Model Context Protocol) for standardization

---

**Made with ❤️ for Android Developers and AI Enthusiasts**

For support and updates, check the project repository and join the community!
