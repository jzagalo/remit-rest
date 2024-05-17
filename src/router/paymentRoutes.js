const Flutterwave = require('flutterwave-node-v3');
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(
  'sk_test_51OlqZyH3cCklqfTbwcIVJts95VXuoEUL8e5NT1ej8Pw97kWpIibqLlayIL7DCpCgHww3NDBNGgfWRLoeIpL3uNjh00J95sj1fI'
);

const flw = new Flutterwave('FLWPUBK_TEST-faf1fae2cceecc5f5a803645155e9000-X', 
'FLWSECK_TEST-3e83d5c4eec721c8217e2cbf1bceb23d-X');

router.get('/verify', async (req, res) => { 

  const details = {
    account_number: req.account_number,
    account_bank: req.account_bank
  }; 

  const accDetails = await flw.Misc.verify_Account(details)
  const result = await accDetails;
  res.json({
    result
  });

});

// router endpoints
router.post('/intents', async (req, res) => {
  
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2024-04-10'}
  );
  const userId = req.body.acn + '#' + req.body.reason + '#' + req.body.sec_currency + '#' + req.body.reception
  try {
    // create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount, // Integer, usd -> pennies, eur -> cents
      customer: customer.id,
      currency: 'eur',
      metadata: {      
        userId: userId
       },
      automatic_payment_methods: {
        enabled: true,
      }
    });
    // Return the secret
    res.json({ 
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: 'sk_test_51OlqZyH3cCklqfTbwcIVJts95VXuoEUL8e5NT1ej8Pw97kWpIibqLlayIL7DCpCgHww3NDBNGgfWRLoeIpL3uNjh00J95sj1fI'
    
    });
  } catch (e) {
    res.status(400).json({
      error: e.message,
    });
  }
});

module.exports = router;
