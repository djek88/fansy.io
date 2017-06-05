const router = require('express').Router();
const HttpError = require('../lib/HttpError');
const conn = require('../common/database').conn;
const config = require('../config');

router.get('/:nickname', (req, res, next) => {
  const nickname = req.params.nickname;

  if (!nickname) return next(new HttpError(400));

  selectStreamer()
    .then(res.json.bind(res))
    .catch(next);

  function selectStreamer() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          streamers.id        AS id,
          streamers.nickname  AS nickname
        FROM streamers
        WHERE streamers.nickname = "${nickname}"
      `;

      conn.query(sql, (err, streamers) => {
        if (err) return reject(err);
        if (!streamers[0]) return reject(new HttpError(404));

        const streamer = streamers[0];

        resolve(streamers[0]);
      });
    });
  }
});

router.get('/:id/games', (req, res, next) => {
  const streamerId = req.params.id;
  let skip = Number(req.query.skip);
  let limit = Number(req.query.limit);

  if (!streamerId || isNaN(streamerId)) return next(new HttpError(400));
  if (!skip || skip < 0) skip = 0;
  if (!limit || limit > 18 || limit < 0) limit = 18;

  selectGames()
    .then(res.json.bind(res))
    .catch(next);

  function selectGames() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          stream_games.id           AS id,
          stream_games.streamId     AS streamId,
          stream_games.created_at   AS created_at,
          events.firstEventId       AS firstEventId,
          allStream_games.totalNum  AS totalNum,
          heroes.name               AS heroName,
          highlights.hlTotalCount   AS hlTotalCount,
          killEvents.totalCount     AS killScore,
          assistEvents.totalCount   AS assistScore,
          deathEvents.totalCount    AS deathScore
        FROM stream_games
        LEFT JOIN heroes ON stream_games.heroId = heroes.id

        LEFT JOIN (
          SELECT gameId, MIN(id) AS firstEventId
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY gameId
        ) AS events ON events.gameId = stream_games.id

        LEFT JOIN (
          SELECT streamId, COUNT(id) AS totalNum
          FROM stream_games
          WHERE streamerId = ${streamerId} AND heroId <> 0
          GROUP BY streamId
        ) AS allStream_games ON allStream_games.streamId = stream_games.streamId

        LEFT JOIN (
          SELECT gameId, COUNT(id) AS hlTotalCount
          FROM highlights
          WHERE streamerInvolved <> 0 AND processed = 0
          GROUP BY gameId
        ) AS highlights ON highlights.gameId = stream_games.id

        LEFT JOIN (
          SELECT gameId, killerId, COUNT(id) AS totalCount
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY gameId
        ) AS killEvents ON killEvents.gameId = stream_games.id
                          AND killEvents.killerId = stream_games.heroId

        LEFT JOIN (
          SELECT gameId, COUNT(id) AS totalCount,
             assistant1, assistant2, assistant3, assistant4
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY gameId
        ) AS assistEvents ON assistEvents.gameId = stream_games.id
                          AND assistEvents.assistant1 = stream_games.heroId
                          OR assistEvents.assistant2 = stream_games.heroId
                          OR assistEvents.assistant3 = stream_games.heroId
                          OR assistEvents.assistant4 = stream_games.heroId

        LEFT JOIN (
          SELECT gameId, victimId, COUNT(id) AS totalCount
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY gameId
        ) AS deathEvents ON deathEvents.gameId = stream_games.id
                          AND deathEvents.victimId = stream_games.heroId

        WHERE stream_games.streamerId = ${streamerId} AND stream_games.heroId <> 0
        ORDER BY stream_games.id DESC
        LIMIT ${skip}, ${limit}
      `;

      conn.query(sql, (err, games) => {
        if (err) return reject(err);

        games.forEach(game => {
          game.thumb = `${config.gameData.thumbPref}/${game.streamId}/${game.firstEventId}.jpg`;
        });

        resolve(games);
      });
    });
  }
});

