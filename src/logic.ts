import {Logger} from "./logger";
import {Broker} from "./broker";

export class Logic {

    private logger: Logger = new Logger(Logic.name);

    lightState = false;
    bulbState = false;
    broker: Broker;

    constructor(broker: Broker) {
        this.broker = broker;
    }

    private turnPlug(isOn: boolean) {
        this.lightState = isOn;
        this.broker.setPlugState(isOn);
    }

    private turnBulb(isOn: boolean) {
        this.bulbState = isOn;
        this.broker.setBulbState(isOn);
    }

    private switchClicked(obj: any) {
        if (obj.click == "double") {
            if (this.lightState) {
                this.turnPlug(false);
            } else {
                this.turnPlug(true);
            }
        } else if (obj.click == "single")
            if (this.bulbState) {
                this.turnBulb(false);
            } else {
                this.turnBulb(true);
        }
    }

    clickSwitch1(obj: any) {
        this.logger.info("switch 1 clicked");
        this.switchClicked(obj);
    }

    clickSwitch2(obj: any) {
        this.logger.info("switch 2 clicked");
        this.switchClicked(obj);
    }

    clickPlugButton(isOn: boolean) {
        this.logger.info("power is " + (isOn ? "on" : "off"));
        this.lightState = isOn;
    }

    bulbOnline() {
        this.logger.info("bulb is online");
        this.turnBulb(this.bulbState);
    }
}