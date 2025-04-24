import { simpleGit, type SimpleGit } from 'simple-git';

/**
 * 获取 Git 仓库的远程地址
 * @param repoPath Git 仓库的路径
 * @param remoteName 远程仓库名称，默认为 'origin'
 * @returns 远程仓库的 URL
 */
export async function getGitRemoteUrl(
  repoPath: string,
  remoteName: string = 'origin'
): Promise<string> {
  try {
    const git: SimpleGit = simpleGit(repoPath);
    const remotes = await git.getRemotes(true);
    const remote = remotes.find((r) => r.name === remoteName);

    return remote?.refs.fetch || '';
  } catch (error) {
    console.error(`Error getting remote URL for ${repoPath}:`, error);
    return '';
  }
}

/**
 * 修改 Git 仓库的远程地址
 * @param repoPath Git 仓库的路径
 * @param newUrl 新的远程仓库 URL
 * @param remoteName 远程仓库名称，默认为 'origin'
 * @returns 是否修改成功
 */
export async function setGitRemoteUrl(
  repoPath: string,
  newUrl: string,
  remoteName: string = 'origin'
): Promise<boolean> {
  try {
    const git: SimpleGit = simpleGit(repoPath);

    // 检查远程仓库是否存在
    const remotes = await git.getRemotes(true);
    const remoteExists = remotes.some((r) => r.name === remoteName);

    if (remoteExists) {
      // 如果远程仓库存在，则修改 URL
      await git.remote(['set-url', remoteName, newUrl]);
    } else {
      // 如果远程仓库不存在，则添加新的远程仓库
      await git.addRemote(remoteName, newUrl);
    }

    return true;
  } catch (error) {
    console.error(`Error setting remote URL for ${repoPath}:`, error);
    return false;
  }
}

/**
 * 获取 Git 仓库的当前分支
 * @param repoPath Git 仓库的路径
 * @returns 当前分支名称
 */
export async function getCurrentBranch(repoPath: string): Promise<string> {
  try {
    const git: SimpleGit = simpleGit(repoPath);
    const branch = await git.branch();
    return branch.current;
  } catch (error) {
    console.error(`Error getting current branch for ${repoPath}:`, error);
    return '';
  }
}
