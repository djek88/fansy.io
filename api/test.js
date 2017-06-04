const router = require('express').Router();
const HttpError = require('../lib/HttpError');
const conn = require('../common/database').conn;
const config = require('../config');

router.get('/streams', (req, res, next) => {
  const sql = `
    SELECT *
    FROM streams
  `;

  conn.query(sql, (err, results) => {
    if (err) return next(err);

    res.json(results);
  });
});
router.get('/stream_games', (req, res, next) => {
  const sql = `
    SELECT *
    FROM stream_games
  `;

  conn.query(sql, (err, results) => {
    if (err) return next(err);

    res.json(results);
  });
});
router.get('/highlights', (req, res, next) => {
  const sql = `
    SELECT *
    FROM highlights
  `;

  conn.query(sql, (err, results) => {
    if (err) return next(err);

    res.json(results);
  });
});
router.get('/events', (req, res, next) => {
  const sql = `
    SELECT *
    FROM events
  `;

  conn.query(sql, (err, results) => {
    if (err) return next(err);

    res.json(results);
  });
});
router.get('/kill_events', (req, res, next) => {
  const sql = `
    SELECT *
    FROM kill_events
  `;

  conn.query(sql, (err, results) => {
    if (err) return next(err);

    res.json(results);
  });
});
router.get('/streamers', (req, res, next) => {
  const sql = `
    SELECT *
    FROM streamers
  `;

  conn.query(sql, (err, results) => {
    if (err) return next(err);

    res.json(results);
  });
});
router.get('/heroes', (req, res, next) => {
  const sql = `
    SELECT *
    FROM heroes
  `;

  conn.query(sql, (err, results) => {
    if (err) return next(err);

    res.json(results);
  });
});

module.exports = router;