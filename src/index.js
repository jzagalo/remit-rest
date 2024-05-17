const express = require('express');
const Flutterwave = require('flutterwave-node-v3');
// const productRoutes = require('./router/productRoutes');
// const orderRoutes = require('./router/orderRoutes');
const paymentRoutes = require('./router/paymentRoutes');
const bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
const stripe = require('stripe')(
  'sk_test_51OlqZyH3cCklqfTbwcIVJts95VXuoEUL8e5NT1ej8Pw97kWpIibqLlayIL7DCpCgHww3NDBNGgfWRLoeIpL3uNjh00J95sj1fI'
);
const app = express();
const PORT = 4242;
const flw = new Flutterwave('FLWPUBK_TEST-faf1fae2cceecc5f5a803645155e9000-X', 
'FLWSECK_TEST-3e83d5c4eec721c8217e2cbf1bceb23d-X');

app.use('/api/subs/stripe-webhook', bodyParser.raw({type: "*/*"}))
app.use(
  bodyParser.json({
      verify: function(req, res, buf) {
          req.rawBody = buf;
      }
  })
);
app.use(express.json());


// app.use('/products', productRoutes);
// app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);



app.get('/mail', (req, res) => {
  res.send('<h2>Hello world </h2>');
});


app.post("/create-setup-intent", async function (request, reply) {

  // Use an existing Customer ID if this is a returning customer.
   const customer = await stripe.customers.create();

   const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id},
     {apiVersion: '2022-08-01'}
   );

   const setupIntent = await stripe.setupIntents.create({
     customer,
     metadata: {
      userId: 123, // here you can set the metadata
     }
   });

   return {
     setupIntent: setupIntent.client_secret,
     ephemeralKey: ephemeralKey.secret,
     customer: customer.id
   }
 });
 /**
  * Post method to accept parameters
  * @params amount, currency, gateway
  * @return PaymentIntent object
  */
 app.post("/init-payment",async function (request, reply) {
 
 const paymentIntent = await stripe.paymentIntents.create({
   amount: request?.body?.amount,
   currency: request?.body?.currency,
   metadata: { user: 'dodo', frame: 'Bobo' },
   payment_method_types: [request?.body?.gateway],
 });
   // The Handlebars template will use the parameter values to update the page with the chosen color
   return paymentIntent;
 });

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


app.get('/mock', async (req, res) => {
  const transfer = await flw.Transfer.initiate({
    account_bank: "044",
    account_number: "0690000031",
    amount: 200,
    currency: "NGN",
    callback_url: 'http://my-callback-url'
  })

  const final = await transfer;
 
  res.json({ final });
});
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_38k8QWMV5VpjBfcxTx8BjZeHAHAU5g2J";

// const endpointSecret = "whsec_87df9489a44c5728c2bc4fdefc576f2eec22ae9fcfade1601778dc7e5e3e1352";


app.post('/webhook',express.raw({ type: 'application/json' }) , async (request, response) => {
  const sig = request.headers['stripe-signature'];
  const rawBody = request.rawBody;

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  
  // Handle the event
 // Handle the event
 switch (event.type) {
  case 'payment_intent.amount_capturable_updated':
    const paymentIntentAmountCapturableUpdated = event.data.object;
    SendMail('Payment Captured', event.type)
    // Then define and call a function to handle the event payment_intent.amount_capturable_updated
    break;
  case 'payment_intent.canceled':
    const paymentIntentCanceled = event.data.object;
    SendMail('Payment Canceled', event.type)
    // Then define and call a function to handle the event payment_intent.canceled
    break;
  case 'payment_intent.created':
    const paymentIntentCreated = event.data.object;
    SendMail('Payment Created', event.type)
    // Then define and call a function to handle the event payment_intent.created
    break;
  case 'payment_intent.partially_funded':
    const paymentIntentPartiallyFunded = event.data.object;
    SendMail('Payment Partially Funded', event.type)
    // Then define and call a function to handle the event payment_intent.partially_funded
    break;
  case 'payment_intent.payment_failed':
    const paymentIntentPaymentFailed = event.data.object;
    SendMail('Payment Failed', event.type)
    // Then define and call a function to handle the event payment_intent.payment_failed
    break;
  case 'payment_intent.processing':
    const paymentIntentProcessing = event.data.object;
    SendMail('Payment Processing', event.type)
    // Then define and call a function to handle the event payment_intent.processing
    break;
  case 'payment_intent.requires_action':
    const paymentIntentRequiresAction = event.data.object;
    SendMail('Payment Requires Action', event.type)
    // Then define and call a function to handle the event payment_intent.requires_action
    break;
  case 'payment_intent.succeeded':
    const paymentIntentSucceeded = event.data.object;
    SendMail('Payment Succeeded', JSON.stringify(paymentIntentSucceeded))
    await flw.Transfer.initiate({
      account_bank: "044",
      account_number: "0690000031",
      amount: 200,
      currency: "NGN",
      callback_url: 'http://my-callback-url'
    })
    // Then define and call a function to handle the event payment_intent.succeeded
    break;
  case 'refund.created':
    const refundCreated = event.data.object;
    // Then define and call a function to handle the event refund.created
    break;
  case 'refund.updated':
    const refundUpdated = event.data.object;
  // ... handle other event types
  default:
    console.log(`Unhandled event type ${event.type}`);
    SendMail('Payment Unhandled', event.type)
}

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.listen(PORT, () => {
  console.log('API is listening on port', PORT);
});
