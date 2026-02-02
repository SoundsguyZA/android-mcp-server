import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { exec } from "child_process";
import { promisify } from "util";
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, existsSync, mkdirSync, rmSync, copyFileSync, renameSync } from "fs";
import { join, normalize, resolve, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MCP Server Configuration
const MCP_PORT = 3001;
const ALLOWED_PATHS = [
  process.env.HOME || "/home/user",
  "/tmp",
  process.env.TERMUX_HOME || "/data/data/com.termux/files/home"
];

// Tool definitions for MCP protocol
interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  dangerous?: boolean;
}

const MCP_TOOLS: MCPTool[] = [
  {
    name: "filesystem_read_file",
    description: "Read the contents of a file",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the file to read"
        },
        encoding: {
          type: "string",
          description: "File encoding (default: utf-8)",
          default: "utf-8"
        }
      },
      required: ["path"]
    }
  },
  {
    name: "filesystem_write_file",
    description: "Write content to a file",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the file to write"
        },
        content: {
          type: "string",
          description: "Content to write to the file"
        },
        encoding: {
          type: "string",
          description: "File encoding (default: utf-8)",
          default: "utf-8"
        }
      },
      required: ["path", "content"]
    }
  },
  {
    name: "filesystem_list_directory",
    description: "List contents of a directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the directory to list",
          default: "."
        },
        recursive: {
          type: "boolean",
          description: "List recursively",
          default: false
        },
        showHidden: {
          type: "boolean",
          description: "Show hidden files",
          default: false
        }
      }
    }
  },
  {
    name: "filesystem_get_info",
    description: "Get file/directory information",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to get info for"
        }
      },
      required: ["path"]
    }
  },
  {
    name: "filesystem_create_directory",
    description: "Create a directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the directory to create"
        },
        recursive: {
          type: "boolean",
          description: "Create parent directories if needed",
          default: true
        }
      },
      required: ["path"]
    }
  },
  {
    name: "filesystem_delete",
    description: "Delete a file or directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to delete"
        },
        recursive: {
          type: "boolean",
          description: "Delete recursively for directories",
          default: true
        }
      },
      required: ["path"]
    },
    dangerous: true
  },
  {
    name: "filesystem_copy",
    description: "Copy a file or directory",
    inputSchema: {
      type: "object",
      properties: {
        source: {
          type: "string",
          description: "Source path"
        },
        destination: {
          type: "string",
          description: "Destination path"
        }
      },
      required: ["source", "destination"]
    }
  },
  {
    name: "filesystem_move",
    description: "Move or rename a file or directory",
    inputSchema: {
      type: "object",
      properties: {
        source: {
          type: "string",
          description: "Source path"
        },
        destination: {
          type: "string",
          description: "Destination path"
        }
      },
      required: ["source", "destination"]
    }
  },
  {
    name: "shell_execute",
    description: "Execute a shell command",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Command to execute"
        },
        timeout: {
          type: "number",
          description: "Timeout in seconds (default: 30)",
          default: 30
        },
        cwd: {
          type: "string",
          description: "Working directory",
          default: "."
        }
      },
      required: ["command"]
    },
    dangerous: true
  },
  {
    name: "shell_execute_interactive",
    description: "Execute a command with interactive streaming output",
    inputSchema: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "Command to execute"
        },
        timeout: {
          type: "number",
          description: "Timeout in seconds (default: 60)",
          default: 60
        },
        cwd: {
          type: "string",
          description: "Working directory",
          default: "."
        }
      },
      required: ["command"]
    },
    dangerous: true
  },
  {
    name: "system_get_info",
    description: "Get system information",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "system_get_disk_usage",
    description: "Get disk usage information",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to check (default: /)",
          default: "/"
        }
      }
    }
  },
  {
    name: "system_get_memory_info",
    description: "Get memory information",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "system_list_processes",
    description: "List running processes",
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          description: "Filter by name (optional)"
        }
      }
    }
  }
];

// Path validation
function isPathAllowed(path: string): boolean {
  const normalized = normalize(path);
  return ALLOWED_PATHS.some(allowed => normalized.startsWith(allowed));
}

function resolvePath(path: string): string {
  const resolved = resolve(path);
  if (!isPathAllowed(resolved)) {
    throw new Error(`Path not allowed: ${resolved}`);
  }
  return resolved;
}

