export type Project = {
  projectName: string;
  projectType: string;
  currentBranch: string;
  remoteUrl: string;
  gitHandle: FileSystemDirectoryHandle;
  projectPath: string;
};

/**
 * 项目类型配置，包含特征文件和需要忽略的目录
 * 语言按优先级排序
 */
interface ProjectTypeConfig {
  name: string; // 语言/框架名称
  indicators: string[]; // 特征文件/目录
  ignoreDirs: string[]; // 该语言特有的需要忽略的目录
}

/**
 * 项目类型配置数组，按优先级排序
 */
const PROJECT_CONFIGS: ProjectTypeConfig[] = [
  {
    name: 'node',
    indicators: ['package.json', 'node_modules', 'npm-debug.log', 'yarn.lock', 'package-lock.json'],
    ignoreDirs: ['node_modules', 'bower_components', 'jspm_packages']
  },
  {
    name: 'java',
    indicators: ['pom.xml', 'build.gradle', '.classpath', '.project', 'src/main/java'],
    ignoreDirs: ['target', 'build', '.gradle', '.mvn']
  },
  {
    name: 'python',
    indicators: ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile'],
    ignoreDirs: ['venv', '.venv', 'env', 'virtualenv', '__pycache__']
  },
  {
    name: 'go',
    indicators: ['go.mod', 'go.sum', 'main.go'],
    ignoreDirs: ['vendor']
  },
  {
    name: 'php',
    indicators: ['composer.json', 'index.php', 'artisan'],
    ignoreDirs: ['vendor']
  },
  {
    name: 'html',
    indicators: ['index.html', 'home.html'],
    ignoreDirs: []
  },
  {
    name: 'css',
    indicators: ['main.css', 'style.css'],
    ignoreDirs: []
  }
];

/**
 * 通用忽略目录，所有项目类型都会忽略的目录
 */
const COMMON_IGNORED_DIRS = [
  'dist', // 通用构建输出
  'build', // 通用构建输出
  'bin', // 二进制输出
  'obj', // .NET 构建中间文件
  '.idea', // IDE 配置
  '.vscode', // IDE 配置
  'packages' // 通用包目录
];

/**
 * 获取所有需要忽略的目录
 * @returns 所有需要忽略的目录列表
 */
function getAllIgnoredDirs(): string[] {
  const allDirs = new Set<string>(COMMON_IGNORED_DIRS);

  // 添加各语言特有的忽略目录
  for (const config of PROJECT_CONFIGS) {
    for (const dir of config.ignoreDirs) {
      allDirs.add(dir);
    }
  }

  return Array.from(allDirs);
}

// 计算所有需要忽略的目录
const ALL_IGNORED_DIRS = getAllIgnoredDirs();

/**
 * 递归查找git项目
 * @param dirHandle 文件系统目录句柄
 * @param basePath 基础路径
 * @param projects 已找到的项目数组
 * @returns 项目数组
 */
export async function recursivelyFindGitProjects(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string,
  projects: Project[] = []
): Promise<Project[]> {
  let isGitProject = false;
  let gitHandle: FileSystemDirectoryHandle | null = null;

  // 检查当前目录是否含有.git文件夹
  try {
    gitHandle = await dirHandle.getDirectoryHandle('.git');
    isGitProject = true;
  } catch {
    // 不是git项目，继续递归
    // 继续递归子目录
    try {
      for await (const entry of dirHandle.values()) {
        if (
          entry.kind === 'directory' &&
          !entry.name.startsWith('.') &&
          !ALL_IGNORED_DIRS.includes(entry.name)
        ) {
          await recursivelyFindGitProjects(entry, `${basePath}/${entry.name}`, projects);
        }
      }
    } catch (error) {
      console.error('递归查找子目录出错:', error);
    }
  }

  if (isGitProject && gitHandle) {
    // 读取git配置
    const configInfo = await readGitConfig(gitHandle);

    // 如果是git项目，添加到列表
    projects.push({
      projectName: dirHandle.name,
      projectType: await detectProjectType(dirHandle),
      currentBranch: configInfo.branch || '',
      remoteUrl: configInfo.remoteUrl || '',
      gitHandle,
      projectPath: `${basePath}/${dirHandle.name}`
    });
  }

  return projects;
}

