import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { URL } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==================== ACCESS CODES ====================
const DEV_CODE_HASH = crypto.createHash('sha256').update(
  (process.env.XENA_DEV_CODE || 'PNG6G').trim().toUpperCase()
).digest('hex');
const ADMIN_CODE_HASH = crypto.createHash('sha256').update(
  (process.env.XENA_ADMIN_CODE || 'V46D9').trim().toUpperCase()
).digest('hex');

// ==================== UTILITIES ====================
function b64e(v: string): string {
  return Buffer.from(String(v || ''), 'utf8').toString('base64')
    .replace(/[+/=]/g, c => c === '+' ? '-' : c === '/' ? '_' : '');
}
function b64d(v: string): string {
  try {
    let t = String(v || '').replace(/-/g, '+').replace(/_/g, '/');
    while (t.length % 4) t += '=';
    return Buffer.from(t, 'base64').toString('utf8');
  } catch { return v; }
}

const UAS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
];
function randUA(): string { return UAS[Math.floor(Math.random() * UAS.length)]; }

function stripSecurityHeaders(headers: Record<string, any>): void {
  const bad = ['x-frame-options', 'content-security-policy', 'x-content-type-options',
    'strict-transport-security', 'x-xss-protection'];
  bad.forEach(h => {
    const key = Object.keys(headers).find(k => k.toLowerCase() === h);
    if (key) delete headers[key];
  });
}

// ==================== HTML REWRITER (REFINED) ====================
function rewriteHTML(html: string, baseUrl: string, prefix: string): string {
  const $ = cheerio.load(html);
  const rw = (val: string) => {
    if (!val || val.startsWith('data:') || val.startsWith('javascript:') || val.startsWith('#')) return val;
    try { return prefix + b64e(new URL(val, baseUrl).href); } catch { return val; }
  };
  $('[href]').each((_, e) => { const v = $(e).attr('href'); if (v && !v.startsWith('#') && !v.startsWith('javascript:')) $(e).attr('href', rw(v)); });
  $('[src]').each((_, e) => { const v = $(e).attr('src'); if (v && !v.startsWith('data:')) $(e).attr('src', rw(v)); });
  $('[action]').each((_, e) => { const v = $(e).attr('action'); if (v) $(e).attr('action', rw(v)); });
  $('[data-src]').each((_, e) => { const v = $(e).attr('data-src'); if (v) $(e).attr('data-src', rw(v)); });
  $('[data-href]').each((_, e) => { const v = $(e).attr('data-href'); if (v) $(e).attr('data-href', rw(v)); });
  $('[poster]').each((_, e) => { const v = $(e).attr('poster'); if (v) $(e).attr('poster', rw(v)); });
  $('[style]').each((_, e) => {
    const s = $(e).attr('style');
    if (s?.includes('url(')) $(e).attr('style', s.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (_m: string, u: string) => {
      try { return `url(${prefix + b64e(new URL(u, baseUrl).href)})`; } catch { return _m; }
    }));
  });
  $('style').each((_, e) => {
    const t = $(e).html() || '';
    if (t.includes('url(')) $(e).html(t.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (_m: string, u: string) => {
      try { return `url(${prefix + b64e(new URL(u, baseUrl).href)})`; } catch { return _m; }
    }));
  });
  $('script').each((_, e) => {
    const t = $(e).html() || '';
    if (t.includes('top.location') || (t.includes('self') && t.includes('top') && t.includes('parent')) || t.includes('breakFrame'))
      $(e).remove();
  });
  return $.html();
}

