const Flutterwave = require('flutterwave-node-v3');
const express = require('express');
const router = express.Router();
var nodemailer = require('nodemailer');
const stripe = require('stripe')(
  'sk_test_51OlqZyH3cCklqfTbwcIVJts95VXuoEUL8e5NT1ej8Pw97kWpIibqLlayIL7DCpCgHww3NDBNGgfWRLoeIpL3uNjh00J95sj1fI'
);

var transporter = nodemailer.createTransport({
  service: 'gmail',
  host: `smtp.gmail.com`,
  port: 465,
  secure: true,
  auth: {
    user: 'paulezaga@gmail.com',
    pass: 'brjo vtjw ebfy mlav'
  }
});

var mailOptions = {
  from: 'paulezaga@gmail.com',
  to: 'poj_ezaga@yahoo.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

function SendMail(heading, message){
  transporter.sendMail({...mailOptions, text: message, subject: heading}, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

const flw = new Flutterwave('FLWPUBK_TEST-faf1fae2cceecc5f5a803645155e9000-X', 
'FLWSECK_TEST-3e83d5c4eec721c8217e2cbf1bceb23d-X');

router.post('/verify', async (req, res) => { 
  const reqObj = req.body.item
  const refId = `akhlm-pstmnpyt-r02ens007_PMCKDU_${parseInt(reqObj.index) + Math.random()*9 }`
  
 
   const payload = {
    "account_bank": "044", //This is the recipient bank code. Get list here :https://developer.flutterwave.com/v3.0/reference#get-all-banks
    "account_number": reqObj.accountNumber,
    "amount": "500",
    "narration": "Akhlm Pstmn Trnsfr xx007",
    "currency": "NGN",
    "reference": refId, //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
    "callback_url": "https://www.flutterwave.com/ng/",
    "debit_currency": "NGN"
  }

    const response = await flw.Transfer.initiate(payload)    
    res.json({ data:  response });
    
// const response = await flw.Misc.verify_Account({    
 //     "account_number": req.body.account_number,
  //    "account_bank": req.body.account_bank
  //})
  //res.json(response);

 // const response = await flw.Bank.country({  "country":"GH" })
//  console.log(response);
  /*const result =  await fetch(`https://api.flutterwave.com/v3/accounts/resolve`, {
            method: "POST",  
            headers: { 
              "Content-Type": "application/json",
              "Authorization": "Bearer FLWSECK_TEST-3e83d5c4eec721c8217e2cbf1bceb23d-X"          
            },
            body: JSON.stringify({
              account_number: req.body.account_number,
              account_bank: req.body.account_bank
            }), 
      });

    result.json().then(d => console.log(d))

    return await result;*/
  /*console.log("gggg")
  try {
    const accDetails = await flw.Misc.verify_Account({
      account_number: req.body.account_number,
      account_bank: req.body.account_bank
    })
    const result = await accDetails;
    console.log(result)
    return res.json({
      result
    });
    
  } catch (e) {
    return res.status(400).json({
      error: e.message,
    });
  }*/
 

});

router.post("/flw-webhook", async (req, res) => {
  // If you specified a secret hash, check for the signature
  const secretHash = 'breeze-remit';
  const signature = req.headers["verif-hash"];
  if (!signature || (signature !== secretHash)) {
      // This request isn't from Flutterwave; discard
      res.status(401).end();
  }
  const payload = req.body;
  // It's a good idea to log all received events.
  
  SendMail('Naira Webhook Endpoint', JSON.stringify(payload))
  // Do something (that doesn't take too long) with the payload
  res.status(200).end()
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
