'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Terminal, 
  Folder, 
  FileText, 
  Cpu, 
  HardDrive, 
  Network, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Zap,
  Smartphone,
  Shield,
  Command
} from 'lucide-react'

interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
  dangerous?: boolean
}

interface ToolResult {
  success: boolean
  error?: string
  [key: string]: any
}

export default function MCPDashboard() {
  const initialServerUrl = typeof window !== 'undefined' 
    ? window.location.origin.replace('3000', '3001') 
    : ''
  
  const [connected, setConnected] = useState(false)
  const [serverUrl, setServerUrl] = useState(initialServerUrl)
  const [tools, setTools] = useState<MCPTool[]>([])
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null)
  const [toolParams, setToolParams] = useState<Record<string, any>>({})
  const [result, setResult] = useState<ToolResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [command, setCommand] = useState('')
  const [commandOutput, setCommandOutput] = useState<Array<{ type: string; data: string }>>([])
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const socketRef = useRef<any>(null)

  const connectToServer = async (url: string) => {
    try {
      const response = await fetch(`${url}/health`, {
        mode: 'cors'
      })
      if (response.ok) {
        const health = await response.json()
        console.log('Server health:', health)
        setConnected(true)
        
        // Fetch tools
        const toolsResponse = await fetch(`${url}/tools`, { mode: 'cors' })
        const toolsData = await toolsResponse.json()
        setTools(toolsData.tools || [])
        
        // Setup WebSocket
        setupWebSocket(url.replace('http', 'ws'))
        
        // Get system info
        executeTool('system_get_info', {}).then((res) => {
          if (res.success) {
            setSystemInfo(res)
          }
        })
      }
    } catch (error) {
      console.error('Connection failed:', error)
      setConnected(false)
    }
  }

  const setupWebSocket = (wsUrl: string) => {
    try {
      socketRef.current = new WebSocket(wsUrl)
      
      socketRef.current.onopen = () => {
        console.log('WebSocket connected')
      }
      
      socketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data)
        
        if (message.tools) {
          setTools(message.tools)
        }
        
        if (message.result) {
          setResult(message.result)
          setLoading(false)
        }
        
        if (message.command_output) {
          setCommandOutput(prev => [...prev, message.command_output])
        }
      }
      
      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      socketRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        // Auto-reconnect
        setTimeout(() => {
          if (connected) {
            setupWebSocket(wsUrl)
          }
        }, 3000)
      }
    } catch (error) {
      console.error('WebSocket setup failed:', error)
    }
  }

  const executeTool = async (toolName: string, params: Record<string, any>) => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch(`${serverUrl}/execute?XTransformPort=3001`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolName, params })
      })
      
      const data = await response.json()
      setResult(data)
      setLoading(false)
      return data
    } catch (error: any) {
      setResult({ success: false, error: error.message })
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  // Auto-connect to server on mount
  useEffect(() => {
    if (initialServerUrl) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        connectToServer(initialServerUrl)
      }, 0)
      
      return () => clearTimeout(timeoutId)
    }
  }, [])

  const executeCommand = () => {
    if (!command.trim() || !socketRef.current) return
    
    setCommandOutput([])
    socketRef.current.send(JSON.stringify({
      type: 'command',
      data: {
        command,
        cwd: '.',
        timeout: 60
      }
    }))
  }

  const handleToolParamChange = (key: string, value: any) => {
    setToolParams(prev => ({ ...prev, [key]: value }))
  }

  const handleExecuteTool = () => {
    if (selectedTool) {
      executeTool(selectedTool.name, toolParams)
    }
  }

  const refreshServer = () => {
    connectToServer(serverUrl)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900" suppressHydrationWarning>
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Android MCP Server</h1>
                <p className="text-sm text-muted-foreground">Desktop Agent Capabilities on Android</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <Input
                type="url"
                placeholder="Server URL"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="w-64"
              />
              
              <Button onClick={refreshServer} variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform</CardTitle>
              <Smartphone className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemInfo?.platform || 'Unknown'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {systemInfo?.arch || ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tools</CardTitle>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tools.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Home Directory</CardTitle>
              <Folder className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold truncate">
                {systemInfo?.homeDir || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {systemInfo?.termux ? 'Termux Detected' : 'Linux Environment'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Server Status</CardTitle>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {connected ? 'Active' : 'Inactive'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {connected ? 'Ready for commands' : 'Not connected'}
              </p>
            </CardContent>
          </Card>
        </div>

        {!connected && (
          <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertTitle>Server Not Connected</AlertTitle>
            <AlertDescription>
              Make sure the MCP server is running on port 3001. Start it with: 
              <code className="mx-2 px-2 py-1 bg-muted rounded text-xs">
                cd mini-services/mcp-server && bun install && bun run dev
              </code>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="tools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="terminal">Terminal</TabsTrigger>
            <TabsTrigger value="filesystem">Filesystem</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Tools</CardTitle>
                  <CardDescription>Select a tool to execute</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 pr-4">
                    <div className="space-y-2">
                      {tools.map((tool) => (
                        <div
                          key={tool.name}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedTool?.name === tool.name
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => {
                            setSelectedTool(tool)
                            setToolParams({})
                            setResult(null)
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{tool.name}</span>
                                {tool.dangerous && (
                                  <Badge variant="destructive" className="text-xs">
                                    Dangerous
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Execute Tool</CardTitle>
                  <CardDescription>
                    {selectedTool ? `Execute: ${selectedTool.name}` : 'Select a tool'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTool ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {Object.entries(selectedTool.inputSchema.properties).map(([key, prop]: [string, any]) => (
                          <div key={key} className="space-y-2">
                            <label className="text-sm font-medium">
                              {key}
                              {selectedTool.inputSchema.required?.includes(key) && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                            {prop.type === 'string' && prop.description?.toLowerCase().includes('command') ? (
                              <Textarea
                                value={toolParams[key] || ''}
                                onChange={(e) => handleToolParamChange(key, e.target.value)}
                                placeholder={prop.description || key}
                                rows={4}
                              />
                            ) : prop.type === 'string' && (key === 'content' || key === 'command') ? (
                              <Textarea
                                value={toolParams[key] || ''}
                                onChange={(e) => handleToolParamChange(key, e.target.value)}
                                placeholder={prop.description || key}
                                rows={6}
                              />
                            ) : prop.type === 'boolean' ? (
                              <select
                                value={toolParams[key] ?? prop.default ?? 'false'}
                                onChange={(e) => handleToolParamChange(key, e.target.value === 'true')}
                                className="w-full px-3 py-2 rounded-md border bg-background"
                              >
                                <option value="true">true</option>
                                <option value="false">false</option>
                              </select>
                            ) : prop.type === 'number' ? (
                              <Input
                                type="number"
                                value={toolParams[key] || prop.default || ''}
                                onChange={(e) => handleToolParamChange(key, Number(e.target.value))}
                                placeholder={prop.description || key}
                              />
                            ) : (
                              <Input
                                value={toolParams[key] || prop.default || ''}
                                onChange={(e) => handleToolParamChange(key, e.target.value)}
                                placeholder={prop.description || key}
                              />
                            )}
                            <p className="text-xs text-muted-foreground">
                              {prop.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Button 
                        onClick={handleExecuteTool} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Execute Tool
                          </>
                        )}
                      </Button>

                      {result && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className="font-medium">
                              {result.success ? 'Success' : 'Failed'}
                            </span>
                          </div>
                          <ScrollArea className="h-64 rounded-md border bg-muted/50 p-4">
                            <pre className="text-xs whitespace-pre-wrap break-words">
                              {JSON.stringify(result, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Command className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a tool from the list to see its parameters</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Terminal Tab */}
          <TabsContent value="terminal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Terminal</CardTitle>
                <CardDescription>Execute shell commands with real-time output</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 font-mono">$</div>
                  <Input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
                    placeholder="Enter command..."
                    className="font-mono flex-1"
                  />
                  <Button onClick={executeCommand} disabled={!command.trim()}>
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </Button>
                </div>

                <ScrollArea className="h-96 rounded-md border bg-slate-950 p-4">
                  <div className="font-mono text-sm space-y-1">
                    {commandOutput.length === 0 ? (
                      <p className="text-slate-500">
                        Output will appear here after running commands...
                      </p>
                    ) : (
                      commandOutput.map((output, idx) => (
                        <div
                          key={idx}
                          className={`${
                            output.type === 'stderr'
                              ? 'text-red-400'
                              : output.type === 'error'
                              ? 'text-orange-400'
                              : output.type === 'close'
                              ? 'text-blue-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {output.type === 'stdout' || output.type === 'stderr' ? (
                            <span>{output.data}</span>
                          ) : (
                            <span className="italic">
                              [{output.type.toUpperCase()}] {output.data}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filesystem Tab */}
          <TabsContent value="filesystem" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick File Operations</CardTitle>
                  <CardDescription>Common filesystem tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        setSelectedTool(tools.find(t => t.name === 'filesystem_read_file')!)
                        setToolParams({ path: '.' })
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Read File
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTool(tools.find(t => t.name === 'filesystem_list_directory')!)
                        setToolParams({ path: '.', recursive: false, showHidden: false })
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      List Directory
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTool(tools.find(t => t.name === 'filesystem_write_file')!)
                        setToolParams({ path: '', content: '' })
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Write File
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTool(tools.find(t => t.name === 'filesystem_get_info')!)
                        setToolParams({ path: '.' })
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Get File Info
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Last Result</CardTitle>
                  <CardDescription>Most recent filesystem operation</CardDescription>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <ScrollArea className="h-64 rounded-md border bg-muted/50 p-4">
                      <pre className="text-xs whitespace-pre-wrap break-words">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Execute a filesystem operation to see results here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Current system state</CardDescription>
                </CardHeader>
                <CardContent>
                  {systemInfo ? (
                    <ScrollArea className="h-64 rounded-md border bg-muted/50 p-4">
                      <pre className="text-xs whitespace-pre-wrap break-words">
                        {JSON.stringify(systemInfo, null, 2)}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <Button onClick={() => executeTool('system_get_info', {})}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh System Info
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Commands</CardTitle>
                  <CardDescription>Quick system queries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => executeTool('system_get_disk_usage', {})}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <HardDrive className="w-4 h-4 mr-2" />
                    Get Disk Usage
                  </Button>
                  <Button
                    onClick={() => executeTool('system_get_memory_info', {})}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                    Get Memory Info
                  </Button>
                  <Button
                    onClick={() => executeTool('system_list_processes', {})}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    List Processes
                  </Button>
                </CardContent>
              </Card>
            </div>

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Command Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 rounded-md border bg-muted/50 p-4">
                    <pre className="text-xs whitespace-pre-wrap break-words">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Android MCP Server v1.0.0</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Huawei Pura80 Pro Ready</span>
              <Badge variant="outline">
                {connected ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
