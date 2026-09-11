import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocketServer } from './sockets/index';
import { startOverdueTaskScheduler } from './jobs/overdueTaskChecker';

const server = http.createServer(app);

initSocketServer(server);
startOverdueTaskScheduler();

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});