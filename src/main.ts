import {Broker} from "./broker";
import {Logger} from "./logger";
import axios from 'axios'
import {TELEMETRY_TEST_URL} from "./devices";
import * as https from "https";

const logger = new Logger("main");

logger.info("started");

logger.info("initing root CA");

require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});

axiosInstance.get(TELEMETRY_TEST_URL).then((value: any) => {
    logger.info("telemetry server online: " + JSON.stringify(value.data));
}).catch((value: any) => {
    logger.error("telemetry server failed " + JSON.stringify(value))
});

const broker = new Broker();

broker.startServer();