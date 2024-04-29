const express = require('express');
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


app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(bodyParser.json());


// app.use('/products', productRoutes);
// app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);



app.get('/mail', (req, res) => {
  res.send('<h2>Hello world </h2>');
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


app.get('/', (req, res) => {
 
  res.send('<h2>Hello world </h2>');
});
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_87df9489a44c5728c2bc4fdefc576f2eec22ae9fcfade1601778dc7e5e3e1352";

app.post('/webhook', async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = await stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
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
    SendMail('Payment Succeeded', event.type)
    // Then define and call a function to handle the event payment_intent.succeeded
    break;
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
