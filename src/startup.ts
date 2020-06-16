const forever = require('forever');
const logging = require('./logger');

const logger = new logging.Logger("startup");

logger.info("initializing");

const child = new forever.Forever('main.ts', {
    max: 1,
    silent: false,
    args: []
});

child.on('error', () => {
    logger.info("error");
});

child.on('exit', () => {
    logger.info("exiting main");
});

child.start();

logger.info("exit");