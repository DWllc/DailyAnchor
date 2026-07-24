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

//
