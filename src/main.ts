import {Broker} from "./broker";
import {Logger} from "./logger";
import axios from 'axios'
import {TELEMETRY_TEST_URL} from "./devices";

const logger = new Logger("main");

logger.info("started");

axios.get(TELEMETRY_TEST_URL).then((value: any) => {
    logger.info("telemetry server online: " + JSON.stringify(value.data));
}).catch((value: any) => {
    logger.error("telemetry server failed " + JSON.stringify(value))
});

const broker = new Broker();

broker.startServer();