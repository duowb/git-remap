import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCurrentBranch, getGitRemoteUrl } from './git';
import { detectProjectLanguage, getProjectName } from './language-detector';
import type { Project } from './types';

/**
 * 解析 .gitmodules 文件获取子模块信息
 * @param modulesPath .gitmodules 文件路径
 * @returns 子模块路径列表
 */
function parseGitModules(modulesPath: string): string[] {
  try {
    const content = readFileSync(modulesPath, 'utf-8');
    const paths: string[] = [];
    const regex = /path\s*=\s*(.+)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      paths.push(match[1].trim());
    }

    return paths;
  } catch (error) {
    console.error(`Error parsing .gitmodules file:`, error);
    return [];
  }
}

/**
 * 递归查找指定目录下的所有 Git 项目
 * @param dirPath 要搜索的目录路径
 * @returns 返回所有找到的 Git 项目路径数组
 */
export async function findGitProjects(dirPath: string): Promise<Project[]> {
  const gitProjects: Project[] = [];

  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    // 检查当前目录是否是 Git 项目
    const isGitProject = entries.some((entry) => entry.isDirectory() && entry.name === '.git');
    if (isGitProject) {
      const projectType = detectProjectLanguage(dirPath);
      const currentBranch = await getCurrentBranch(dirPath);
      const remoteUrl = await getGitRemoteUrl(dirPath);
      gitProjects.push({
        projectPath: dirPath,
        projectName: getProjectName(dirPath),
        projectType,
        currentBranch,
        remoteUrl
      });

      // 检查是否有 .gitmodules 文件
      const gitmodulesPath = join(dirPath, '.gitmodules');
      if (existsSync(gitmodulesPath)) {
        const submodulePaths = await parseGitModules(gitmodulesPath);

        // 递归查找子模块中的 Git 项目
        for (const submodulePath of submodulePaths) {
          const fullSubmodulePath = join(dirPath, submodulePath);
          const subProjects = await findGitProjects(fullSubmodulePath);
          gitProjects.push(...subProjects);
        }
      }

      return gitProjects;
    }

    // 如果不是 Git 项目，递归搜索子目录
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const fullPath = join(dirPath, entry.name);
        const subProjects = await findGitProjects(fullPath);
        gitProjects.push(...subProjects);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return gitProjects;
}
