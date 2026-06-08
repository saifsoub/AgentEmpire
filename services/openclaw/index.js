import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import QRCode from 'qrcode';
import pino from 'pino';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT        = parseInt(process.env.PORT || '4096', 10);
const SESSION_DIR = process.env.SESSION_DIR || join(__dirname, 'data', 'session');
const BOT_NAME    = process.env.BOT_NAME || 'OpenClaw';
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT
  || `You are ${BOT_NAME}, a sharp and helpful AI assistant. Be concise — WhatsApp readers prefer short replies. Answer accurately and directly.`;
const CLAUDE_MODEL  = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
const MAX_HISTORY   = 10;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const logger    = pino({ level: process.env.LOG_LEVEL || 'info' });

// Per-JID conversation histories (in-memory, clears on restart)
const conversations = new Map();

let currentQR        = null;
let connectionStatus = 'initializing';

// ─── Web UI ──────────────────────────────────────────────────────────────────

const app = express();

app.get('/', (_req, res) => {
  const isConnected = connectionStatus === 'connected';
  const isWaiting   = connectionStatus === 'waiting_qr';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="refresh" content="5">
  <title>${BOT_NAME} — WhatsApp AI</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0f172a;color:#94a3b8;font-family:'Courier New',monospace;
         display:flex;flex-direction:column;align-items:center;justify-content:center;
         min-height:100vh;gap:20px;padding:24px}
    h1{color:#22d3ee;font-size:1.8rem;letter-spacing:3px}
    .badge{padding:6px 20px;border-radius:20px;font-size:.85rem;font-weight:700}
    .ok{background:#065f46;color:#6ee7b7}
    .scan{background:#1e1b4b;color:#a5b4fc;animation:pulse 1.8s ease-in-out infinite}
    .wait{background:#1e293b;color:#64748b}
    .retry{background:#78350f;color:#fcd34d}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .qr-wrap{background:#fff;padding:14px;border-radius:12px;
             box-shadow:0 0 48px rgba(34,211,238,.2)}
    .hint{font-size:.78rem;color:#475569;text-align:center;max-width:280px}
    .ts{font-size:.65rem;color:#1e293b}
  </style>
</head>
<body>
  <h1>🔐 ${BOT_NAME}</h1>

  <span class="badge ${isConnected ? 'ok' : isWaiting ? 'scan' : connectionStatus === 'reconnecting' ? 'retry' : 'wait'}">
    ${isConnected   ? '✅  Connected'
      : isWaiting   ? '📱  Scan QR with WhatsApp'
      : connectionStatus === 'reconnecting' ? '🔄  Reconnecting…'
      : connectionStatus === 'logged_out'   ? '🚫  Logged out — restart to re-auth'
      : '⏳  ' + connectionStatus}
  </span>

  ${isConnected
    ? `<p style="color:#6ee7b7;font-size:.9rem;text-align:center">
         Bot is live — message your WhatsApp number to chat with Claude
       </p>`
    : currentQR
      ? `<div class="qr-wrap">
           <img src="/qr.png?t=${Date.now()}" width="256" height="256" alt="QR Code">
         </div>
         <p class="hint">Open WhatsApp → ⋮ → Linked Devices → Link a Device, then scan</p>`
      : '<p style="color:#334155;font-size:.85rem">Waiting for QR code… refresh in a few seconds</p>'
  }

  <p class="ts">Auto-refreshes every 5 s · ${new Date().toISOString().slice(11, 19)} UTC</p>
</body>
</html>`);
});

app.get('/qr.png', async (_req, res) => {
  if (!currentQR) { res.status(404).end(); return; }
  try {
    const buf = await QRCode.toBuffer(currentQR, {
      type: 'png', width: 300, margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    res.send(buf);
  } catch {
    res.status(500).end();
  }
});

app.get('/status', (_req, res) => {
  res.json({ status: connectionStatus, hasQR: !!currentQR, bot: BOT_NAME });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`OpenClaw web UI → http://0.0.0.0:${PORT}`);
});

// ─── Claude ──────────────────────────────────────────────────────────────────

async function getClaudeReply(jid, userText) {
  if (!conversations.has(jid)) conversations.set(jid, []);
  const history = conversations.get(jid);

  history.push({ role: 'user', content: userText });
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);

  const resp = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: history,
  });

  const reply = resp.content[0].text;
  history.push({ role: 'assistant', content: reply });
  return reply;
}

// ─── WhatsApp bot ─────────────────────────────────────────────────────────────

async function startBot() {
  if (!existsSync(SESSION_DIR)) mkdirSync(SESSION_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

  let version;
  try {
    ({ version } = await fetchLatestBaileysVersion());
  } catch {
    version = [2, 3000, 1023561547]; // known-good fallback
  }
  logger.info({ version: version.join('.') }, 'Baileys version');

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      currentQR = qr;
      connectionStatus = 'waiting_qr';
      logger.info(`QR ready — open http://0.0.0.0:${PORT} and scan`);
    }

    if (connection === 'close') {
      currentQR = null;
      // Baileys wraps errors in @hapi/boom; statusCode lives at .output.statusCode
      const code = lastDisconnect?.error?.output?.statusCode ?? 0;
      const reconnect = code !== DisconnectReason.loggedOut;
      connectionStatus = reconnect ? 'reconnecting' : 'logged_out';
      if (reconnect) {
        logger.warn({ code }, 'Disconnected — reconnecting in 3 s');
        setTimeout(startBot, 3000);
      } else {
        logger.error('Logged out. Delete the session directory and restart to re-scan QR.');
      }
    }

    if (connection === 'open') {
      currentQR = null;
      connectionStatus = 'connected';
      logger.info('WhatsApp connected!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message) continue;

      const jid  = msg.key.remoteJid;
      const text = (
        msg.message.conversation
        ?? msg.message.extendedTextMessage?.text
        ?? msg.message.imageMessage?.caption
        ?? ''
      ).trim();

      if (!text) continue;

      logger.info({ jid, preview: text.slice(0, 60) }, 'Message in');

      try {
        await sock.readMessages([msg.key]);
        const reply = await getClaudeReply(jid, text);
        await sock.sendMessage(jid, { text: reply });
        logger.info({ jid }, 'Reply sent');
      } catch (err) {
        logger.error({ err: err.message, jid }, 'Handler error');
        await sock.sendMessage(jid, {
          text: 'Something went wrong on my end — please try again in a moment.',
        }).catch(() => {});
      }
    }
  });
}

startBot().catch(err => {
  logger.error(err, 'Fatal startup error');
  process.exit(1);
});
