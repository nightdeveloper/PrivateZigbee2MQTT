import {Logger} from "./logger";
import net, {createServer} from 'net'
import {IPublishPacket, ISubscribePacket, ISubscription} from 'mqtt-packet'
import aedes from "aedes"
import {getInMemoryPersistence} from "./objectsFactory"
import {
    DEVICE_BULB,
    DEVICE_PLUG,
    DEVICE_SWITCH1,
    DEVICE_SWITCH2,
    DEVICE_TOPIC_PREFIX,
    LOG_DEVICE_ANNOUNCED,
    STATE_OFF,
    STATE_ON,
    TELEMETRY_DATA_URL,
    TOPIC_LOG
} from "./devices";
import {Logic} from "./logic";
import axios from 'axios'
import * as https from "https";

export class Broker {

    private logger: Logger = new Logger(Broker.name);

    private aedes: aedes.Aedes;
    private server: net.Server | undefined = undefined;
    private logic: Logic;

    private axiosInstance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });

    constructor() {
        this.logic = new Logic(this);

        const settings = {
            port: 1883,
            host: '127.0.0.1',
            persistence: getInMemoryPersistence()
        };

        this.aedes = aedes.Server(settings);

        this.aedes.on('client', (client: aedes.Client) => {
            this.logClient(client, "client connected");
        });

        this.aedes.on('clientDisconnect', (client: aedes.Client) => {
            this.logClient(client, "client disconnected");
        });

        this.aedes.on('subscribe', (subscriptions: ISubscription | ISubscription[] | ISubscribePacket, client: aedes.Client) => {
            if (subscriptions.hasOwnProperty("topic")) {
                this.logClient(client, "subscribed '" + (subscriptions as ISubscription).topic + "'");
            }
        });

        this.aedes.on('unsubscribe', (subscriptions: ISubscription | ISubscription[] | ISubscribePacket, client: aedes.Client) => {
            if (subscriptions.hasOwnProperty("topic")) {
                this.logClient(client, "unsubscribed '" + (subscriptions as ISubscription).topic + "'");
            }
        });

        this.aedes.on('publish', (packet: IPublishPacket, client: aedes.Client) => {
            this.logClient(client, "topic [" + packet.topic + "], payload: [" + packet.payload + "]");

            try {
                let obj;

                let isJson = false;
                try {
                    obj = JSON.parse(packet.payload as string);
                    isJson = true;
                } catch (err) {
                }

                if (isJson) {
                    obj.deviceId = packet.topic.replace("zigbee2mqtt/", "");

                    let isNoTele = false;
                    switch (packet.topic) {
                        case DEVICE_SWITCH1: {
                            this.logic.clickSwitch1(obj);
                            break;
                        }
                        case DEVICE_SWITCH2: {
                            this.logic.clickSwitch2(obj);
                            break;
                        }
                        case DEVICE_PLUG: {
                            this.logic.clickPlugButton(obj.state == STATE_ON);
                            break;
                        }
                        case TOPIC_LOG: {
                            this.logger.info("topic log " + obj.type);
                            if (obj.type == LOG_DEVICE_ANNOUNCED) {
                                const deviceId = obj.meta.friendly_name;

                                this.logger.info("announced device " + deviceId);

                                if (DEVICE_TOPIC_PREFIX + deviceId == DEVICE_BULB) {
                                    this.logic.bulbOnline();
                                    break;
                                }
                            }
                            isNoTele = true;
                            break;
                        }
                    }

                    if (!isNoTele) {
                        this.axiosInstance.post(TELEMETRY_DATA_URL, obj)
                            .then((value: any) => this.logger.info("telemetry post " + value.data))
                            .catch((reason: any) => this.logger.error("telemetry error " + reason));
                    }
                }
            } catch (err) {
                this.logger.error("exception " + err.toString());
            }
        });
    };

    startServer = () => {
        this.server = createServer(this.aedes.handle)
            .on("listening", () => {
                this.logger.info("server listening");
            })
            .on("error", (err: Error) => {
                this.logger.info("server error: " + err.name + " - " + err.message + ", stack: " + err.stack);
            });

        this.server.listen(1883, '127.0.0.1');
    };

    logClient = (client: aedes.Client, message: string) => {
        this.logger.info((client != null ? client.id : "none") + " " + message);
    };

    setPlugState = (isOn: boolean) => {

        let packet: IPublishPacket & { topic: string | Buffer } = {
            cmd: 'publish',
            qos: 0,
            dup: false,
            retain: false,
            topic: DEVICE_PLUG + "/set",
            payload: JSON.stringify({
                state: isOn ? STATE_ON : STATE_OFF
            })
        };

        this.aedes.publish(packet, () => {
            this.logger.info("plug state done");
        });
    };

    setBulbState = (isOn: boolean) => {

        let packet: IPublishPacket & { topic: string | Buffer } = {
            cmd: 'publish',
            qos: 0,
            dup: false,
            retain: false,
            topic: DEVICE_BULB + "/set",
            payload: JSON.stringify(isOn ? {
                state: STATE_ON,
                color: {x: 0.492781035381868, y: 0.415093021501115},
                color_temp: 428,
                brightness: 174
            } : {
                state: STATE_OFF
            })
        };

        this.aedes.publish(packet, () => {
            this.logger.info("bulb state done");
        });
    }
}