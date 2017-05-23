import {Config} from "./src/common/config";
let config: Config = new Config();
config.load("../data/config.json");

import {WebServer} from "./src/webserver";

// How to run in aws https://bitbucket.org/fansy42/documentation/wiki/Sauron%20server%20setup

try {
    let webServer: WebServer = new WebServer();
    webServer.init(parseInt(config.get2("webserver", "port")), config.get2("webserver", "viewsDir"));
    webServer.start();

} catch (exception) {
    console.log("Can not start app.js because: ");
    console.log(exception);
}