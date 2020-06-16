import { format } from 'date-fns'
import fs from 'fs'

export class Logger {

    className : string  = "";

    constructor(className: string) {
        this.className = className;
    }

    private wrapWithInfo = (message: string) : string => {
        return format(new Date(), "yyyy.MM.dd HH:mm:ss") + " " + this.className + " " + message;
    };

    public info = (message: string) => {
        const msg = this.wrapWithInfo(message);
        console.log(msg);
        this.writeToFile(msg);
    };

    public error = (message: string) => {
        const msg = this.wrapWithInfo(message);
        console.error(msg);
        this.writeToFile(msg);
    };

    private writeToFile(message: string) {

        const currentDate = new Date();

        const filename = "data/log/" +
                currentDate.getFullYear() + "_" +
                ("0" + (currentDate.getUTCMonth() + 1)).slice(-2) + "_" +
                ("0" + currentDate.getDate()).slice(-2) + ".log";

        fs.appendFile(filename, message + "\n", function (err) {
            if (err)  {
                console.error("log error " + err.message);
            }
        });
    }
}