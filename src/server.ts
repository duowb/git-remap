import { readFileSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { join } from 'node:path';

import {
  createApp,
  createRouter,
  eventHandler,
  getQuery,
  readBody,
  serveStatic,
  toNodeListener
} from 'h3';
import { lookup } from 'mrmime';
import { uiDistDir } from './dirs';
import { findGitProjects } from './files';
import { getGitRemoteUrl, setGitRemoteUrl } from './git';

export interface CreateServerOptions {
  cwd: string;
}

function requestFormat<T = any>(
  res: ServerResponse<IncomingMessage>,
  data: { code: number; data: T; message: string }
) {
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}
export function createHostServer() {
  const app = createApp();
  const router = createRouter();
  app.use(router);

  const fileMap = new Map<string, string>();
  const readCachedFile = (id: string) => {
    if (!fileMap.has(id)) fileMap.set(id, readFileSync(id, 'utf-8'));
    return fileMap.get(id);
  };

  router.get(
    '/api/files',
    eventHandler(async (event) => {
      const { path } = getQuery<{ path: string }>(event);
      const { res } = event.node;
      if (!path) {
        return requestFormat(res, {
          code: 400,
          data: null,
          message: '缺少path'
        });
      }
      try {
        const projects = await findGitProjects(path);
        return requestFormat(res, {
          code: 200,
          data: projects,
          message: '请求成功'
        });
      } catch (error: any) {
        return requestFormat(res, {
          code: 500,
          data: null,
          message: error.message
        });
      }
    })
  );

  router.post(
    '/api/replace',
    eventHandler(async (event) => {
      const { paths } = await readBody<{
        paths: {
          newRemote: string;
          path: string;
        }[];
      }>(event);
      const { res } = event.node;
      if (!paths) {
        return requestFormat(res, {
          code: 400,
          data: null,
          message: '参数错误'
        });
      }
      const result = await Promise.all(
        paths.map(async ({ path, newRemote }) => {
          const isReplaceSuccess = await setGitRemoteUrl(path, newRemote);
          return {
            path,
            newRemote: await getGitRemoteUrl(path),
            isReplaceSuccess
          };
        })
      );
      return requestFormat(res, {
        code: 200,
        data: result,
        message: '替换成功'
      });
    })
  );

  app.use(
    '/',
    eventHandler(async (event) => {
      const result = await serveStatic(event, {
        fallthrough: true,
        getContents: (id) => readCachedFile(join(uiDistDir, id)),
        getMeta: (id) => {
          const stats = statSync(join(uiDistDir, id));
          if (!stats || !stats.isFile()) return;
          return {
            type: lookup(id),
            size: stats.size,
            mtime: stats.mtimeMs
          };
        }
      });
      if (result === false) return readCachedFile(join(uiDistDir, 'index.html'));
    })
  );

  return createServer(toNodeListener(app));
}

// export function bindShortcuts(server: Server) {
//   // 设置原始模式以捕获单个按键
//   if (!process.stdin.isTTY) return;

//   process.stdin.setRawMode(true);
//   readline.emitKeypressEvents(process.stdin);

//   // 监听按键事件
//   process.stdin.on('keypress', (str, key) => {
//     if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
//       // 关闭服务器并退出
//       server.close(() => {
//         process.exit(0);
//       });
//     }
//   });
// }
