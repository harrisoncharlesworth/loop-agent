import { Tool } from './types';
import { promises as fs } from 'fs';
import { join } from 'path';

// File system tools
export const readFileTool: Tool = {
  name: 'read_file',
  description: 'Read the contents of a file. Use this when you need to see what\'s inside a file.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'The relative path to the file to read'
      }
    },
    required: ['path']
  },
  handler: async (input: Record<string, unknown>) => {
    try {
      const safePath = join(process.cwd(), input.path as string);
      const content = await fs.readFile(safePath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  }
};

export const listFilesTool: Tool = {
  name: 'list_files',
  description: 'List files and directories in a given path. If no path is provided, lists the current directory.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'The relative path to list files from (optional, defaults to current directory)'
      }
    }
  },
  handler: async (input: Record<string, unknown>) => {
    try {
      const targetPath = input.path ? join(process.cwd(), input.path as string) : process.cwd();
      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      
      const files = entries.map(entry => {
        if (entry.isDirectory()) {
          return entry.name + '/';
        }
        return entry.name;
      });
      
      return JSON.stringify(files, null, 2);
    } catch (error) {
      throw new Error(`Failed to list files: ${error}`);
    }
  }
};

export const writeFileTool: Tool = {
  name: 'write_file',
  description: 'Create or completely overwrite a file with new content.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'The relative path to the file to write'
      },
      content: {
        type: 'string',
        description: 'The content to write to the file'
      }
    },
    required: ['path', 'content']
  },
  handler: async (input: Record<string, unknown>) => {
    try {
      const safePath = join(process.cwd(), input.path as string);
      await fs.writeFile(safePath, input.content as string, 'utf-8');
      return `Successfully wrote to ${input.path}`;
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  }
};

export const editFileTool: Tool = {
  name: 'edit_file',
  description: 'Edit a file by replacing old text with new text.',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'The relative path to the file to edit'
      },
      old_text: {
        type: 'string',
        description: 'The text to replace (must match exactly)'
      },
      new_text: {
        type: 'string',
        description: 'The new text to replace it with'
      }
    },
    required: ['path', 'old_text', 'new_text']
  },
  handler: async (input: Record<string, unknown>) => {
    try {
      const safePath = join(process.cwd(), input.path as string);
      let content = await fs.readFile(safePath, 'utf-8');
      
      const oldText = input.old_text as string;
      const newText = input.new_text as string;
      
      if (!content.includes(oldText)) {
        throw new Error(`Text not found in file: "${oldText}"`);
      }
      
      content = content.replace(oldText, newText);
      await fs.writeFile(safePath, content, 'utf-8');
      return `Successfully edited ${input.path}`;
    } catch (error) {
      throw new Error(`Failed to edit file: ${error}`);
    }
  }
};

// Web search tool
export const webSearchTool: Tool = {
  name: 'web_search',
  description: 'Search the web for information. Use this when you need current information from the internet.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query'
      }
    },
    required: ['query']
  },
  handler: async (input: Record<string, unknown>) => {
    try {
      const query = encodeURIComponent(input.query as string);
      
      // Try SerpAPI first if available
      if (process.env.SERPAPI_KEY) {
        const response = await fetch(`https://serpapi.com/search.json?q=${query}&api_key=${process.env.SERPAPI_KEY}`);
        if (response.ok) {
          const data = await response.json();
          const results = data.organic_results?.slice(0, 5)?.map((result: { title: string; snippet: string; link: string }) => 
            `${result.title}\n${result.snippet}\n${result.link}\n`
          ).join('\n') || 'No results found';
          return `Search results for "${input.query}":\n${results}`;
        }
      }
      
      // Fallback to Tavily search API
      const tavilyResponse = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY || 'tvly-demo',
          query: input.query as string,
          search_depth: 'basic',
          include_answer: true,
          include_images: false,
          include_raw_content: false,
          max_results: 5
        })
      });

      if (tavilyResponse.ok) {
        const data = await tavilyResponse.json();
        let results = '';
        
        if (data.answer) {
          results += `Answer: ${data.answer}\n\n`;
        }
        
        if (data.results && data.results.length > 0) {
          results += data.results.map((result: { title: string; content: string; url: string }) => 
            `${result.title}\n${result.content}\n${result.url}\n`
          ).join('\n');
        }
        
        return results || 'No results found';
      }
      
      return `Search temporarily unavailable. Please search for "${input.query}" manually on Google, Bing, or DuckDuckGo.`;
    } catch {
      return `Search error. Please try searching for "${input.query}" manually on Google, Bing, or DuckDuckGo.`;
    }
  }
};

// System information tool
export const systemInfoTool: Tool = {
  name: 'system_info',
  description: 'Get information about the current system.',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  handler: async () => {
    const info = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      cwd: process.cwd(),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(info, null, 2);
  }
};

// Execute command tool
export const executeCommandTool: Tool = {
  name: 'execute_command',
  description: 'Execute a shell command. Use with caution!',
  inputSchema: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'The command to execute'
      }
    },
    required: ['command']
  },
  handler: async (input: Record<string, unknown>) => {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const command = input.command as string;
    
    try {
      const { stdout, stderr } = await execAsync(command);
      return stdout + (stderr ? `\nStderr: ${stderr}` : '');
    } catch (error: unknown) {
      throw new Error(`Command failed: ${(error as Error).message}`);
    }
  }
};

// All available tools
export const allTools = [
  readFileTool,
  listFilesTool,
  writeFileTool,
  editFileTool,
  webSearchTool,
  systemInfoTool,
  executeCommandTool
];
