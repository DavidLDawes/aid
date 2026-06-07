const PREFIX = '[StarshipDesigner]';

export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    console.info(`${PREFIX} INFO  ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`${PREFIX} ERROR ${message}`, ...args);
  },
};
