const router = require('express').Router();
const HttpError = require('../lib/HttpError');
const conn = require('../common/database').conn;
const config = require('../config');

router.get('/:id/events', (req, res, next) => {
  const highlightId = req.params.id;

  if (!highlightId || isNaN(highlightId)) return next(new HttpError(400));

  selectEvents()
    .then(res.json.bind(res))
    .catch(next);

  function selectEvents() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          events.streamerInvolved     AS streamerHeroId,
          events.killerId             AS killerId,
          events.victimId             AS victimId,
          events.assistant1           AS assistant1Id,
          events.assistant2           AS assistant2Id,
          events.assistant3           AS assistant3Id,
          events.assistant4           AS assistant4Id,
          killerHero.fileName         AS killerFileName,
          victimHero.fileName         AS victimFileName,
          assistant1Hero.fileName     AS assistant1FileName,
          assistant2Hero.fileName     AS assistant2FileName,
          assistant2Hero.fileName     AS assistant3FileName,
          assistant2Hero.fileName     AS assistant4FileName
        FROM events
        LEFT JOIN heroes AS killerHero ON killerHero.id = events.killerId
        LEFT JOIN heroes AS victimHero ON victimHero.id = events.victimId
        LEFT JOIN heroes AS assistant1Hero ON assistant1Hero.id = events.assistant1
        LEFT JOIN heroes AS assistant2Hero ON assistant2Hero.id = events.assistant2
        LEFT JOIN heroes AS assistant3Hero ON assistant3Hero.id = events.assistant3
        LEFT JOIN heroes AS assistant4Hero ON assistant4Hero.id = events.assistant4
        WHERE events.highlightId = ${highlightId}
          AND events.type = 1
        ORDER BY events.created_at
      `;

      conn.query(sql, (err, events) => {
        if (err) return reject(err);

        events.forEach(e => {
          e.killerIcon = `${config.heroData.iconPref}/${e.killerFileName}.png`;
          e.victimIcon = `${config.heroData.iconPref}/${e.victimFileName}.png`;
          e.assistant1Icon = `${config.heroData.iconPref}/${e.assistant1FileName}.png`;
          e.assistant2Icon = `${config.heroData.iconPref}/${e.assistant2FileName}.png`;
          e.assistant3Icon = `${config.heroData.iconPref}/${e.assistant3FileName}.png`;
          e.assistant4Icon = `${config.heroData.iconPref}/${e.assistant4FileName}.png`;

          delete e.killerFileName;
          delete e.victimFileName;
          delete e.assistant1FileName;
          delete e.assistant2FileName;
          delete e.assistant3FileName;
          delete e.assistant4FileName;
        });

        resolve(events);
      });
    });
  }
});

module.exports = router;
