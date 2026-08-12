// api/stripe-webhook.js
//
// This is a Vercel Serverless Function. Any file inside an `api/` folder
// at the root of a Vite project automatically becomes a live endpoint —
// this one will live at: https://trydailyanchor.com/api/stripe-webhook
//
// What it does: Stripe calls this URL every time something happens with
// a customer's subscription (they subscribe, their card is charged, they
// cancel, a payment fails, etc). This code checks the message really is
// from Stripe, then updates the matching row in your Supabase
// "subscriptions" table so your app always knows who has an active plan.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role, NOT the public anon key — this runs on the server
);

// Vercel needs the raw request body (not JSON-parsed) to verify the
// Stripe signature, so we turn off the default body parser.
export const config = {
  api: { bodyParser: false },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const rawBody = await buffer(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    // This line proves the request really came from Stripe and wasn't
    // faked by someone else hitting your endpoint.
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature check failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // Fires once, right after someone finishes checkout successfully.
      case 'checkout.session.completed': {
        const session = event.data.object;
        await supabase.from('subscriptions').upsert({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: 'active',
          email: session.customer_details ? session.customer_details.email : session.customer_email,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_customer_id' });
        break;
      }

      // Fires every renewal, and whenever the plan/status changes
      // (e.g. trial -> active, active -> past_due).
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        await supabase.from('subscriptions').update({
          status: sub.status, // 'trialing' | 'active' | 'past_due' | 'canceled' etc.
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id);
        break;
      }

      // Fires when a subscription is fully canceled (not just scheduled to cancel).
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await supabase.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id);
        break;
      }

      // Fires if a renewal payment fails (expired card, insufficient funds, etc).
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await supabase.from('subscriptions').update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('stripe_customer_id', invoice.customer);
        break;
      }

      default:
        // Stripe sends many event types — it's safe to ignore ones you don't handle.
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error handling webhook event:', err);
    // Returning a 500 tells Stripe to retry this event later.
    return res.status(500).send('Internal error');
  }
}