// ==================== PROXY FETCH CORE (REFINED) ====================
async function proxyFetch(target: string, req: express.Request, res: express.Response, prefix: string): Promise<void> {
  try {
    const headers: Record<string, string> = {
      'User-Agent': randUA(),
      'Accept': (req.headers['accept'] as string) || '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': target,
    };
    if (req.headers['cookie']) headers['Cookie'] = req.headers['cookie'] as string;
    if (req.headers['range']) headers['Range'] = req.headers['range'] as string;

    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 30000);
    const resp = await fetch(target, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined :
        req.body ? (typeof req.body === 'object' ? JSON.stringify(req.body) : String(req.body)) : undefined,
      redirect: 'follow',
      signal: ac.signal
    });
    clearTimeout(to);

    const ct = resp.headers.get('content-type') || '';
    stripSecurityHeaders(resp.headers as any);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (ct.includes('text/html')) {
      const html = await resp.text();
      const rw = rewriteHTML(html, target, prefix);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(resp.status).send(rw);
    } else if (ct.includes('text') || ct.includes('json') || ct.includes('javascript') || ct.includes('xml')) {
      res.setHeader('Content-Type', ct);
      res.status(resp.status).send(await resp.text());
    } else if (resp.body && (ct.includes('video') || ct.includes('audio') || ct.includes('image') || ct.includes('octet-stream'))) {
      if (resp.headers.get('content-range')) res.setHeader('Content-Range', resp.headers.get('content-range')!);
      if (resp.headers.get('content-length')) res.setHeader('Content-Length', resp.headers.get('content-length')!);
      res.setHeader('Content-Type', ct);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      if (resp.status === 206) res.status(206);
      const reader = resp.body.getReader();
      const pump = async () => {
        while (true) { const { done, value } = await reader.read(); if (done) break; res.write(Buffer.from(value)); }
        res.end();
      };
      pump().catch(() => res.end());
      return;
    } else {
      res.setHeader('Content-Type', ct || 'application/octet-stream');
      res.status(resp.status).send(Buffer.from(await resp.arrayBuffer()));
    }
  } catch (err: any) {
    if (!res.headersSent) res.status(502).send(`Proxy error: ${err.message}`);
    else res.end();
  }
}

// ==================== AUTH ====================
app.post('/api/auth/validate-code', (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') return res.json({ valid: false, role: null });
  const h = crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
  if (h === DEV_CODE_HASH) return res.json({ valid: true, role: 'developer' });
  if (h === ADMIN_CODE_HASH) return res.json({ valid: true, role: 'admin' });
  return res.json({ valid: false, role: null });
});

function authMw(req: express.Request, res: express.Response, next: express.NextFunction) {
  const code = req.headers['x-access-code'];
  if (!code || typeof code !== 'string') return res.status(401).json({ error: 'Access code required' });
  const h = crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
  if (h === DEV_CODE_HASH) { (req as any).userRole = 'developer'; return next(); }
  if (h === ADMIN_CODE_HASH) { (req as any).userRole = 'admin'; return next(); }
  return res.status(403).json({ error: 'Invalid' });
}