/**
 * 读取git配置文件
 * @param gitHandle git目录句柄
 * @returns 配置信息
 */
async function readGitConfig(gitHandle: FileSystemDirectoryHandle): Promise<{
  remoteUrl: string;
  branch: string;
}> {
  let remoteUrl = '';
  let branch = '';

  try {
    // 尝试读取config文件
    const configFileHandle = await gitHandle.getFileHandle('config');
    const file = await configFileHandle.getFile();
    const content = await file.text();

    // 解析远程URL - 修复正则表达式
    const remoteUrlMatch = content.match(/\[remote "origin"\][^[]*url\s*=\s*([^\n]+)/);
    if (remoteUrlMatch && remoteUrlMatch[1]) {
      remoteUrl = remoteUrlMatch[1].trim();
    }

    // 尝试读取HEAD文件获取当前分支
    try {
      const headFileHandle = await gitHandle.getFileHandle('HEAD');
      const headFile = await headFileHandle.getFile();
      const headContent = await headFile.text();

      const branchMatch = headContent.match(/ref: refs\/heads\/([^\n]+)/);
      if (branchMatch && branchMatch[1]) {
        branch = branchMatch[1].trim();
      }
    } catch {
      // 无法读取HEAD文件
    }
  } catch (error) {
    console.error('无法读取git配置:', error);
  }

  return { remoteUrl, branch };
}

/**
 * 根据项目文件检测项目类型
 * @param dirHandle 项目目录句柄
 * @returns 项目类型
 */
async function detectProjectType(dirHandle: FileSystemDirectoryHandle): Promise<string> {
  try {
    // 存储项目中找到的文件和目录
    const foundFiles: string[] = [];

    // 只检查根目录的文件和文件夹
    try {
      for await (const entry of dirHandle.values()) {
        foundFiles.push(entry.name);
      }
    } catch (error) {
      console.error('检查项目根目录出错:', error);
    }

    // 按配置中的优先级顺序检查项目类型
    for (const config of PROJECT_CONFIGS) {
      // 如果找到任一特征文件，判定为该类型
      if (config.indicators.some((indicator) => foundFiles.includes(indicator))) {
        return config.name;
      }
    }

    // 如果无法判断，返回未知
    return 'unknown';
  } catch (error) {
    console.error('检测项目类型出错:', error);
    return 'unknown';
  }
}

/**
 * 修改git远程地址
 * @param gitHandle git目录句柄
 * @param newRemoteUrl 新的远程地址
 * @returns 是否成功
 */
export async function updateGitRemoteUrl(
  gitHandle: FileSystemDirectoryHandle,
  newRemoteUrl: string
): Promise<boolean> {
  try {
    // 读取当前config文件
    const configFileHandle = await gitHandle.getFileHandle('config');
    const file = await configFileHandle.getFile();
    let content = await file.text();

    // 替换远程地址 - 修复正则表达式
    content = content.replace(/(\[remote "origin"\][^[]*url\s*=)([^\n]+)/, `$1 ${newRemoteUrl}`);

    // 尝试写入文件 - 注意：这需要写入权限，可能会失败
    // 由于浏览器安全限制，可能无法直接写入文件
    try {
      // 创建一个可写文件
      const writable = await configFileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    } catch (writeError) {
      console.error('无法写入git配置文件:', writeError);
      return false;
    }
  } catch (error) {
    console.error('修改git远程地址失败:', error);
    return false;
  }
}

export async function getDirHandle(): Promise<FileSystemDirectoryHandle> {
  return await window.showDirectoryPicker({
    id: 'gitProjectsFolder',
    mode: 'readwrite' // 请求读写权限，以便能修改git配置
  });
}

/**
 * 选择文件夹查找git项目
 */
export async function selectFolderAndFindGitProjects(
  dirHandle: FileSystemDirectoryHandle
): Promise<{
  folderName: string;
  projects: Project[];
}> {
  // 查找git项目
  const projects = await recursivelyFindGitProjects(dirHandle, dirHandle.name);

  return {
    folderName: dirHandle.name,
    projects
  };
}
