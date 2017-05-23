import {Config} from "../common/config";
import * as express from "express";
export let router = express.Router();

import {Database} from "../common/database";

let config = Config.getInstance();
let conn = Database.getInstance().conn;


/**
 * Read parameters from request and select HL
 * @param req 
 * @param callback 
 */
function getHl(streamerId, callback: () => void) {
    let p = 0; //this.req.page ? (this.req.page - 1) : 0; // -1 because page number from 1 while offset in mysql is from 0

    let sql = 'SELECT highlights.id ' +
    'WHERE highlights.streamerInvolved <> 0 ' +
    'and highlights.streamerId = ' + streamerId + ' '
    'LIMIT ' + (p * 18) + ', 18'; // maximum 18 games per page (6 rows, 3 columns)
    conn.query(sql, callback);
    //console.log(sql);
}