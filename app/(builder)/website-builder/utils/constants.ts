export const WORK_DIR_NAME = 'project';
export const MODIFICATIONS_TAG_NAME = 'boltArtifact';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const PROMPT_COOKIE_KEY = 'cachedPrompt';
export const PROVIDER_COOKIE_KEY = 'cachedProvider';
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
export const DEFAULT_MODEL = 'claude-sonnet-4';
export const DEFAULT_PROVIDER = 'Anthropic';
export const IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '.cache/**',
  '.vscode/**',
  '.idea/**',
  '**/*.log',
  '**/.DS_Store',
  '**/npm-debug.log*',
  '**/yarn-debug.log*',
  '**/yarn-error.log*',
];

export const ALLOW_EDITS_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.css',
  '.scss',
  '.html',
  '.md',
  '.txt',
  '.yml',
  '.yaml',
  '.toml',
  '.xml',
  '.svg',
];
