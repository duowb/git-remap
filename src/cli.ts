import process from 'node:process';
import { blue, green } from 'ansis';
import cac from 'cac';
import { getPort } from 'get-port-please';
import open from 'open';
import { createHostServer } from './server';

// const MARK_CHECK = green('✔')
const MARK_INFO = blue('ℹ');

const cli = cac('git-remap');

cli
  .command('view', 'Start a dev server to show the viewer')
  .option('--host <host>', 'Host', { default: process.env.HOST || '127.0.0.1' })
  .option('--port <port>', 'Port', { default: process.env.PORT || 7777 })
  .option('--open', 'Open browser', { default: true })
  // Action
  .action(async (options) => {
    const host = options.host;
    const port = await getPort({ port: options.port, portRange: [7777, 9000], host });

    if (process.env.ESLINT_CONFIG) options.config ||= process.env.ESLINT_CONFIG;

    console.log(MARK_INFO, `Starting GitRemap viewer at`, green`http://${host}:${port}`, '\n');

    const server = await createHostServer();

    server.listen(port, host, async () => {
      if (options.open) await open(`http://${host === '127.0.0.1' ? 'localhost' : host}:${port}`);
    });
  });

cli.command('', 'Show help').action(() => {
  cli.outputHelp();
  process.exit(1);
});

cli.help();
cli.parse();
