const router = require('express').Router();
const HttpError = require('../lib/HttpError');
const conn = require('../common/database').conn;
const config = require('../config');

const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(stripeSecretKey);
const moment = require('moment');

router.post('/process/:handle', (req, res, next) => {
  let amount = 1900;
  const desc = `Early access for ${req.params.handle} (${req.body.token.email})`;

  stripe.charges.create({
    amount:        amount,
    description:   desc,
    source:        req.body.token.id,
    receipt_email: req.body.token.email,
    currency:      "usd"
  }).then(data => {
    var query = 'INSERT INTO subscriptions (handle, email, paid_on, paid_til, payment_data) VALUES (?, ?, ?, ?, ?);';
    var params = [
      req.params.handle,
      req.body.token.email,
      moment().toDate(),
      moment().add({months: 3}).toDate(),
      JSON.stringify(data)
    ];
    conn.query(query, params, (err, results) => {
        if (err) return next(err);
        res.json({'status': true});
      }
    );
  }).catch(a => {
    res.json({'status': false});
  });
});

router.get('/status/:handle', (req, res, next) => {
  const sql = `
    SELECT *
    FROM subscriptions
    WHERE
      handle = "${req.params.handle}"
      AND paid_til > NOW()
  `;

  conn.query(sql, (err, results) => {
    if (err) return next(err);
    if (results.length > 0) {
      res.json({'status': true});
    } else {
      res.json({'status': false});
    }
  });
});

module.exports = router;
