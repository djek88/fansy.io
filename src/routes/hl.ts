import {Config} from "../common/config";
import * as express from "express";
export let router = express.Router();

import {Database} from "../common/database";

let config = Config.getInstance();
let conn = Database.getInstance().conn;

// good handlerbar tutorial: http://handlebarsjs.com/builtin_helpers.html

router.get("/", function (req, res, next) { // /hl
    
    let respJson = {"hl": "sssdsdsd",
                    "pagination": "kllkl"};
    res.set("content-type", "application/json");
    res.end(JSON.stringify(respJson));
});