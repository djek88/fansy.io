const router = require('express').Router();
const conn = require('../common/database').conn;
const config = require('../config');
const stripe = require("stripe")(config.stripe.secretKey);
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
      res.json({'status': true, 'paid_til': moment(results[0].paid_til).format('MMMM Do YYYY')});
    } else {
      res.json({'status': false, 'paid_til': ""});
    }
  });
});

module.exports = router;
