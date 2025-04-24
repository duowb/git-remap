import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

interface GitOperation {
  timestamp: string;
  repoPath: string;
  branch: string | null;
  oldRemoteUrl: string | null;
  newRemoteUrl: string;
}

/**
 * 获取历史记录文件路径
 * @returns 历史记录文件的完整路径
 * @description 根据当前日期生成历史记录文件名
 * @example git-remap-history-20250422-120000.json
 */
function getHistoryFilePath(): string {
  const date = new Date();
  const fileName = `git-remap-history-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}.json`;
  return join(cwd(), fileName);
}

/**
 * 记录 Git 远程地址修改操作
 * @param options 操作选项
 * @param options.repoPath 仓库路径
 * @param options.oldRemoteUrl 旧的远程地址
 * @param options.newRemoteUrl 新的远程地址
 * @param options.branch 分支名称
 */
export function recordGitOperation(options: {
  repoPath: string;
  oldRemoteUrl: string | null;
  newRemoteUrl: string;
  branch: string;
}): void {
  try {
    // 创建操作记录
    const operation: GitOperation = {
      timestamp: new Date().toISOString(),
      repoPath: options.repoPath,
      branch: options.branch,
      oldRemoteUrl: options.oldRemoteUrl,
      newRemoteUrl: options.newRemoteUrl
    };

    // 获取历史记录文件路径
    const historyFilePath = getHistoryFilePath();

    // 读取现有记录或创建新的记录数组
    let operations: GitOperation[] = [];
    try {
      const fileContent = readFileSync(historyFilePath, 'utf-8');
      operations = JSON.parse(fileContent);
    } catch {
      // 文件不存在或解析错误，使用空数组
    }

    // 添加新的操作记录
    operations.push(operation);

    // 写入文件
    writeFileSync(historyFilePath, JSON.stringify(operations, null, 2), 'utf-8');

    // console.log(`操作记录已保存到 ${historyFilePath}`);
  } catch (error) {
    console.error('记录操作历史时出错:', error);
  }
}

/**
 * 读取历史记录文件
 * @param historyFilePath 历史记录文件路径，如果不提供则使用当前最新的历史文件
 * @returns 历史操作记录
 */
export function readHistoryFile(historyFilePath?: string): GitOperation[] {
  try {
    const filePath = historyFilePath || getHistoryFilePath();

    // 读取文件内容
    const fileContent = readFileSync(filePath, 'utf-8');
    const operations: GitOperation[] = JSON.parse(fileContent);

    return operations;
  } catch (error) {
    console.error('读取历史记录文件时出错:', error);
    return [];
  }
}

/**
 * 列出所有历史记录文件
 * @returns 所有历史记录文件的路径
 */
export function listHistoryFiles(): string[] {
  try {
    const dir = cwd();
    const files = readdirSync(dir);
    const historyFiles = files.filter(
      (file) => file.startsWith('git-remap-history-') && file.endsWith('.json')
    );

    return historyFiles.map((file) => join(dir, file));
  } catch (error) {
    console.error('列出历史记录文件时出错:', error);
    return [];
  }
}

/**
 * 删除历史记录文件
 * @param historyFilePath 要删除的历史记录文件路径
 * @returns 是否删除成功
 */
export function deleteHistoryFile(historyFilePath: string): boolean {
  try {
    unlinkSync(historyFilePath);
    // console.log(`历史记录文件 ${historyFilePath} 已删除`);
    return true;
  } catch (error) {
    console.error(`删除历史记录文件 ${historyFilePath} 时出错:`, error);
    return false;
  }
}
