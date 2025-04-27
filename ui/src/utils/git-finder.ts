export type Project = {
  projectName: string;
  projectType: string;
  currentBranch: string;
  remoteUrl: string;
  gitHandle: FileSystemDirectoryHandle;
  projectPath: string;
};

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
          entry.name !== 'node_modules'
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
      projectType: detectProjectType(),
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
 * @returns 项目类型
 */
function detectProjectType(): string {
  // 简单实现，实际需要检查文件来判断项目类型
  return 'unknown';
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
