/**
 * One-time OAuth handshake: prints the YT_OAUTH_REFRESH_TOKEN needed by
 * functions/src/youtubeSync.ts (Drive read + YouTube upload).
 *
 * Setup:
 *   1. Google Cloud console -> APIs & Services:
 *      enable "Google Drive API" + "YouTube Data API v3"
 *   2. OAuth consent screen (External is fine, add yourself as a Test user)
 *   3. Credentials -> OAuth client ID -> Web application
 *      Authorized redirect URI: http://localhost:53682/oauth/callback
 *
 * Run:
 *   YT_OAUTH_CLIENT_ID=... YT_OAUTH_CLIENT_SECRET=... node scripts/youtube-auth.mjs
 *   (opens your browser; paste the printed token into functions/.env + secrets)
 */
import http from 'node:http';
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const CLIENT_ID = process.env.YT_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.YT_OAUTH_CLIENT_SECRET;
const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}/oauth/callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set YT_OAUTH_CLIENT_ID and YT_OAUTH_CLIENT_SECRET first.');
  process.exit(1);
}

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent select_account',
    scope: SCOPES,
  }).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', REDIRECT);
  if (url.pathname !== '/oauth/callback') {
    res.writeHead(404).end();
    return;
  }
  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400).end('No code — check the consent screen / test user setup.');
    console.error('Callback without code:', url.searchParams.get('error_description'));
    return;
  }
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT,
        grant_type: 'authorization_code',
      }),
    });
    const json = await tokenRes.json();
    if (!json.refresh_token) {
      res.writeHead(500).end('No refresh_token returned — revoke prior grants at https://myaccount.google.com/permissions and retry.');
      console.error('Token response:', json);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' }).end(
      '<h2>Done — you can close this tab.</h2><p>The refresh token was printed in your terminal.</p>'
    );
    console.log('\nYT_OAUTH_REFRESH_TOKEN=' + json.refresh_token);
    console.log('\nNext: firebase functions:secrets:set YT_OAUTH_REFRESH_TOKEN (and the other YT_* keys)');
  } catch (e) {
    res.writeHead(500).end('Exchange failed — see terminal.');
    console.error(e);
  } finally {
    setTimeout(() => process.exit(0), 1000);
  }
});

server.listen(PORT, () => {
  // Save the exact URL. Do NOT open it through cmd/PowerShell: '&' in the query
  // string can be split, which drops parameters (invalid_request response_type).
  try {
    writeFileSync('.yt-auth-url.txt', authUrl, 'utf8');
  } catch {
    // ignore — the URL is still printed below
  }
  // Put the exact URL on the clipboard — no shell parsing, no truncation.
  try {
    if (process.platform === 'win32') execSync('clip', { input: authUrl });
  } catch {
    // clipboard unavailable — the URL is printed below
  }
  console.log(
    '\nThe authorization URL is on your clipboard and saved to .yt-auth-url.txt\n\n' +
      '1. Click the browser address bar (Ctrl+L)\n' +
      '2. Paste (Ctrl+V) and press Enter\n' +
      '3. Choose the T4C account: triple4curriculum@gmail.com\n\n' +
      'URL:\n' +
      authUrl +
      '\n',
  );
});
