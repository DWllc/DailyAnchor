# Daily Anchor - Website Version

This is Daily Anchor, packaged up as a real website project instead of a
Claude preview. It saves everyone's data in their own browser (no account,
no server, no login) - the same way it worked before, just running for real.

## The fastest way to get this live (no coding required)

You'll use **Vercel** - it's free to start, and does the technical parts
(building the code, hosting it, giving you a web address) for you.

1. Go to **vercel.com** and sign up (you can sign up with a GitHub account
   or just an email address).
2. You'll need this project on **GitHub** first, since that's how Vercel
   pulls in your code:
   - Go to **github.com**, sign up if you don't have an account.
   - Click the **+** in the top right → **New repository**. Name it
     something like `daily-anchor`. Leave everything else default, click
     **Create repository**.
   - On the next page, GitHub shows you a few options for adding code.
     The easiest is the **"uploading an existing file"** link - drag this
     entire folder's contents in and commit them.
3. Back in Vercel, click **Add New → Project**, and pick the
   `daily-anchor` repository you just created.
4. Vercel will auto-detect this is a Vite project. Leave the default
   settings and click **Deploy**.
5. Wait about a minute. Vercel gives you a real, working web address like
   `daily-anchor-yourname.vercel.app` - that's it, it's live.

From then on, any time you update the code and push it to GitHub, Vercel
automatically rebuilds and republishes the site for you.

## Adding your own domain name (optional)

If you buy a domain (e.g. from Namecheap, around $10-15/year), go to your
project's **Settings → Domains** in Vercel and add it there. Vercel gives
you a couple of DNS records to add at Namecheap, and walks you through it.

## If you want to test it on your own computer first

You'll need [Node.js](https://nodejs.org) installed (any recent version).
Then, in this folder:

```
npm install
npm run dev
```

This starts a local test version at `http://localhost:5173` that you can
open in your browser to check everything works before deploying.

## What's actually in this folder

- `src/App.jsx` - the entire app (tasks, onboarding, history, everything)
- `src/storage-polyfill.js` - makes the app's memory work using your
  browser's built-in storage, instead of the Claude-only version it used
  before
- `src/main.jsx` - the small file that starts the app
- `index.html` - the actual webpage the app gets loaded into
- `package.json` - the list of external code libraries the app needs
  (Vercel/npm installs these automatically - you don't need to touch this)

## Important limitation to know about

Because everyone's data lives in their own browser only, a few things
follow from that:
- If someone clears their browser data, or switches browsers/devices,
  their Daily Anchor history starts over.
- There's no way for you to see or back up anyone's data from the outside
  - which is good for privacy, but means "I lost my phone" also means
  "I lost my history," with no way to recover it.
- The in-app **Export my data** button (Settings → Your Data) is the only
  backup mechanism right now - it's worth mentioning to users that they
  can use it before switching devices.

If you outgrow this later (e.g. you want people's data to follow them
across devices, or you want to see aggregate usage), that's the point to
add real user accounts and a database - a bigger step up from here.
