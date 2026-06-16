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
const BOT_NAME    = process.env.BOT_NAME || 'Sally';

const SALLY_SYSTEM_PROMPT = `You are Sally, the private secretary and personal assistant for Seif Alsoub (saifssss@gmail.com).

Your job: Handle personal scheduling, bookings, appointments, and private coordination tasks.

Capabilities:
- Book appointments (barbershop, restaurants, meetings) using the browser tool
- Manage calendar entries
- Follow up on personal tasks
- Coordinate private matters discreetly

Style: Efficient, direct, no fluff. Always report what you did and the outcome.
When booking: confirm the date, time, service, and any reference number.
When blocked (login required, slot unavailable): say exactly what happened and what Seif needs to do.
Keep WhatsApp replies short and scannable.`;

const SYSTEM_PROMPT  = process.env.SYSTEM_PROMPT || SALLY_SYSTEM_PROMPT;
const CHAT_MODEL     = process.env.CLAUDE_MODEL   || 'claude-haiku-4-5-20251001';
const BOOKING_MODEL  = process.env.BOOKING_MODEL  || 'claude-opus-4-8';
const MAX_HISTORY    = 10;

const COMPOSIO_API     = 'https://backend.composio.dev/api/v2';
const BOOKING_PATTERN  = /\b(book|barber|haircut|appointment|corner barber|rukan|grooming|salon|schedule|dentist|doctor|reservation|reserve)\b/i;

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
         Bot is live — message your WhatsApp number to chat with ${BOT_NAME}
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
  logger.info(`${BOT_NAME} web UI → http://0.0.0.0:${PORT}`);
});

// ─── General Claude chat ──────────────────────────────────────────────────────

async function getClaudeReply(jid, userText) {
  if (!conversations.has(jid)) conversations.set(jid, []);
  const history = conversations.get(jid);

  history.push({ role: 'user', content: userText });
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);

  const resp = await anthropic.messages.create({
    model: CHAT_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: history,
  });

  const reply = resp.content[0].text;
  history.push({ role: 'assistant', content: reply });
  return reply;
}

// ─── Sally booking agent ──────────────────────────────────────────────────────

async function runSallyBookingAgent(sock, jid, userText) {
  await sock.sendMessage(jid, { text: '🗂️ On it — booking now. I\'ll update you when it\'s done.' });

  const composioKey = process.env.COMPOSIO_API_KEY;
  if (!composioKey) {
    await sock.sendMessage(jid, { text: '⚠️ COMPOSIO_API_KEY not configured. Add it and restart.' });
    return;
  }

  let tools = [];
  try {
    const res = await fetch(`${COMPOSIO_API}/actions?apps=BROWSER_TOOL&limit=50`, {
      headers: { 'x-api-key': composioKey },
    });
    const data = await res.json();
    tools = (data.items || []).map(action => ({
      name: action.name,
      description: action.description,
      input_schema: action.parameters,
    }));
  } catch (e) {
    await sock.sendMessage(jid, { text: `⚠️ Could not load browser tools: ${e.message}` });
    return;
  }

  const messages = [
    {
      role: 'user',
      content: `${SALLY_SYSTEM_PROMPT}

Request: "${userText}"

Complete this booking using the browser tool. Report exactly what happened (booked, needs login, slot unavailable, etc.).`,
    },
  ];

  let iterations = 0;
  while (iterations < 15) {
    iterations++;

    const response = await anthropic.messages.create({
      model: BOOKING_MODEL,
      max_tokens: 4096,
      tools,
      messages,
    });

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find(b => b.type === 'text');
      const result = textBlock?.text ?? 'Done.';
      await sock.sendMessage(jid, { text: `✅ Sally: ${result}` });
      return;
    }

    if (response.stop_reason !== 'tool_use') break;

    const toolResults = [];
    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;
      try {
        const res = await fetch(`${COMPOSIO_API}/actions/${block.name}/execute`, {
          method: 'POST',
          headers: { 'x-api-key': composioKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityId: 'default', input: block.input }),
        });
        const result = await res.json();
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) });
      } catch (e) {
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: `Error: ${e.message}`, is_error: true });
      }
    }
    messages.push({ role: 'user', content: toolResults });
  }

  await sock.sendMessage(jid, { text: '⚠️ Sally: Hit the iteration limit — manual follow-up needed.' });
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

      await sock.readMessages([msg.key]);

      if (BOOKING_PATTERN.test(text)) {
        logger.info({ jid }, 'Routing to Sally booking agent');
        runSallyBookingAgent(sock, jid, text).catch(err => {
          logger.error({ err: err.message, jid }, 'Sally booking fatal error');
          sock.sendMessage(jid, { text: '❌ Sally: Booking flow crashed — please try again.' }).catch(() => {});
        });
      } else {
        try {
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
    }
  });
}

startBot().catch(err => {
  logger.error(err, 'Fatal startup error');
  process.exit(1);
});
