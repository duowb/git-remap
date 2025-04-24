import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, extname, join, sep } from 'node:path';

/**
 * 获取项目名称，兼容不同操作系统的路径分隔符
 * @param dirPath 项目目录路径
 * @returns 项目名称
 */
export function getProjectName(dirPath: string): string {
  // 使用 path.basename 获取路径的最后一部分
  const name = basename(dirPath);

  // 如果路径以分隔符结尾，则获取倒数第二部分
  if (name === '' && dirPath.length > 1) {
    // 去掉末尾的分隔符
    const trimmedPath = dirPath.endsWith(sep) ? dirPath.slice(0, -1) : dirPath;
    return basename(trimmedPath);
  }

  return name || '';
}

/**
 * 根据项目目录特征判断编程语言
 * @param dirPath 项目目录路径
 * @returns 项目使用的编程语言，如果无法确定则返回 'unknown'
 */
export async function detectProjectLanguage(dirPath: string): Promise<string> {
  try {
    // 获取目录中的文件列表
    const files = await readdir(dirPath);
    const fileSet = new Set(files);

    // 定义各种语言的特征文件
    const languageSignatures: Record<string, string[]> = {
      // Node.js / JavaScript / TypeScript
      node: [
        'package.json',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'node_modules',
        'tsconfig.json',
        'next.config.js',
        'webpack.config.js',
        'rollup.config.js',
        'vite.config.js',
        'vite.config.ts'
      ],

      // Python
      python: [
        'requirements.txt',
        'setup.py',
        'pyproject.toml',
        'Pipfile',
        'poetry.lock',
        'venv',
        'django',
        'flask',
        'pytest.ini',
        'tox.ini'
      ],

      // Java
      java: [
        'pom.xml',
        'build.gradle',
        'build.gradle.kts',
        'gradlew',
        'gradlew.bat',
        'settings.gradle',
        'META-INF',
        '.classpath',
        '.idea/workspace.xml',
        'target/classes'
      ],

      // Go
      go: ['go.mod', 'go.sum', 'Gopkg.toml', 'Gopkg.lock', 'glide.yaml', 'main.go'],

      // Ruby
      ruby: [
        'Gemfile',
        'Gemfile.lock',
        'Rakefile',
        'config/routes.rb',
        '.ruby-version',
        'bin/rails'
      ],

      // PHP
      php: [
        'composer.json',
        'composer.lock',
        'vendor/autoload.php',
        'artisan',
        'wp-config.php',
        'index.php'
      ],

      // Rust
      rust: ['Cargo.toml', 'Cargo.lock', 'rust-toolchain.toml', 'rustfmt.toml'],

      // C#/.NET
      csharp: ['.csproj', '.sln', 'packages.config', 'web.config', 'NuGet.Config', 'global.json'],

      // C/C++
      cpp: ['CMakeLists.txt', 'Makefile', 'configure', '.clang-format', '.clang-tidy'],

      // HTML/CSS (前端项目)
      html: ['index.html', 'style.css', 'public/index.html', 'dist/index.html']
    };

    // 检查各语言特征
    const matches: Record<string, number> = {};

    for (const [language, signatures] of Object.entries(languageSignatures)) {
      let count = 0;

      for (const signature of signatures) {
        // 检查确切匹配
        if (fileSet.has(signature)) {
          count += 2; // 给精确匹配更高的权重
          continue;
        }

        // 检查部分匹配（如.csproj等带有扩展名的文件）
        if (signature.startsWith('.')) {
          const extension = signature;
          if (files.some((file) => file.endsWith(extension))) {
            count += 1;
          }
        }
      }

      if (count > 0) {
        matches[language] = count;
      }
    }

    // 找出匹配度最高的语言
    if (Object.keys(matches).length > 0) {
      const sortedLanguages = Object.entries(matches).sort((a, b) => b[1] - a[1]); // 按匹配计数降序排序

      return sortedLanguages[0][0]; // 返回匹配度最高的语言
    }

    // 如果没有找到明确的特征文件，尝试通过统计文件扩展名来判断
    const extensionCounts: Record<string, number> = {};

    for (const file of files) {
      if (existsSync(join(dirPath, file)) && !file.startsWith('.')) {
        try {
          const stat = await readdir(join(dirPath, file), { withFileTypes: true });

          // 如果是目录且不是隐藏目录，则跳过
          if (stat.some((entry) => entry.isDirectory())) {
            continue;
          }
        } catch {
          // 不是目录，继续处理
        }

        const ext = extname(file).toLowerCase();
        if (ext && ext !== '.md' && ext !== '.txt' && ext !== '.log') {
          extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
        }
      }
    }

    // 文件扩展名到语言的映射
    const extToLang: Record<string, string> = {
      '.js': 'node',
      '.jsx': 'node',
      '.ts': 'node',
      '.tsx': 'node',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rb': 'ruby',
      '.php': 'php',
      '.rs': 'rust',
      '.cs': 'csharp',
      '.c': 'cpp',
      '.cpp': 'cpp',
      '.h': 'cpp',
      '.hpp': 'cpp',
      '.html': 'html',
      '.css': 'html'
    };

    // 根据扩展名统计找出最常见的语言
    const langCounts: Record<string, number> = {};

    for (const [ext, count] of Object.entries(extensionCounts)) {
      const lang = extToLang[ext];
      if (lang) {
        langCounts[lang] = (langCounts[lang] || 0) + count;
      }
    }

    if (Object.keys(langCounts).length > 0) {
      const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);

      return sortedLangs[0][0];
    }

    return 'unknown';
  } catch (error) {
    console.error(`Error detecting project language in directory ${dirPath}:`, error);
    return 'unknown';
  }
}

/**
 * 根据文件扩展名判断文件类型
 * @param filePath 文件路径
 * @returns 文件使用的编程语言，如果无法确定则返回 'unknown'
 */
export function detectFileLanguage(filePath: string): string {
  const ext = extname(filePath).toLowerCase();

  // 文件扩展名到语言的映射
  const extToLang: Record<string, string> = {
    // JavaScript 相关
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',

    // Web 相关
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.less': 'less',

    // 后端语言
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.rb': 'ruby',
    '.php': 'php',
    '.cs': 'csharp',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cc': 'cpp',
    '.h': 'c',
    '.hpp': 'cpp',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.kts': 'kotlin',

    // 数据/配置文件
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.xml': 'xml',
    '.toml': 'toml',
    '.md': 'markdown',
    '.sql': 'sql',

    // 其他
    '.sh': 'shell',
    '.bash': 'shell',
    '.zsh': 'shell',
    '.ps1': 'powershell',
    '.bat': 'batch',
    '.cmd': 'batch',
    '.r': 'r',
    '.dart': 'dart',
    '.lua': 'lua',
    '.clj': 'clojure',
    '.ex': 'elixir',
    '.exs': 'elixir',
    '.erl': 'erlang',
    '.fs': 'fsharp',
    '.fsx': 'fsharp',
    '.hs': 'haskell',
    '.pl': 'perl',
    '.pm': 'perl',
    '.scala': 'scala'
  };

  return extToLang[ext] || 'unknown';
}