router.get('/:id/highlights', (req, res, next) => {
  const streamerId = req.params.id;
  let championId = req.query.champion;
  let type = Number(req.query.type);
  let stage = Number(req.query.stage);
  // let fightType = Number(req.query.fightType); // no need currently
  const multiKill = req.query.multiKill === 'true';
  // let teamFight = req.query.teamFight === 'true'; // no need currently
  let skip = Number(req.query.skip);
  let limit = Number(req.query.limit);

  if (!streamerId || isNaN(streamerId)) return next(new HttpError(400));
  if (isNaN(championId) || championId < 1) championId = null;
  if (type < 1 || type > 3) type = null;
  if (stage < 1 || stage > 2) stage = null;
  if (!skip || skip < 0) skip = 0;
  if (!limit || limit > 18 || limit < 0) limit = 18;

  Promise.all([getHighlightsTotalCount(), selectHighlights()])
    .then(([totalCount, highlights]) => res.json({ totalCount, highlights }))
    .catch(next);

  function getHighlightsTotalCount() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT COUNT(highlights.id) AS totalCount
        FROM highlights
        LEFT JOIN stream_games ON stream_games.id = highlights.gameId

        LEFT JOIN (
          SELECT highlightId, killerId, COUNT(id) AS totalCount
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS killEvents ON killEvents.highlightId = highlights.id
                        AND killEvents.killerId = highlights.streamerInvolved

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount,
             assistant1, assistant2, assistant3, assistant4
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS assistEvents ON assistEvents.highlightId = highlights.id
                          AND assistEvents.assistant1 = highlights.streamerInvolved
                          OR assistEvents.assistant2 = highlights.streamerInvolved
                          OR assistEvents.assistant3 = highlights.streamerInvolved
                          OR assistEvents.assistant4 = highlights.streamerInvolved

        LEFT JOIN (
          SELECT highlightId, victimId, COUNT(id) AS totalCount
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS deathEvents ON deathEvents.highlightId = highlights.id
                         AND deathEvents.victimId = highlights.streamerInvolved

        LEFT JOIN (
          SELECT highlightId, MAX(created_at) AS lastEventTime
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS events ON events.highlightId = highlights.id

        WHERE highlights.streamerId = ${streamerId}
          AND highlights.streamerInvolved <> 0
          AND highlights.processed = 0
          ${championId ? `AND highlights.streamerInvolved = ${championId}` : ``}
          ${type === 1 ? `AND killEvents.totalCount > 0` :
            type === 2 ? `AND deathEvents.totalCount > 0` :
            type === 3 ? `AND assistEvents.totalCount > 0` : ``}
          ${stage === 1 ? `AND events.lastEventTime - stream_games.created_at < 900000` :
            stage === 2 ? `AND events.lastEventTime - stream_games.created_at > 900000` : ``}
          ${multiKill ? `AND killEvents.totalCount > 1` : ``}
        GROUP BY highlights.streamerId
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
          highlights.id           AS id,
          highlights.streamId     AS streamId,
          highlights.highlightNum AS highlightNum,
          streams.streamNum       AS streamNum,
          heroes.name             AS heroName,
          heroes.fileName         AS heroFileName,
          stream_games.id         AS gameId,
          stream_games.created_at AS gameDate,
          streamers.nickname      AS streamerNickname,
          events.firstEventId     AS firstEventId,
          killEvents.totalCount   AS killScore,
          assistEvents.totalCount AS assistScore,
          deathEvents.totalCount  AS deathScore
        FROM highlights
        LEFT JOIN streams ON streams.id = highlights.streamId
        LEFT JOIN heroes ON heroes.id = highlights.streamerInvolved
        LEFT JOIN stream_games ON stream_games.id = highlights.gameId
        LEFT JOIN streamers ON streamers.id = highlights.streamerId

        LEFT JOIN (
          SELECT highlightId, MIN(id) AS firstEventId, MAX(created_at) AS lastEventTime
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS events ON events.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, killerId, COUNT(id) AS totalCount
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS killEvents ON killEvents.highlightId = highlights.id
                        AND killEvents.killerId = highlights.streamerInvolved

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount,
             assistant1, assistant2, assistant3, assistant4
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS assistEvents ON assistEvents.highlightId = highlights.id
                          AND assistEvents.assistant1 = highlights.streamerInvolved
                          OR assistEvents.assistant2 = highlights.streamerInvolved
                          OR assistEvents.assistant3 = highlights.streamerInvolved
                          OR assistEvents.assistant4 = highlights.streamerInvolved

        LEFT JOIN (
          SELECT highlightId, victimId, COUNT(id) AS totalCount
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS deathEvents ON deathEvents.highlightId = highlights.id
                         AND deathEvents.victimId = highlights.streamerInvolved

        WHERE highlights.streamerId = ${streamerId}
          AND highlights.streamerInvolved <> 0
          AND highlights.processed = 0
          ${championId ? `AND highlights.streamerInvolved = ${championId}` : ``}
          ${type === 1 ? `AND killEvents.totalCount > 0` :
            type === 2 ? `AND deathEvents.totalCount > 0` :
            type === 3 ? `AND assistEvents.totalCount > 0` : ``}
          ${stage === 1 ? `AND events.lastEventTime - stream_games.created_at < 900000` :
            stage === 2 ? `AND events.lastEventTime - stream_games.created_at > 900000` : ``}
          ${multiKill ? `AND killEvents.totalCount > 1` : ``}
        ORDER BY highlights.id DESC
        LIMIT ${skip}, ${limit}
      `;

      conn.query(sql, (err, highlights) => {
        if (err) return reject(err);

        highlights.forEach(hl => {
          hl.heroIcon = `${config.heroData.iconPref}/${hl.heroFileName}.png`;
          hl.thumb = `${config.highlightData.thumbPref}/${hl.streamId}/${hl.firstEventId}.jpg`;
          hl.video = `${config.highlightData.videoPref}/${hl.streamerNickname}/${hl.streamNum}/${hl.highlightNum}.mp4`;
        });

        resolve(highlights);
      });
    });
  }
});

router.get('/:id/highlights/champions', (req, res, next) => {
  const streamerId = req.params.id;

  if (!streamerId || isNaN(streamerId)) return next(new HttpError(400));

  selectChampions()
    .then(res.json.bind(res))
    .catch(next);

  function selectChampions() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          heroes.id   AS id,
          heroes.name AS name
        FROM highlights
        LEFT JOIN heroes ON heroes.id = highlights.streamerInvolved
        WHERE highlights.streamerId = ${streamerId}
          AND highlights.streamerInvolved <> 0
          AND highlights.processed = 0
        GROUP BY heroes.id
        ORDER BY heroes.id
      `;

      conn.query(sql, (err, champions) => {
        if (err) return reject(err);

        resolve(champions);
      });
    });
  }
});

module.exports = router;
