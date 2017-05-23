import {Config} from "../common/config";
import * as express from "express";
export let router = express.Router();

import {Database} from "../common/database";

let config = Config.getInstance();
let conn = Database.getInstance().conn;

// good handlerbar tutorial: http://handlebarsjs.com/builtin_helpers.html

router.get("/:nickname", function (req, res, next) {
    let streamer = req.params.nickname;

    if (!streamer) {
        //res.status(404);
        //res.redirect(req.header('Referer'));
        return;
    }

     conn.query(
         'SELECT streamers.id, COUNT(stream_games.id) as gameNumTotal ' +
         'FROM streamers ' +
         'LEFT JOIN stream_games on stream_games.streamerId = streamers.id ' +
         'WHERE streamers.nickname = "' + streamer + '" AND stream_games.heroId <> 0 ' +
         'GROUP BY streamers.id ', 
         onStreamerSelected.bind({res: res, req: req}));
    //console.log('SELECT id FROM streamers where nickname = "' + streamer + '"');
});


function onStreamerSelected(error, results, fields) {

    if (error || results.length != 1) {
        this.res.status(404);
        //this.res.redirect(this.req.header('Referer'));
        console.log(error);
        return;
    }

    let p = this.req.page ? (this.req.page - 1) : 0; // -1 because page number from 1 while offset in mysql is from 0

    let sql = 'SELECT stream_games.id as gameId, stream_games.streamId, stream_games.created_at, ' +
    'heroes.name as heroName, ' +
    'stream_games.killScore, stream_games.deathScore, stream_games.assistScore, ' + 
    'COUNT(highlights.id) as hlNum, te.firstEventId ' +
    'FROM stream_games ' +
    'LEFT JOIN heroes on stream_games.heroId = heroes.id ' +
    'LEFT JOIN highlights on stream_games.id = highlights.gameId ' +
    'LEFT JOIN ' + 
    '(select MIN(id) as firstEventId, gameId from events ' +
      'where type = 1 and streamerInvolved <> 0 group by gameId) as te on te.gameId = stream_games.id ' +
    'WHERE stream_games.streamerId = ' + results[0].id + ' ' +
    'and stream_games.heroId <> 0 ' + 
    'GROUP BY stream_games.id, heroes.name ' +
    'ORDER BY stream_games.id DESC ' +
    'LIMIT ' + (p * 18) + ', 18'; // maximum 18 games per page (6 rows, 3 columns)
    conn.query(sql, onGamesSelected.bind({res: this.res, req: this.req, gameNumTotal: results[0].gameNumTotal}));
    //console.log(sql);
}


function onGamesSelected(error, results, fields) {

    if (error) {
        this.res.status(404);
        //this.res.redirect(this.req.header('Referer'));
        console.log(error);
        return;
    }

    let gamesList = [];
    let rowsNum: number = 6;
    let colsNum: number = 3;
    let rowsInd: number = -1;

    for (let i: number = 0; i < results.length; ++i) {
        if(i % colsNum == 0) {
            ++rowsInd;
            gamesList.push({"item": []});
        }
        let thumbPath: string = config.get2("gameData", "thumbPref") + 
                                results[i].streamId + "/" + 
                                results[i].firstEventId + ".jpg";
        gamesList[rowsInd]["item"].push({"heroName": results[i].heroName,
                                         "gameDate": results[i].created_at,
                                         "kill": results[i].killScore,
                                         "death": results[i].deathScore,
                                         "assists": results[i].assistScore,
                                         "hlNum": results[i].hlNum,
                                         "thumb": thumbPath,
                                         "url": "/streamer/" + this.req.params.nickname + "/game-" + results[i].gameId});
        
    }

    let pagination = {};
    if(this.gameNumTotal / (rowsNum * colsNum) > 1) {

        let p = this.req.page ? (this.req.page) : 1; // current page number (from 1)
        
        let pagesBefore = [];
        for(let i: number = Math.max(1, p - 5); i < p; ++i) {
            pagesBefore.push(i);
        }

        let pagesAfter = [];
        for(let i: number = p + 1; i < Math.min(Math.ceil(this.gameNumTotal / (rowsNum * colsNum)), p + 5); ++i) {
            pagesAfter.push(i);
        }

        pagination = {//prev: (p <= 1) ? null : p - 1,
                        //next: (this.gameNumTotal / (rowsNum * colsNum)) <= p) ? null : p + 1,
                        currentPage: p,
                        pagesBefore: pagesBefore,
                        pagesAfter: pagesAfter};
    }

    this.res.render("streamer", {
            "name": this.req.params.nickname,
            "gamesList": gamesList,
            "pagination": pagination
        });
}


/*
router.get("/getstreamer/:nickname", function (req, res, next) {
    let streamer = null; // streamers.getStreamer(req.params.nickname);

    if (streamer == null) {
        res.status(404);
        res.end("Streamer not found");
        return;
    }

    res.set("content-type", "application/json");

    res.end(JSON.stringify({
        "name": streamer.name,
        "machineSatus": streamer.machine.getStatusDescr(),
        "streamStatus": streamer.stream.getStatusDescr()
    }));
});*/


router.get("/:nickname/:game", function (req, res, next) {
    let streamer = req.params.nickname;
    
    //console.log(req.params);
    //console.log(req.params.game);

    let delimInd: number = req.params.game.indexOf("-");
    let gameId: number = 0;
    if(delimInd != -1) {
        gameId = parseInt(req.params.game.substring(delimInd + 1));
    }

    if (!streamer || !gameId) {
        //res.status(404);
        //res.redirect(req.header('Referer'));
        return;
    }


    let sql = 'SELECT stream_games.id as gameId, stream_games.streamId, stream_games.created_at, ' +
    'sterams.steramNum, ' +
    'FROM stream_games ' +
    'LEFT JOIN streams on stream_games.streamId = streams.id ' +
    'LEFT JOIN ' + 
    '(select MIN(id) as firstEventId, gameId from events ' +
      'where type = 1 and streamerInvolved <> 0 group by gameId) as te on te.gameId = stream_games.id ' +
    'WHERE stream_games.id = ' + gameId;// + ' ' +
    //'LIMIT ' + (p * 18) + ', 18'; // maximum 18 games per page (6 rows, 3 columns)
    conn.query(sql, onGameSelected.bind({res: this.res, req: this.req}));
    //console.log(sql);
});


function onGameSelected(error, results, fields) {

    if (error) {
        this.res.status(404);
        //this.res.redirect(this.req.header('Referer'));
        console.log(error);
        return;
    }

    let gameHl: string = config.get2("gameData", "gameHlPref") + 
                         this.req.params.nickname + "/" + 
                         results[0].streamNum + "/" +
                         results[0].gameNum + ".mp4";
    let thumbPath: string = config.get2("gameData", "thumbPref") + 
                                results[0].streamId + "/" + 
                                results[0].firstEventId + ".jpg";
    this.res.render("game_hl", {
            "name": this.req.params.nickname,
            "gameHl": gameHl,
            "gameHlThumb": gameHl
        });
}