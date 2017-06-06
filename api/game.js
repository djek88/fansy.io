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
          stream_games.id           AS id,
          stream_games.gameNum      AS gameNum,
          stream_games.streamId     AS streamId,
          events.firstEventId       AS firstEventId,
          heroes.name               AS heroName,
          streamers.nickname        AS streamerNickname,
          streams.streamNum         AS streamNum,
          killEvents.totalCount     AS killScore,
          assistEvents.totalCount   AS assistScore,
          deathEvents.totalCount    AS deathScore
        FROM stream_games
        LEFT JOIN heroes ON stream_games.heroId = heroes.id
        LEFT JOIN streamers ON streamers.id = stream_games.streamerId
        LEFT JOIN streams ON streams.id = stream_games.streamId

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
          WHERE type = 1
            AND streamerInvolved = game.heroId
            AND killerId = game.heroId
          GROUP BY gameId
        ) AS killEvents ON killEvents.gameId = stream_games.id

        LEFT JOIN (
          SELECT gameId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _gameId, heroId FROM stream_games) AS game ON events.gameId = game._gameId
          WHERE type = 1
          AND streamerInvolved = game.heroId
          AND (assistant1 = game.heroId
            OR assistant2 = game.heroId
            OR assistant3 = game.heroId
            OR assistant4 = game.heroId)
          GROUP BY gameId
        ) AS assistEvents ON assistEvents.gameId = stream_games.id

        LEFT JOIN (
          SELECT gameId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _gameId, heroId FROM stream_games) AS game ON events.gameId = game._gameId
          WHERE type = 1
            AND streamerInvolved = game.heroId
            AND victimId = game.heroId
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
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND killerId = highlight.streamerInvolved
          GROUP BY highlightId
        ) AS killEvents ON killEvents.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND (assistant1 = highlight.streamerInvolved
              OR assistant2 = highlight.streamerInvolved
              OR assistant3 = highlight.streamerInvolved
              OR assistant4 = highlight.streamerInvolved)
          GROUP BY highlightId
        ) AS assistEvents ON assistEvents.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND victimId = highlight.streamerInvolved
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
          AND highlights.processed = 0
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
          highlights.id           AS id,
          highlights.highlightNum AS highlightNum,
          highlights.streamId     AS streamId,
          streams.streamNum       AS streamNum,
          streamers.nickname      AS streamerNickname,
          events.firstEventId     AS firstEventId,
          killEvents.totalCount   AS killScore,
          assistEvents.totalCount AS assistScore,
          deathEvents.totalCount  AS deathScore
        FROM highlights
        LEFT JOIN streams ON streams.id = highlights.streamId
        LEFT JOIN streamers ON streamers.id = highlights.streamerId
        LEFT JOIN stream_games ON stream_games.id = highlights.gameId

        LEFT JOIN (
          SELECT highlightId, MIN(id) AS firstEventId, MAX(created_at) AS lastEventTime
          FROM events
          WHERE type = 1 AND streamerInvolved <> 0
          GROUP BY highlightId
        ) AS events ON events.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND killerId = highlight.streamerInvolved
          GROUP BY highlightId
        ) AS killEvents ON killEvents.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND (assistant1 = highlight.streamerInvolved
              OR assistant2 = highlight.streamerInvolved
              OR assistant3 = highlight.streamerInvolved
              OR assistant4 = highlight.streamerInvolved)
          GROUP BY highlightId
        ) AS assistEvents ON assistEvents.highlightId = highlights.id

        LEFT JOIN (
          SELECT highlightId, COUNT(id) AS totalCount
          FROM events
          LEFT JOIN (SELECT id AS _hlId, streamerInvolved FROM highlights) AS highlight ON events.highlightId = highlight._hlId
          WHERE type = 1
            AND events.streamerInvolved = highlight.streamerInvolved
            AND victimId = highlight.streamerInvolved
          GROUP BY highlightId
        ) AS deathEvents ON deathEvents.highlightId = highlights.id

        WHERE highlights.gameId = ${gameId}
          AND highlights.streamerInvolved <> 0
          AND highlights.processed = 0
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
          hl.thumb = `${config.highlightData.thumbPref}/${hl.streamId}/${hl.firstEventId}.jpg`;
          hl.video = `${config.highlightData.videoPref}/${hl.streamerNickname}/${hl.streamNum}/${hl.highlightNum}.mp4`;
        });

        resolve(highlights);
      });
    });
  }
});

module.exports = router;
