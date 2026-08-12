// api/check-subscription-status.js
//
// A third Vercel Serverless Function. It lives at:
// https://trydailyanchor.com/api/check-subscription-status
//
// What it does: given an email address, it looks in your Supabase
// "subscriptions" table and reports back whether that email has an
// active or trialing subscription. The app calls this when it loads
// (if it has a saved email) and right after someone finishes checkout,
// so it knows whether to unlock paid features.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('email', email)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const activeStatuses = ['active', 'trialing'];
    const isSubscribed = !!data && activeStatuses.includes(data.status);

    return res.status(200).json({
      subscribed: isSubscribed,
      status: data ? data.status : null,
    });
  } catch (err) {
    console.error('Error checking subscription status:', err);
    return res.status(500).json({ error: 'Could not check status' });
  }
}
