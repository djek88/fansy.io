import * as express from "express";
import * as http from "http";
import * as hbs from "express-handlebars";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as session from "express-session";

import * as indexRoute from "./routes/index";
import * as streamerRoute from "./routes/streamer";
import * as streamersRoute from "./routes/hl";

export class WebServer {
    public handle: express.Application; // express object
    public server: http.Server;
    public port: number;

    constructor() {
    }

    /**
     * 
     * @param port 
     * @param viewsDir 
     */
    public init(port: number, viewsDir: string) {
        this.port = port;

        this.handle = express();
        this.handle.engine("hbs", hbs({extname: "hbs"}));

        this.handle.set("views", viewsDir);
        this.handle.set("view engine", "hbs");
        this.handle.set("port", this.port);

        this.handle.use(bodyParser.json());
        this.handle.use(bodyParser.urlencoded({ extended: false }));
        this.handle.use(express.static(viewsDir));
        let store  = new session.MemoryStore;
        this.handle.use(session({ secret: '4563d7b029e4a1eee1dbc5d5e599fc9a', 
                                  store: store,
                                  resave: true,
                                  saveUninitialized: true }));

        this.handle.use(express.static(path.join(__dirname, "../public")));

        this.handle.use('/', indexRoute.router);
        this.handle.use('/streamer', streamerRoute.router);
        this.handle.use('/hl', streamersRoute.router);

        //console.log(path.join(__dirname, "../public"));

        
    }

    public start() {
        this.server = http.createServer(this.handle);
        this.server.listen(this.port);
    }
}






