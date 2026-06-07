const PREFIX = '[StarshipDesigner]';
export const logger = {
    info: (message, ...args) => {
        console.info(`${PREFIX} INFO  ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`${PREFIX} ERROR ${message}`, ...args);
    },
};
