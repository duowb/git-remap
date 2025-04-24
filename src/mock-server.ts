import { networkInterfaces } from 'node:os';
import { blue, green } from 'ansis';
import { getPort } from 'get-port-please';
import { createHostServer } from './server';

const MARK_INFO = blue('ℹ');

async function start() {
  const host = '0.0.0.0';
  const server = await createHostServer();
  const port = await getPort({ port: 7777, portRange: [7777, 9000], host });
  server.listen(port, host, () => {
    console.log(MARK_INFO, `Starting GitRemap viewer at`, green`http://${host}:${port}`, '\n');
    printNetworkIPs(port);
    // bindShortcuts(server)
  });
}
function printNetworkIPs(port: number) {
  const interfaces = networkInterfaces();
  Object.keys(interfaces).forEach((name) => {
    (interfaces[name] || []).forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`  ➜  Network: http://${iface.address}:${port}`);
      }
    });
  });
}

start();
