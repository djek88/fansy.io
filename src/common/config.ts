import * as fs from "fs";

export class Config {

    public static instance: Config = new Config();
    //public twitchToken: string;
    public configJson;
    private static isLoaded = false;

    load(path: string) {
        try {
            if(!fs.existsSync(path)) {
                console.log("Critical error: config file does not exist " + fs.realpathSync(path));
                process.exit();
            }
            this.configJson = JSON.parse(fs.readFileSync(path).toString());
            Config.isLoaded = true;
            console.log("Config loaded from " + fs.realpathSync(path));
        } catch(e) {
            console.log(e);
            process.exit();
        }
    }


    constructor() {
        Config.instance = this;
    }

    public get1(key1: string): string {
        if(!Config.isLoaded) {
            console.log("Critical error: config not loaded when requested " + key1);
            process.exit();
        }
        if(this.configJson.hasOwnProperty(key1)) {
            return this.configJson[key1];
        }
        console.log("Can not find property " + key1);

        process.exit(1);
    }

    public get2(key1: string, key2: string):string {
        if(!Config.isLoaded) {
            console.log("Critical error: config not loaded when requested " + key1 + " " + key2);
            process.exit();
        }
        if(this.configJson.hasOwnProperty(key1)) {
            if(this.configJson[key1].hasOwnProperty(key2)) {
                return this.configJson[key1][key2];
            } else {
                console.log("Can not find property key2: " + key2);
            }
        } else {
            console.log("Can not find property key1: " + key1);
        }

        process.exit(1);
    }

    public static getInstance(): Config {
        return Config.instance;
    }
}