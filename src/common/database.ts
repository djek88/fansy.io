import {Config} from "../common/config";
import * as mysql from "mysql";

let config = Config.getInstance();

export class Database {
    public static instance = new Database();

    public conn;

    public getConnection() {
        this.conn  = mysql.createPool({
            host     : config.get2("database", "host"),
            user     : config.get2("database", "login"),
            password : config.get2("database", "password"),
            database : config.get2("database", "dbname")
        });
    }

    constructor() {
        this.getConnection();
        Database.instance = this;
    }

    public static getInstance(): Database {
        return Database.instance;
    }
}