// Tool implementations
async function toolHandler(toolName: string, params: any) {
  console.log(`Executing tool: ${toolName}`, params);

  try {
    switch (toolName) {
      case "filesystem_read_file": {
        const path = resolvePath(params.path);
        const encoding = params.encoding || "utf-8";
        const content = readFileSync(path, { encoding });
        return {
          success: true,
          path,
          content,
          size: content.length
        };
      }

      case "filesystem_write_file": {
        const path = resolvePath(params.path);
        const content = params.content;
        const encoding = params.encoding || "utf-8";
        
        // Ensure parent directory exists
        const dir = dirname(path);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        
        writeFileSync(path, content, { encoding });
        return {
          success: true,
          path,
          size: content.length
        };
      }

      case "filesystem_list_directory": {
        const path = resolvePath(params.path || ".");
        const recursive = params.recursive || false;
        const showHidden = params.showHidden || false;
        
        const listEntries = (dir: string, prefix: string = ""): any[] => {
          const entries: any[] = [];
          try {
            const files = readdirSync(dir);
            
            for (const file of files) {
              if (!showHidden && file.startsWith(".")) continue;
              
              const fullPath = join(dir, file);
              const stats = statSync(fullPath);
              const relativePath = join(prefix, file);
              
              const entry = {
                name: file,
                path: relativePath,
                fullPath,
                type: stats.isDirectory() ? "directory" : "file",
                size: stats.size,
                modified: stats.mtime.toISOString(),
                permissions: stats.mode.toString(8)
              };
              
              entries.push(entry);
              
              if (recursive && stats.isDirectory()) {
                entries.push(...listEntries(fullPath, relativePath));
              }
            }
          } catch (err: any) {
            console.error(`Error listing ${dir}:`, err.message);
          }
          return entries;
        };
        
        const entries = listEntries(path);
        return {
          success: true,
          path,
          entries,
          count: entries.length
        };
      }

      case "filesystem_get_info": {
        const path = resolvePath(params.path);
        const stats = statSync(path);
        
        return {
          success: true,
          path,
          type: stats.isDirectory() ? "directory" : "file",
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
          accessed: stats.atime.toISOString(),
          permissions: stats.mode.toString(8),
          isReadable: true,
          isWritable: true
        };
      }

      case "filesystem_create_directory": {
        const path = resolvePath(params.path);
        const recursive = params.recursive !== false;
        
        mkdirSync(path, { recursive });
        return {
          success: true,
          path
        };
      }

      case "filesystem_delete": {
        const path = resolvePath(params.path);
        const recursive = params.recursive !== false;
        
        rmSync(path, { recursive, force: true });
        return {
          success: true,
          path
        };
      }

      case "filesystem_copy": {
        const source = resolvePath(params.source);
        const dest = resolvePath(params.destination);
        
        copyFileSync(source, dest);
        return {
          success: true,
          source,
          destination: dest
        };
      }

      case "filesystem_move": {
        const source = resolvePath(params.source);
        const dest = resolvePath(params.destination);
        
        renameSync(source, dest);
        return {
          success: true,
          source,
          destination: dest
        };
      }

      case "shell_execute": {
        const command = params.command;
        const timeout = (params.timeout || 30) * 1000;
        const cwd = resolvePath(params.cwd || ".");
        
        const { stdout, stderr } = await execAsync(command, {
          cwd,
          timeout,
          maxBuffer: 10 * 1024 * 1024 // 10MB
        });
        
        return {
          success: true,
          command,
          exitCode: 0,
          stdout,
          stderr
        };
      }

      case "system_get_info": {
        // Get system information
        const osInfo = {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          homeDir: process.env.HOME,
          termux: !!process.env.TERMUX_HOME,
          pwd: process.cwd(),
          env: {
            LANG: process.env.LANG,
            PATH: process.env.PATH
          }
        };
        
        return {
          success: true,
          ...osInfo
        };
      }

      case "system_get_disk_usage": {
        const path = params.path || "/";
        const { stdout } = await execAsync(`df -h "${path}"`);
        
        return {
          success: true,
          path,
          output: stdout.trim()
        };
      }

      case "system_get_memory_info": {
        let memoryInfo = {};
        
        try {
          if (existsSync("/proc/meminfo")) {
            const meminfo = readFileSync("/proc/meminfo", "utf-8");
            const lines = meminfo.split("\n").slice(0, 10);
            memoryInfo = lines.reduce((acc: any, line) => {
              const [key, value, unit] = line.split(/\s+/);
              if (key) {
                acc[key.replace(":", "")] = { value, unit: unit || "kB" };
              }
              return acc;
            }, {});
          } else {
            const { stdout } = await execAsync("free -h");
            memoryInfo = { raw: stdout.trim() };
          }
        } catch (err) {
          const { stdout } = await execAsync("free -h");
          memoryInfo = { raw: stdout.trim() };
        }
        
        return {
          success: true,
          ...memoryInfo
        };
      }

      case "system_list_processes": {
        const filter = params.filter;
        let cmd = "ps aux";
        if (filter) {
          cmd += ` | grep ${filter}`;
        }
        
        const { stdout } = await execAsync(cmd);
        
        return {
          success: true,
          filter,
          processes: stdout.trim()
        };
      }

      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`
        };
    }
  } catch (error: any) {
    console.error(`Error executing ${toolName}:`, error);
    return {
      success: false,
      error: error.message || "Unknown error"
    };
  }
}

// Create HTTP server
const httpServer = createServer((req, res) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Health check
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "healthy",
      version: "1.0.0",
      platform: process.platform,
      arch: process.arch,
      tools: MCP_TOOLS.length
    }));
    return;
  }
  
  // List available tools
  if (url.pathname === "/tools") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      tools: MCP_TOOLS
    }));
    return;
  }
  
  // Execute tool via HTTP POST
  if (url.pathname === "/execute" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const { tool, params } = JSON.parse(body);
        const result = await toolHandler(tool, params);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (error: any) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    });
    return;
  }
  
  // MCP protocol endpoint
  if (url.pathname === "/mcp") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      name: "android-mcp-server",
      version: "1.0.0",
      description: "MCP Server for Android with Desktop Agent Capabilities",
      tools: MCP_TOOLS
    }));
    return;
  }
  
  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

// WebSocket connection handler
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Send tools list on connection
  socket.emit("tools", MCP_TOOLS);
  
  // Handle tool execution request
  socket.on("execute", async (data: { tool: string; params: any }, callback) => {
    const { tool, params } = data;
    console.log(`[${socket.id}] Executing: ${tool}`);
    
    const result = await toolHandler(tool, params);
    if (callback) {
      callback(result);
    } else {
      socket.emit("result", { tool, result });
    }
  });
  
  // Handle interactive command execution
  socket.on("command", async (data: { command: string; cwd?: string; timeout?: number }, callback) => {
    const { command, cwd, timeout } = data;
    console.log(`[${socket.id}] Interactive command: ${command}`);
    
    if (callback) callback({ success: true, message: "Starting command..." });
    
    try {
      const child = exec(command, {
        cwd: cwd ? resolvePath(cwd) : ".",
        timeout: (timeout || 60) * 1000,
        maxBuffer: 10 * 1024 * 1024
      });
      
      child.stdout?.on("data", (data) => {
        socket.emit("command_output", { type: "stdout", data: data.toString() });
      });
      
      child.stderr?.on("data", (data) => {
        socket.emit("command_output", { type: "stderr", data: data.toString() });
      });
      
      child.on("close", (code) => {
        socket.emit("command_output", { type: "close", exitCode: code });
        console.log(`[${socket.id}] Command exited with code ${code}`);
      });
      
    } catch (error: any) {
      socket.emit("command_output", { type: "error", error: error.message });
    }
  });
  
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
httpServer.listen(MCP_PORT, () => {
  console.log("=".repeat(60));
  console.log("🚀 Android MCP Server Started!");
  console.log("=".repeat(60));
  console.log(`📡 HTTP Server: http://localhost:${MCP_PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${MCP_PORT}`);
  console.log(`🛠️  Tools Available: ${MCP_TOOLS.length}`);
  console.log(`📱 Platform: ${process.platform} ${process.arch}`);
  console.log(`🏠 Allowed Paths: ${ALLOWED_PATHS.join(", ")}`);
  console.log("=".repeat(60));
  console.log("\nAvailable Endpoints:");
  console.log(`  GET  /health     - Health check`);
  console.log(`  GET  /tools      - List all tools`);
  console.log(`  POST /execute    - Execute a tool`);
  console.log(`  GET  /mcp        - MCP protocol info`);
  console.log("\nWebSocket Events:");
  console.log(`  client -> server: execute, command`);
  console.log(`  server -> client: tools, result, command_output`);
  console.log("=".repeat(60));
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\nShutting down gracefully...");
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
