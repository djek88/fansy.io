import * as express from "express";
export let router = express.Router();

import {Database} from "../common/database";

let conn = Database.getInstance().conn;

router.get("/", function (req, res, next) {
    res.render("index");
});

async function getUser(login: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        conn.query('SELECT * FROM users WHERE login=? AND password=?', [login, password],
            function (error, results, fields) {
                if (error) {
                    console.log(error);
                    reject(error);
                    return;
                }

                if(results.length == 0) {
                    resolve(null);
                } else {
                    resolve(results[0]);
                }
            });
    });
}