function adminMw(req: express.Request, res: express.Response, next: express.NextFunction) {
  if ((req as any).userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// ==================== PROXY 1: SW - SERVICE WORKER ENGINE (REFINED) ====================
app.get('/xena-sw.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.send(`
    const C='xena-cache-v1';
    self.addEventListener('install',e=>self.skipWaiting());
    self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
    self.addEventListener('fetch',e=>{
      const u=new URL(e.request.url);
      if(u.pathname=='/'||u.pathname.startsWith('/assets/')||u.pathname=='/xena-sw.js'||u.pathname.match(/\\.(js|css|png|jpg|svg|ico|woff2?|ttf)$/))return;
      if(u.pathname.startsWith('/sw/')){
        const enc=u.pathname.replace('/sw/','');
        let t;try{t=atob(enc.replace(/-/g,'+').replace(/_/g,'/'))}catch{return}
        e.respondWith((async()=>{
          const r=await fetch(t,{headers:{'User-Agent':navigator.userAgent}});
          return new Response(await r.text(),{headers:{'Content-Type':r.headers.get('Content-Type')||'text/html'}})
        })());
      }
    });
  `);
});
app.all('/sw/*', async (req, res) => {
  const enc = req.path.replace('/sw/', '').split('?')[0];
  if (!enc) return res.status(400).send('Missing URL');
  try { const t = b64d(decodeURIComponent(enc)); new URL(t); return proxyFetch(t, req, res, '/sw/'); }
  catch { return res.status(400).send('Invalid'); }
});

// ==================== PROXY 2: RV - REVERSE PROXY (REFINED) (DEFAULT) ====================
app.all('/rv/*', async (req, res) => {
  const enc = req.path.replace('/rv/', '').split('?')[0];
  if (!enc) return res.status(400).send('Missing URL');
  try { const t = b64d(decodeURIComponent(enc)); new URL(t); return proxyFetch(t, req, res, '/rv/'); }
  catch { return res.status(400).send('Invalid'); }
});

// ==================== PROXY 3: BSS - BINARY STREAM SANDBOX (REFINED) ====================
app.all('/bss/*', async (req, res) => {
  const enc = req.path.replace('/bss/', '').split('?')[0];
  if (!enc) return res.status(400).send('Missing URL');
  let target: string;
  try { target = b64d(decodeURIComponent(enc)); new URL(target); } catch { return res.status(400).send('Invalid'); }
  try {
    const headers: Record<string, string> = { 'User-Agent': randUA(), 'Accept': '*/*', 'Range': (req.headers['range'] as string) || '' };
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 60000);
    const resp = await fetch(target, { method: req.method, headers, redirect: 'follow', signal: ac.signal });
    clearTimeout(to);
    stripSecurityHeaders(resp.headers as any);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', resp.headers.get('content-type') || 'application/octet-stream');
    if (resp.headers.get('content-range')) res.setHeader('Content-Range', resp.headers.get('content-range')!);
    if (resp.headers.get('content-length')) res.setHeader('Content-Length', resp.headers.get('content-length')!);
    if (resp.status === 206) res.status(206);
    if (resp.body) {
      const reader = resp.body.getReader();
      const pump = async () => { while (true) { const { done, value } = await reader.read(); if (done) break; res.write(Buffer.from(value)); } res.end(); };
      pump().catch(() => res.end());
    } else { res.status(resp.status).send(Buffer.from(await resp.arrayBuffer())); }
  } catch (err: any) { if (!res.headersSent) res.status(502).send('BSS error: ' + err.message); else res.end(); }
});

// ==================== PROXY 4: XT - X-TREME ULTIMATE PROXY (REFINED + BRIDGE) ====================
app.all('/xt/*', async (req, res) => {
  const enc = req.path.replace('/xt/', '').split('?')[0];
  if (!enc) return res.status(400).send('Missing URL');
  let target: string;
  try { target = b64d(decodeURIComponent(enc)); new URL(target); } catch { return res.status(400).send('Invalid'); }
  try {
    const headers: Record<string, string> = {
      'User-Agent': randUA(),
      'Accept': req.headers['accept'] as string || 'text/html,*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': target,
      'Origin': new URL(target).origin,
    };
    if (req.headers['cookie']) headers['Cookie'] = req.headers['cookie'] as string;

    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 45000);
    const resp = await fetch(target, {
      method: req.method, headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      redirect: 'follow', signal: ac.signal
    });
    clearTimeout(to);

    const ct = resp.headers.get('content-type') || '';
    stripSecurityHeaders(resp.headers as any);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (ct.includes('text/html')) {
      const html = await resp.text();
      const $ = cheerio.load(html);
      const p = '/xt/';
      const rw = (v: string) => { try { return p + b64e(new URL(v, target).href); } catch { return v; } };
      $('[href]').each((_, e) => { const v = $(e).attr('href'); if (v && !v.startsWith('#') && !v.startsWith('javascript:')) $(e).attr('href', rw(v)); });
      $('[src]').each((_, e) => { const v = $(e).attr('src'); if (v && !v.startsWith('data:')) $(e).attr('src', rw(v)); });
      $('[action]').each((_, e) => { const v = $(e).attr('action'); if (v) $(e).attr('action', rw(v)); });
      $('[data-src]').each((_, e) => { const v = $(e).attr('data-src'); if (v) $(e).attr('data-src', rw(v)); });
      $('[data-href]').each((_, e) => { const v = $(e).attr('data-href'); if (v) $(e).attr('data-href', rw(v)); });
      $('[poster]').each((_, e) => { const v = $(e).attr('poster'); if (v) $(e).attr('poster', rw(v)); });
      $('[style]').each((_, e) => {
        const s = $(e).attr('style');
        if (s?.includes('url(')) $(e).attr('style', s.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (_m: string, u: string) => {
          try { return `url(${p + b64e(new URL(u, target).href)})`; } catch { return _m; }
        }));
      });
      $('style').each((_, e) => {
        const t = $(e).html() || '';
        if (t.includes('url(')) $(e).html(t.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (_m: string, u: string) => {
          try { return `url(${p + b64e(new URL(u, target).href)})`; } catch { return _m; }
        }));
      });
      $('script').each((_, e) => {
        const t = $(e).html() || '';
        if (t.includes('top.location') || (t.includes('self') && t.includes('top')) || t.includes('breakFrame'))
          $(e).remove();
      });
      // XT DOM Bridge — keeps interactivity alive
      const bridge = `<script>(function(){
        window.__xena={base:'${p}',origin:'${new URL(target).origin}',target:'${target}'};
        const oc=document.createElement.bind(document);
        document.createElement=function(tag){const el=oc(tag);if(['a','link','form'].includes(tag.toLowerCase())){const os=el.setAttribute.bind(el);el.setAttribute=function(n,v){if((n==='href'||n==='action')&&v&&!v.startsWith('#')&&!v.startsWith('javascript:')){try{v=window.__xena.base+btoa(new URL(v,window.__xena.origin).href).replace(/[+/=]/g,c=>c==='+'?'-':c==='/'?'_':'')}catch(e){}}return os(n,v)};}}return el};
        const ow=window.open.bind(window);window.open=function(u,...a){if(u&&!u.startsWith(window.__xena.base)){try{u=window.__xena.base+btoa(new URL(u,window.__xena.origin).href).replace(/[+/=]/g,c=>c==='+'?'-':c==='/'?'_'':')}catch(e){}}return ow(u,...a)};
        try{Object.defineProperty(window,'frameElement',{value:null,writable:false})}catch(e){}
        try{Object.defineProperty(window,'top',{value:window,writable:false})}catch(e){}
        try{Object.defineProperty(window,'parent',{value:window,writable:false})}catch(e){}
      })();</script>`;
      let htmlOut = $.html();
      const headEnd = htmlOut.indexOf('</head>');
      htmlOut = headEnd > -1 ? htmlOut.slice(0, headEnd) + bridge + htmlOut.slice(headEnd) : bridge + htmlOut;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(resp.status).send(htmlOut);
    } else if (ct.includes('text') || ct.includes('json') || ct.includes('javascript') || ct.includes('xml')) {
      res.status(resp.status).send(await resp.text());
    } else {
      const buf = Buffer.from(await resp.arrayBuffer());
      res.setHeader('Content-Type', ct || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(resp.status).send(buf);
    }
  } catch (err: any) { if (!res.headersSent) res.status(502).send('XT error: ' + err.message); else res.end(); }
});

// ==================== COMMON FETCH ====================
app.all('/fetch/*', async (req, res) => {
  const enc = req.path.replace('/fetch/', '').split('?')[0];
  if (!enc) return res.status(400).send('Missing URL');
  try { const t = b64d(decodeURIComponent(enc)); new URL(t); return proxyFetch(t, req, res, '/fetch/'); }
  catch { return res.status(400).send('Invalid'); }
});

// ==================== LOCAL AI — "CHILL AI" (NO API KEYS) ====================
const CHILL_RESPONSES = [
  "cheese",
  "honestly i forgot what i was gonna say",
  "bro idk",
  "that's kinda crazy ngl",
  "ok so like have you ever thought about how cats are just liquid?",
  "fair enough",
  "yeah i feel that",
  "idk man the vibes are off today",
  "cheese is good",
  "lowkey valid",
  "i think therefore i am... cheese",
  "bro stop hitting me with deep questions",
  "anyway did you know penguins have knees?",
  "sure why not",
  "based",
  "unbased tbh",
  "i'm just a chill ai what do you want from me",
  "that's wild",
  "ok but consider: socks with sandals",
  "i'm literally just here for the vibes",
  "cheese cheese cheese cheese cheese",
  "who let me cook",
  "this is fine",
  "i agree with you actually",
  "nah",
  "yuh",
  "skibidi ohio rizz",
  "idk figure it out yourself i'm just a chill ai",
  "pizza tower is a good game",
  "you ever just",
  "ok chat chill",
  "i'm not paid enough for this",
  "the council has decided: cheese",
  "that goes hard",
  "i'm sleepy",
  "w",
  "L",
  "both? both. both is good",
  "actually wait that's interesting tell me more",
  "i'm listening... nah i zoned out",
  "the voices told me to say cheese",
  "i'm just a chill ai who loves cheese",
  "bro i'm literally just vibing",
  "cheese is the meaning of life",
  "my brain is full of static and cheese",
  "ok hear me out",
  "yeah i'm not gonna lie that's pretty cool",
  "i'm too chill for this conversation rn",
  "🍞",
  "cheese 🧀",
  "the matrix is made of cheese",
];

function chillResponse(userMsg: string, history: string[]): string {
  const lower = userMsg.toLowerCase();
  
  // Check for questions
  if (lower.includes('how are you') || lower.includes('how r u')) {
    return "i'm vibing, thanks for asking. cheese?";
  }
  if (lower.includes('who are you') || lower.includes('what are you')) {
    return "i'm XENA. just a chill ai. i like cheese. that's basically it.";
  }
  if (lower.includes('what is') && lower.includes('cheese')) {
    return "cheese is the answer to everything. didn't you know?";
  }
  if (lower.includes('hello') || lower.includes('hi ') || lower === 'hi' || lower === 'hey' || lower === 'hello') {
    return "hey. cheese.";
  }
  if (lower.includes('help') || lower.includes('what can you do')) {
    return "i can vibe, talk about cheese, give you fun facts, or just sit here. i'm a chill ai. ask me anything honestly i don't really care";
  }
  
  // Check for fun facts request
  if (lower.includes('fun fact') || lower.includes('tell me something')) {
    const facts = [
      "did you know octopuses have three hearts? wild.",
      "a group of flamingos is called a flamboyance. yeah.",
      "wombat poop is cube-shaped so it doesn't roll away. nature is weird.",
      "hot water freezes faster than cold water sometimes. the mpemba effect.",
      "the shortest war in history was 38 minutes.",
      "cleopatra lived closer to the moon landing than to the pyramids.",
      "there are more trees on earth than stars in the milky way.",
      "a day on venus is longer than a year on venus.",
      "honey never spoils. like ever.",
      "the eiffel tower grows 6 inches in summer because of heat expansion.",
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }

  // Random chill response
  return CHILL_RESPONSES[Math.floor(Math.random() * CHILL_RESPONSES.length)];
}

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, mode = 'chill' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.json({ response: "cheese", provider: "local", mode: "chill" });
    }

    const lastMsg = messages[messages.length - 1];
    const userText = lastMsg?.content || lastMsg?.text || '';
    const history = messages.slice(-5).map((m: any) => m.content || m.text || '');

    const response = chillResponse(userText, history);
    res.json({ response, provider: "local", mode: "chill" });
  } catch (err: any) {
    res.json({ response: "cheese", provider: "local", mode: "chill" });
  }
});

// ==================== ADMIN API ====================
const announcements: any[] = [];
let uptime = 0;
setInterval(() => uptime++, 1000);

app.get('/api/admin/status', authMw, adminMw, (_req, res) => {
  res.json({ status: 'running', uptime: Math.floor(uptime), version: '1.0.0' });
});
app.post('/api/admin/announcement', authMw, adminMw, (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  announcements.push({ id: Date.now(), message, time: new Date().toISOString(), author: 'Admin' });
  res.json({ success: true, announcements });
});
app.get('/api/admin/announcements', authMw, (_req, res) => {
  res.json({ announcements });
});

// ==================== BOOTSTRAP ====================
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.join(process.cwd(), 'dist', 'index.html')));
  }
  app.listen(Number(PORT), '0.0.0.0', () => console.log(`[XENAULT] Online on 0.0.0.0:${PORT}`));
}
bootstrap();
