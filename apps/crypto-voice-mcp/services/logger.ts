import pino from 'pino';
import 'dotenv/config';

const level = process.env.LOG_LEVEL || 'info';

const logger = pino({
  level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

export const createLogger = (module: string) => {
  return logger.child({ module });
};

export default logger; 