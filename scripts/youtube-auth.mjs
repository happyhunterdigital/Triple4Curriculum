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
    prompt: 'consent',
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
  console.log('Open this URL in your browser (also auto-attempted):\n\n' + authUrl + '\n');
  try {
    import('node:child_process').then(({ exec }) => {
      const cmd = process.platform === 'win32' ? `start "" "${authUrl}"` : `xdg-open "${authUrl}"`;
      exec(cmd);
    });
  } catch {
    // print-only fallback
  }
});
