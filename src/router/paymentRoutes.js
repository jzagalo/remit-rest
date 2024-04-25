const express = require('express');
const router = express.Router();
const stripe = require('stripe')(
  'sk_test_51OlqZyH3cCklqfTbwcIVJts95VXuoEUL8e5NT1ej8Pw97kWpIibqLlayIL7DCpCgHww3NDBNGgfWRLoeIpL3uNjh00J95sj1fI'
);

// router endpoints
router.post('/intents', async (req, res) => {
  try {
    // create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount, // Integer, usd -> pennies, eur -> cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    // Return the secret
    res.json({ paymentIntent: paymentIntent.client_secret });
  } catch (e) {
    res.status(400).json({
      error: e.message,
    });
  }
});

module.exports = router;
