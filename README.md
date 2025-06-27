# Loop Agent - Personal Tool Calling Agent

A personal tool calling agent powered by AI with advanced Model Context Protocol (MCP) integration for files, system tasks, web searches, and workflow automation.

## Features

🔄 **Personal Tool Calling Agent** - Chat with Claude and automate your workflows
📁 **File Operations** - Read, write, edit, and list files
💻 **System Integration** - Execute commands and get system information  
🔍 **Web Search** - Search the web for current information (extensible)
🛠️ **Tool Execution** - Visual display of tool calls and results
📱 **Responsive UI** - Seamless chat interface that works on all devices

## Available Tools

- **read_file** - Read the contents of any file
- **list_files** - List files and directories  
- **write_file** - Create new files with content
- **edit_file** - Edit existing files by replacing text
- **system_info** - Get current system information
- **execute_command** - Run shell commands (use with caution!)
- **web_search** - Search the web (extensible for real search APIs)

## Quick Start

1. **Set up your API key:**
   ```bash
   # Edit .env.local and add:
   ANTHROPIC_API_KEY=your_api_key_here
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Examples

Try these prompts to see the agent in action:

- "List the files in the current directory"
- "Show me system information" 
- "Create a simple Python hello world script"
- "Read the package.json file and tell me about this project"
- "Execute the command 'ls -la' and show me the output"
- "Create a new React component for a todo list"

## How It Works

This agent implements the core concepts from the [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) specification:

1. **Tools** - Defined functions that Claude can call
2. **Context** - Maintains conversation state
3. **Execution** - Safely executes tools and returns results

The UI shows:
- 💬 Chat messages
- 🔧 Tool executions with input/output
- ⚡ Real-time responses
- 📊 Visual tool call details

## Security

- File operations are restricted to the project directory
- Commands are executed with current user permissions
- API key is stored securely in environment variables
- All tool calls are logged and displayed for transparency

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Anthropic SDK** - Claude AI integration
- **Lucide React** - Icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

## License

MIT License - feel free to use this project as a starting point for your own AI agents!
