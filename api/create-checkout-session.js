// api/create-checkout-session.js
//
// This is a second Vercel Serverless Function, living alongside your
// stripe-webhook.js file. It lives at:
// https://trydailyanchor.com/api/create-checkout-session
//
// What it does: when someone taps "Subscribe" in your app and enters
// their email, the app calls this endpoint. This code asks Stripe to
// set up a checkout page for a $4.99/month subscription with a 7-day
// free trial, tied to that email address, and sends back a URL. The
// app then sends the customer to that URL to enter their card details
// on Stripe's own secure page.

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PRICE_ID = process.env.STRIPE_PRICE_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // The app sends { "email": "someone@example.com" } in the request body.
  let body = '';
  await new Promise((resolve) => {
    req.on('data', (chunk) => (body += chunk));
    req.on('end', resolve);
  });

  let email;
  try {
    email = JSON.parse(body).email;
  } catch {
    email = undefined;
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
      },
      // After payment, Stripe sends the customer back to your app.
      success_url: `${req.headers.origin}/?checkout=success`,
      cancel_url: `${req.headers.origin}/?checkout=canceled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ error: 'Could not start checkout' });
  }
}
