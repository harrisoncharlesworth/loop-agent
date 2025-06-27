import { Terminal, Search, Play, FileText } from 'lucide-react';

const tools = [
  {
    name: 'File Operations',
    description: 'Read, write, and edit files in your workspace',
    icon: FileText,
    capabilities: ['read_file', 'write_file', 'edit_file', 'list_files']
  },
  {
    name: 'System Commands',
    description: 'Execute terminal commands and system operations',
    icon: Terminal,
    capabilities: ['execute_command', 'system_info']
  },
  {
    name: 'Web Search',
    description: 'Search the web for information and resources',
    icon: Search,
    capabilities: ['web_search']
  },
  {
    name: 'Process Management',
    description: 'Run and manage system processes',
    icon: Play,
    capabilities: ['execute_command']
  }
];

export default function ToolsPage() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Available Tools</h1>
        <p className="text-muted-foreground">
          Loop Agent has access to these powerful tools to help you automate tasks.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool, index) => (
          <div key={index} className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <tool.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">{tool.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
            <div className="flex flex-wrap gap-1">
              {tool.capabilities.map((capability) => (
                <span
                  key={capability}
                  className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
