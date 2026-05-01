// Configuration constants for file summarization
export const CONFIG = {
  MAX_FILE_SIZE: 1024 * 2048, // 2MB
  MAX_CONTENT_LENGTH: 8000, // 8KB for Groq token limits
  GROQ_MODEL: 'llama-3.1-8b-instant',
  GROQ_TEMPERATURE: 0.3,
  GROQ_MAX_TOKENS: 500
};

// File type categories and their descriptions
export const FILE_TYPE_CATEGORIES = {
  // Text and documentation files
  text: {
    extensions: ['txt', 'md'],
    description: 'text document',
    focus: 'main topics, key points, and overall purpose'
  },
  
  // Data and configuration files
  data: {
    extensions: ['json', 'csv', 'xml', 'yaml', 'yml', 'toml', 'ini'],
    description: 'data file',
    focus: 'structure, data types, and purpose'
  },
  
  // Web files
  web: {
    extensions: ['html', 'htm', 'css'],
    description: 'web file',
    focus: 'structure, elements, and purpose'
  },
  
  // Programming languages
  programming: {
    extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'cc', 'cxx', 'c', 'php', 'rb', 'go', 'rs'],
    description: 'code file',
    focus: 'main functionality, key functions, and purpose'
  },
  
  // Database and scripts
  scripts: {
    extensions: ['sql', 'sh', 'bash', 'ps1'],
    description: 'script file',
    focus: 'main operations, commands, and purpose'
  },
  
  // Logs
  logs: {
    extensions: ['log'],
    description: 'log file',
    focus: 'errors, warnings, and important events'
  }
};

// Special cases that need custom descriptions
export const SPECIAL_CASES = {
  'json': 'JSON data',
  'csv': 'CSV data',
  'xml': 'XML data',
  'yaml': 'YAML configuration file',
  'yml': 'YAML configuration file',
  'toml': 'TOML configuration file',
  'ini': 'INI configuration file',
  'html': 'HTML file',
  'htm': 'HTML file',
  'css': 'CSS file',
  'jsx': 'React JSX code',
  'tsx': 'React TypeScript code',
  'log': 'log file',
  'sql': 'SQL file',
  'sh': 'shell script',
  'bash': 'shell script',
  'ps1': 'PowerShell script'
};

// Default prompt for unsupported file types
export const DEFAULT_PROMPT = 'Please provide a brief, informative summary of the following file content. Focus on the main points, key information, and overall purpose. Keep the summary concise but comprehensive.'; 