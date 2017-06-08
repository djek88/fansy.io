const router = require('express').Router();
const HttpError = require('../lib/HttpError');
const conn = require('../common/database').conn;
const config = require('../config');

router.get('/:id/highlights', (req, res, next) => {
  const gameId = req.params.id;
  let type = Number(req.query.type);
  let stage = Number(req.query.stage);
  // let fightType = Number(req.query.fightType); // no need currently
  let multiKill = req.query.multiKill;
  // let teamFight = req.query.teamFight === 'true'; // no need currently
  let skip = Number(req.query.skip);
  let limit = Number(req.query.limit);

  if (!gameId || isNaN(gameId)) return next(new HttpError(400));
  if (type < 1 || type > 3) type = null;
  if (stage < 1 || stage > 2) stage = null;
  if (!skip || skip < 0) skip = 0;
  if (!limit || limit > 18 || limit < 0) limit = 18;

  Promise.all([selectGame(), getHighlightsTotalCount(), selectHighlights()])
    .then(([game, totalCount, highlights]) => res.json({ game, totalCount, highlights }))
    .catch(next);

  function selectGame() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          stream_games.id                                   AS id,
          stream_games.gameNum                              AS gameNum,
          stream_games.streamId                             AS streamId,
          #stream_games.updated_at - stream_games.created_at AS gameTime,
          events.firstEventId                               AS firstEventId,
          heroes.name                                       AS heroName,
          streamers.nickname                                AS streamerNickname,
          streams.streamNum                                 AS streamNum,
          killEvents.totalCount                             AS killScore,
          assistEvents.totalCount                           AS assistScore,
          deathEvents.totalCount                            AS deathScore,
          team1Hero1.fileName                               AS team1Hero1FileName,
          team1Hero2.fileName                               AS team1Hero2FileName,
          team1Hero3.fileName                               AS team1Hero3FileName,
          team1Hero4.fileName                               AS team1Hero4FileName,
          team1Hero5.fileName                               AS team1Hero5FileName,
          team2Hero1.fileName                               AS team2Hero1FileName,
          team2Hero2.fileName                               AS team2Hero2FileName,
          team2Hero3.fileName                               AS team2Hero3FileName,
          team2Hero4.fileName                               AS team2Hero4FileName,
          team2Hero5.fileName                               AS team2Hero5FileName
        FROM stream_games
        LEFT JOIN heroes ON stream_games.heroId = heroes.id
        LEFT JOIN streamers ON streamers.id = stream_games.streamerId
        LEFT JOIN streams ON streams.id = stream_games.streamId
        LEFT JOIN heroes AS team1Hero1 ON team1Hero1.id = stream_games.team1hero1
        LEFT JOIN heroes AS team1Hero2 ON team1Hero2.id = stream_games.team1hero2
        LEFT JOIN heroes AS team1Hero3 ON team1Hero3.id = stream_games.team1hero3
        LEFT JOIN heroes AS team1Hero4 ON team1Hero4.id = stream_games.team1hero4
        LEFT JOIN heroes AS team1Hero5 ON team1Hero5.id = stream_games.team1hero5
        LEFT JOIN heroes AS team2Hero1 ON team2Hero1.id = stream_games.team2hero1
        LEFT JOIN heroes AS team2Hero2 ON team2Hero2.id = stream_games.team2hero2
        LEFT JOIN heroes AS team2Hero3 ON team2Hero3.id = stream_games.team2hero3
        LEFT JOIN heroes AS team2Hero4 ON team2Hero4.id = stream_games.team2hero4
        LEFT JOIN heroes AS team2Hero5 ON team2Hero5.id = stream_games.team2hero5

        LEFT JOIN (
          SELECT gameId, MIN(id) AS firstEventId
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY gameId
        ) AS events ON events.gameId = stream_games.id

        LEFT JOIN (
          SELECT gameId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _gameId, heroId FROM stream_games) AS game ON events.gameId = game._gameId
          LEFT JOIN (SELECT id AS _heroId, type AS heroType FROM heroes) AS victim ON victim._heroId = events.victimId
          WHERE type = 1
            AND streamerInvolved = game.heroId
            AND killerId = game.heroId
            AND victim.heroType = 1
          GROUP BY gameId
        ) AS killEvents ON killEvents.gameId = stream_games.id

        LEFT JOIN (
          SELECT gameId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _gameId, heroId FROM stream_games) AS game ON events.gameId = game._gameId
          LEFT JOIN (SELECT id AS _heroId, type AS heroType FROM heroes) AS victim ON victim._heroId = events.victimId
          WHERE type = 1
          AND streamerInvolved = game.heroId
          AND (assistant1 = game.heroId
            OR assistant2 = game.heroId
            OR assistant3 = game.heroId
            OR assistant4 = game.heroId)
          AND victim.heroType = 1
          GROUP BY gameId
        ) AS assistEvents ON assistEvents.gameId = stream_games.id

        LEFT JOIN (
          SELECT gameId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _gameId, heroId FROM stream_games) AS game ON events.gameId = game._gameId
          LEFT JOIN (SELECT id AS _heroId, type AS heroType FROM heroes) AS killer ON killer._heroId = events.killerId
          WHERE type = 1
            AND streamerInvolved = game.heroId
            AND victimId = game.heroId
            AND killer.heroType = 1
          GROUP BY gameId
        ) AS deathEvents ON deathEvents.gameId = stream_games.id

        WHERE stream_games.id = ${gameId}
      `;

      conn.query(sql, (err, games) => {
        if (err) return reject(err);
        if (!games[0]) return reject(new HttpError(404))

        const game = games[0];

        game.hlsThumb = `${config.gameData.thumbPref}/${game.streamId}/${game.firstEventId}.jpg`;
        game.hlsVideo = `${config.gameData.highlightsVideoPref}/${game.streamerNickname}/${game.streamNum}/${game.gameNum}.mp4`;

        game.team1Hero1Icon = game.team1Hero1FileName ? `${config.heroData.iconPref}/${game.team1Hero1FileName}.png` : null;
        game.team1Hero2Icon = game.team1Hero2FileName ? `${config.heroData.iconPref}/${game.team1Hero2FileName}.png` : null;
        game.team1Hero3Icon = game.team1Hero3FileName ? `${config.heroData.iconPref}/${game.team1Hero3FileName}.png` : null;
        game.team1Hero4Icon = game.team1Hero4FileName ? `${config.heroData.iconPref}/${game.team1Hero4FileName}.png` : null;
        game.team1Hero5Icon = game.team1Hero5FileName ? `${config.heroData.iconPref}/${game.team1Hero5FileName}.png` : null;
        game.team2Hero1Icon = game.team2Hero1FileName ? `${config.heroData.iconPref}/${game.team2Hero1FileName}.png` : null;
        game.team2Hero2Icon = game.team2Hero2FileName ? `${config.heroData.iconPref}/${game.team2Hero2FileName}.png` : null;
        game.team2Hero3Icon = game.team2Hero3FileName ? `${config.heroData.iconPref}/${game.team2Hero3FileName}.png` : null;
        game.team2Hero4Icon = game.team2Hero4FileName ? `${config.heroData.iconPref}/${game.team2Hero4FileName}.png` : null;
        game.team2Hero5Icon = game.team2Hero5FileName ? `${config.heroData.iconPref}/${game.team2Hero5FileName}.png` : null;

        delete game.team1Hero1FileName;
        delete game.team1Hero2FileName;
        delete game.team1Hero3FileName;
        delete game.team1Hero4FileName;
        delete game.team1Hero5FileName;
        delete game.team2Hero1FileName;
        delete game.team2Hero2FileName;
        delete game.team2Hero3FileName;
        delete game.team2Hero4FileName;
        delete game.team2Hero5FileName;

        resolve(game);
      });
    });
  }

  function getHighlightsTotalCount() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT COUNT(highlights.id) AS totalCount
        FROM highlights
        LEFT JOIN stream_games ON stream_games.id = highlights.gameId

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          LEFT JOIN (SELECT id AS _heroId, type AS heroType FROM heroes) AS victim ON victim._heroId = events.victimId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND killerId = highlight.streamerInvolved
            AND victim.heroType = 1
          GROUP BY highlightId
        ) AS killEvents ON killEvents.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          LEFT JOIN (SELECT id AS _heroId, type AS heroType FROM heroes) AS victim ON victim._heroId = events.victimId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND (assistant1 = highlight.streamerInvolved
              OR assistant2 = highlight.streamerInvolved
              OR assistant3 = highlight.streamerInvolved
              OR assistant4 = highlight.streamerInvolved)
            AND victim.heroType = 1
          GROUP BY highlightId
        ) AS assistEvents ON assistEvents.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          LEFT JOIN (SELECT id AS _heroId, type AS heroType FROM heroes) AS killer ON killer._heroId = events.killerId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND victimId = highlight.streamerInvolved
            AND killer.heroType = 1
          GROUP BY highlightId
        ) AS deathEvents ON deathEvents.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, MAX(created_at) AS lastEventTime
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS events ON events.highlightId = highlights.id

        WHERE highlights.gameId = ${gameId}
          AND highlights.streamerInvolved <> 0
          ${type === 1 ? `AND killEvents.totalCount > 0` :
            type === 2 ? `AND deathEvents.totalCount > 0` :
            type === 3 ? `AND assistEvents.totalCount > 0` : ``}
          ${stage === 1 ? `AND events.lastEventTime - stream_games.created_at < 900000` :
            stage === 2 ? `AND events.lastEventTime - stream_games.created_at > 900000` : ``}
          ${multiKill ? `AND killEvents.totalCount > 1` : ``}
        GROUP BY highlights.gameId
      `;

      conn.query(sql, (err, results) => {
        if (err) return reject(err);

        resolve(results[0] && results[0].totalCount || 0);
      });
    });
  }

  function selectHighlights() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          highlights.id                                             AS id,
          highlights.highlightNum                                   AS highlightNum,
          highlights.streamId                                       AS streamId,
          streams.streamNum                                         AS streamNum,
          #(events.firstEventTime - 5000) - stream_games.created_at AS gameTime,
          streamers.nickname                                        AS streamerNickname,
          events.firstEventId                                       AS firstEventId,
          killEvents.totalCount                                     AS killScore,
          assistEvents.totalCount                                   AS assistScore,
          deathEvents.totalCount                                    AS deathScore
        FROM highlights
        LEFT JOIN streams ON streams.id = highlights.streamId
        LEFT JOIN streamers ON streamers.id = highlights.streamerId
        LEFT JOIN stream_games ON stream_games.id = highlights.gameId

        LEFT JOIN (
          SELECT
            highlightId,
            MIN(id) AS firstEventId,
            MIN(created_at) AS firstEventTime,
            MAX(created_at) AS lastEventTime
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS events ON events.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          LEFT JOIN (SELECT id AS _heroId, type AS heroType FROM heroes) AS victim ON victim._heroId = events.victimId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND killerId = highlight.streamerInvolved
            AND victim.heroType = 1
          GROUP BY highlightId
        ) AS killEvents ON killEvents.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          LEFT JOIN (SELECT id AS _heroId, type AS heroType FROM heroes) AS victim ON victim._heroId = events.victimId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND (assistant1 = highlight.streamerInvolved
              OR assistant2 = highlight.streamerInvolved
              OR assistant3 = highlight.streamerInvolved
              OR assistant4 = highlight.streamerInvolved)
            AND victim.heroType = 1
          GROUP BY highlightId
        ) AS assistEvents ON assistEvents.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          LEFT JOIN (SELECT id AS _heroId, type AS heroType FROM heroes) AS killer ON killer._heroId = events.killerId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND victimId = highlight.streamerInvolved
            AND killer.heroType = 1
          GROUP BY highlightId
        ) AS deathEvents ON deathEvents.highlightId = highlights.id

        WHERE highlights.gameId = ${gameId}
          AND highlights.streamerInvolved <> 0
          ${type === 1 ? `AND killEvents.totalCount > 0` :
            type === 2 ? `AND deathEvents.totalCount > 0` :
            type === 3 ? `AND assistEvents.totalCount > 0` : ``}
          ${stage === 1 ? `AND lastEvent.created_at - stream_games.created_at < 900000` :
            stage === 2 ? `AND lastEvent.created_at - stream_games.created_at > 900000` : ``}
          ${multiKill ? `AND killEvents.totalCount > 1` : ``}
        ORDER BY highlights.id
        LIMIT ${skip}, ${limit}
      `;

      conn.query(sql, (err, highlights) => {
        if (err) return reject(err);

        highlights.forEach(hl => {
          hl.thumb = `${config.highlightData.thumbPref}/${hl.streamId}/${hl.firstEventId}.jpg`;
          hl.video = `${config.highlightData.videoPref}/${hl.streamerNickname}/${hl.streamNum}/${hl.highlightNum}.mp4`;
        });

        resolve(highlights);
      });
    });
  }
});

module.exports = router;
