import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Settings, Plus, X, Globe, Send, Shield, Cpu, Terminal, Users, Bell, RefreshCw, Search, LogOut } from "lucide-react";

function b64e(v: string): string {
  try { return btoa(unescape(encodeURIComponent(v))).replace(/[+/=]/g, c => c === "+" ? "-" : c === "/" ? "_" : ""); } catch { return encodeURIComponent(v); }
}

const PROXY_MODES = [
  { id: "rv", name: "RV", fullName: "Reverse Proxy", desc: "Server-side reverse proxy (Default)", badge: "REVERSE", latency: "~18ms" },
  { id: "sw", name: "SW", fullName: "Service Worker Engine", desc: "Client-side SW interception", badge: "SW ENGINE", latency: "~12ms" },
  { id: "bss", name: "BSS", fullName: "Binary Stream Sandbox", desc: "Streaming binary content", badge: "BINARY OS", latency: "~24ms" },
  { id: "xt", name: "XT", fullName: "X-Treme Ultimate Proxy", desc: "Deep rewrite + DOM bridge", badge: "ULTIMATE", latency: "~32ms" }
];

const FUN_FACTS = [
  "The first computer virus was created in 1983",
  "There are over 1.8 billion websites on the internet",
  "The first 1GB hard drive weighed over 500 pounds in 1980",
  "Google processes over 8.5 billion searches per day",
  "The first email was sent by Ray Tomlinson in 1971",
  "More than 90% of the world's data was created in the last 2 years",
  "The first website is still online at info.cern.ch",
  "Over 500 hours of video are uploaded to YouTube every minute",
  "Python is named after Monty Python's Flying Circus",
  "The first iPhone had no copy and paste functionality",
  "Linux runs 90% of the world's cloud infrastructure",
  "The QWERTY keyboard was designed to slow typists down",
  "The first webcam was created to monitor a coffee pot",
  "CAPTCHA stands for Completely Automated Public Turing test",
  "The first computer bug was an actual moth found in a computer",
  "The hashtag symbol is officially called an octothorpe",
  "The first domain name ever registered was Symbolics.com",
  "The original name for Windows was Interface Manager",
  "NASA is still using some technology from the 1970s on spacecraft",
  "The 404 error code was named after a room number at CERN where the web was born",
  "The first alarm clock could only ring at one time: 4 a.m.",
  "The world's first digital clock was invented in 1956",
  "The total weight of all the electricity running the internet is about 50 grams",
  "The first mobile phone call was made in New York City in 1973",
  "The original PlayStation was meant to be a Nintendo console plugin",
  "Amazon was almost named Cadabra, as in Abracadabra",
  "The first item ever scanned with a barcode was a pack of Wrigley's Juicy Fruit gum",
  "Firefox is actually named after the red panda, not a fox",
  "The first smartphone was created by IBM in 1992 and was called Simon",
  "Android was originally developed as an operating system for digital cameras",
  "The first computer mouse was made of wood by Douglas Engelbart",
  "In 1999, PayPal was voted one of the worst business ideas of the year",
  "The Nokia tune is actually based on a 19th-century guitar work called Gran Vals",
  "Over 300 billion emails are sent and received every single day",
  "The first text message ever sent said Merry Christmas",
  "A single Google search uses more computing power than it took to send Apollo 11 to the moon",
  "The original Twitter bird logo is named Larry, after basketball player Larry Bird",
  "Super Mario Bros. was so small it fit onto a 256-kilobit cartridge",
  "The first Apple logo featured Sir Isaac Newton sitting under an apple tree",
  "Wi-Fi doesn't actually stand for Wireless Fidelity; it's a made-up marketing term",
  "The average computer user blinks only 7 times a minute, instead of the usual 20",
  "The term robot comes from a Czech word meaning forced labor",
  "More people own a mobile phone than a toothbrush globally",
  "JPEG stands for Joint Photographic Experts Group",
  "The first banner ad went live in 1994 and had a 44% click-through rate",
  "GPS is owned and operated by the United States government",
  "Ebay was originally called AuctionWeb when it launched in 1995",
  "The first video ever uploaded to YouTube is called Me at the zoo",
  "Bluetooth was named after a 10th-century Scandinavian king who united Scandinavia",
  "The first commercial compact disc was pressed in 1982 and featured ABBA music",
  "Nearly 50% of all internet traffic comes from automated bots, not humans",
  "The founders of Google were willing to sell it to Excite for $1 million in 1999",
  "The first hard drive available for a home computer had a capacity of just 5 megabytes",
  "Siri was originally an independent app for iOS before Apple bought it",
  "The classic game Tetris was created in Soviet Russia by Alexey Pajitnov",
  "The first hard drive to cross the 1 terabyte mark was released by Hitachi in 2007",
  "The term spam for junk email comes from a Monty Python comedy sketch",
  "There are more active mobile connections in the world than there are people",
  "The world's first programmable computer was the Z1, built in 1936",
  "The first music video played on MTV was Video Killed the Radio Star by The Buggles",
  "The original name for Yahoo! was Jerry and David's Guide to the World Wide Web",
  "A petabyte is enough data to store 3.4 years of 24/7 4K video",
  "The save icon used in most software is a 3.5-inch floppy disk, which holds 1.44MB",
  "The first video game ever created was called Tennis for Two in 1958",
  "The spacebar is the most used key on a standard computer keyboard",
  "Netflix was founded in 1997, originally operating as a DVD-by-mail service",
  "The first laser was built in 1960 using a synthetic ruby crystal",
  "The original URL for Google was google.stanford.edu",
  "The world's first webcam image was a 128x128 grayscale picture of a coffee pot",
  "Macintosh computers were named after a variety of apple favored by the creator",
  "The first MP3 player was released in 1997 and could hold about 8 songs",
  "A single standard fiber optic cable can transmit the entire library of congress in seconds",
  "The blue color of Facebook is because Mark Zuckerberg is red-green colorblind",
  "The first 3D movie was released in theaters in 1922 and required green and red glasses",
  "The concept of the internet was envisioned by Nikola Tesla as early as 1900",
  "Over 90% of global currency exists only on computers as digital money",
  "The first digital camera was invented by an engineer at Kodak in 1975",
  "The term podcast is a blend of the words iPod and broadcast",
  "In 1995, the domain registration process for websites was completely free",
  "The first 4G cellular network was launched in South Korea in 2006",
  "The term bug was used to describe engineering glitches long before computers existed",
  "The world's most expensive domain name, Voice.com, sold for $30 million in 2019",
  "The first computer mouse required two wheels to track horizontal and vertical movement",
  "The original iPhone development team was kept so secret they called it Project Purple",
  "The first SMS message ever sent on a commercial network happened in December 1992",
  "The total amount of digital data in the world is measured in zettabytes",
  "The code that ran the Apollo 11 guidance computer was written by Margaret Hamilton",
  "The first consumer drones were available in the early 2010s",
  "The QWERTY layout was patented by Christopher Sholes in 1878",
  "The first virtual reality headset was created in 1968 and was called The Sword of Damocles",
  "The first commercial SMS text message was sent over the Vodafone GSM network",
  "The word emoji comes from the Japanese words for picture and character",
  "The first microprocessor was the Intel 4004, released in 1971",
  "The standard aspect ratio of 16:9 for modern screens was chosen as a compromise",
  "The first consumer version of Windows 95 sold 1 million copies in just 4 days",
  "The original concept of Wikipedia allowed anyone to edit without creating an account",
  "The first USB flash drives were introduced in 2000 with a capacity of 8 megabytes",
  "The word pixel is a combination of the words picture and element",
  "The first mechanical computer was designed by Charles Babbage in the 1830s",
  "The programming language JavaScript was famously written in just 10 days",
  "The first color photograph was taken by physicist James Clerk Maxwell in 1861",
  "The blue light emitted by screens can disrupt melatonin production and sleep patterns",
  "The first web browser capable of displaying images inline with text was Mosaic",
  "The world's first smartphone had a touchscreen, calendar, and fax capability",
  "The original mascot for Linux is a penguin named Tux",
  "The first Apple computer went on sale for the specific price of $666.66",
  "The first commercial cellular network was launched in Japan by NTT in 1979",
  "The word algorithm originates from the name of a 9th-century Persian mathematician",
  "The first solid-state drive for consumer PCs was introduced in the early 1991",
  "The Earth has more than 1 trillion species of microbes",
  "Octopuses have three hearts and blue blood",
  "A day on Venus is longer than a year on Venus",
  "Honey never spoils — 3000-year-old honey found still edible",
  "The Eiffel Tower grows 6 inches taller in summer",
  "A group of flamingos is called a 'flamboyance'",
  "Wombat poop is cube-shaped so it doesn't roll away",
  "There are more trees on Earth than stars in the Milky Way",
  "Hot water freezes faster than cold water (Mpemba effect)",
  "A jiffy is an actual unit of time: 1/100th of a second",
  "The shortest war in history was 38 minutes",
  "A day on Pluto lasts 6.4 Earth days",
  "Cows have best friends and get stressed when separated",
  "The universe's color is 'Cosmic Latte' — a beige color",
  "Cleopatra lived closer to the moon landing than to the pyramids",
  "Scotland has 421 words for 'snow'",
  "Bananas are berries, but strawberries aren't",
  "A cloud can weigh over a million pounds",
  "There's a species of jellyfish that is biologically immortal",
  "The Great Wall of China is not visible from space with the naked eye",
  "A bolt of lightning contains enough energy to toast 100,000 slices of bread",
  "The world's oldest known joke dates back to 1900 BC and involves farting",
  "Humans share about 60% of their DNA with bananas",
  "A single teaspoon of neutron star would weigh about 6 billion tons",
  "The national animal of Scotland is the unicorn",
  "The smell of freshly cut grass is actually a plant distress signal",
  "Sharks existed before trees",
  "Your brain uses about 20% of your body's oxygen and calories",
  "There are more possible iterations of a game of chess than atoms in the observable universe",
  "The world's largest desert is actually Antarctica, not the Sahara",
  "A hippo's sweat is pink and acts as a natural sunscreen",
  "The tongue is the only muscle in the human body that's attached at only one end",
  "Coca-Cola was originally green",
  "The shortest commercial flight in the world takes about 1 minute",
  "Australia is wider than the moon",
  "The total distance of all the roads in the US is enough to go to the moon and back 200 times",
  "Your stomach gets a new lining every 3-4 days to avoid digesting itself",
  "A million seconds is about 11 days, but a billion seconds is about 31 years",
  "The inventor of the Pringles can is now buried in one",
  "The average cumulus cloud weighs about 1.1 million pounds",
  "The word 'nerd' first appeared in Dr. Seuss's book 'If I Ran the Zoo'",
  "There are more fake flamingos in the world than real ones",
  "The first computer programmer was a woman named Ada Lovelace",
  "The dot over the letters i and j is called a tittle",
  "A baby octopus is about the size of a flea when it's born",
  "The world's largest pizza ever made was 13,580 square feet",
  "A cockroach can live for up to a week without its head",
  "The average person walks the equivalent of five times around the Earth in a lifetime",
  "The longest recorded flight of a chicken is 13 seconds",
  "There's a town in Norway called Hell that freezes over every winter",
  "The unicorn is the national animal of Scotland",
  "A human could swim through a blue whale's veins",
  "The dot-com bubble peaked in March 2000",
  "The first product to have a barcode was Wrigley's gum",
  "The Hawaiian alphabet has only 13 letters",
  "A snail can sleep for three years",
  "The world's largest snowflake was 15 inches wide",
  "The average human produces enough saliva in a lifetime to fill two swimming pools",
  "The hummingbird is the only bird that can fly backwards",
  "There's a species of spider that can run on water",
  "The moon is moving away from Earth at about 1.5 inches per year",
  "Some cats are actually allergic to humans",
  "The Earth's rotation is slowing down at a rate of about 1.8 milliseconds per century",
  "A day on Mercury is about 59 Earth days long",
  "The longest living animal is the Greenland shark, which can live over 400 years",
  "There's a type of bamboo that can grow 35 inches in a single day",
  "The human nose can detect over 1 trillion different scents",
  "The total amount of data on the internet is estimated to be about 40 zettabytes",
  "The first website ever created is still online at info.cern.ch",
  "The most expensive domain name ever sold was Voice.com for $30 million",
  "The original PlayStation was almost called the 'Nintendo PlayStation'",
  "The first emoticon was used in 1982 and was :-)",
  "The Amazon rainforest produces about 20% of the world's oxygen",
  "The average person has about 100,000 hairs on their head",
  "A giraffe's neck has the same number of vertebrae as a human's",
  "The cold water faucet was invented before the hot water faucet",
  "A group of porcupines is called a prickle",
  "The first successful photograph was taken in 1826 and took 8 hours to expose",
  "The word 'goodbye' originally comes from 'God be with ye'",
  "The total weight of all the ants on Earth is roughly equal to the total weight of all humans",
  "The Earth's core is as hot as the surface of the sun",
  "A year on Jupiter is about 12 Earth years",
  "The first recorded use of 'OMG' was in a letter to Winston Churchill in 1917",
  "The Twitter bird's name is Larry, after Larry Bird of the Boston Celtics",
  "The first YouTube video was called 'Me at the zoo' and was 18 seconds long",
  "The Samsung Galaxy Note 7 was banned from airlines due to battery fires",
  "The GIF format was created in 1987 by Steve Wilhite, who pronounced it 'jif'",
  "The first email was sent by Ray Tomlinson in 1971",
  "The first domain ever registered was symbolics.com on March 15, 1985",
  "The World Wide Web was invented in 1989 by Tim Berners-Lee",
  "The average person checks their phone about 150 times a day",
  "Social media platforms have about 4.9 billion users worldwide",
  "The first TikTok video was posted in 2016",
  "The most followed person on Instagram is Cristiano Ronaldo",
  "The most viewed YouTube video is Baby Shark Dance with over 14 billion views",
  "The longest YouTube video is 596 hours long",
  "The first iPhone was released in 2007 and cost $499",
  "The Android operating system was created in 2003 and bought by Google in 2005"
];

function getGreeting(): string { const h = new Date().getHours(); if (h < 12) return "Good morning"; if (h < 17) return "Good afternoon"; return "Good evening"; }

function isUrl(t: string): boolean {
  if (!t.trim()) return false;
  if (/^https?:\/\//i.test(t)) return true;
  return /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(t);
}

function getDomain(u: string): string {
  try { return new URL(u).hostname.replace("www.", ""); } catch { return "Web"; }
}

interface Tab { id: string; title: string; url: string; proxyUrl: string; }

// ==================== STARS BACKGROUND ====================
function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let anim: number;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.5 + 0.3, a: Math.random(), speed: Math.random() * 0.008 + 0.002,
      dir: Math.random() > 0.5 ? 1 : -1, twinkle: Math.random() * 0.02 + 0.005
    }));
    
    const shooting: any[] = [];
    const addShooting = () => {
      if (Math.random() > 0.005) return;
      shooting.push({
        x: Math.random() * c.width, y: 0,
        dx: -(Math.random() * 4 + 2), dy: Math.random() * 4 + 2,
        life: 1, length: Math.random() * 80 + 40
      });
    };
    
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      
      // Draw stars
      stars.forEach(st => {
        st.a += st.speed * st.dir;
        if (st.a >= 1) { st.a = 1; st.dir = -1; }
        else if (st.a <= 0.1) { st.a = 0.1; st.dir = 1; }
        ctx.globalAlpha = st.a;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw shooting stars
      addShooting();
      for (let i = shooting.length - 1; i >= 0; i--) {
        const s = shooting[i];
        s.x += s.dx;
        s.y += s.dy;
        s.life -= 0.01;
        if (s.life <= 0) { shooting.splice(i, 1); continue; }
        ctx.globalAlpha = s.life;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.dx * s.length / 50, s.y - s.dy * s.length / 50);
        ctx.stroke();
      }
      
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(anim); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0" />;
}

// ==================== ACCESS CODE MODAL ====================
function CodeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (role: string) => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const submit = async () => {
    if (!code.trim()) return;
    try {
      const r = await fetch("/api/auth/validate-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code.trim() }) });
      const d = await r.json();
      if (d.valid) { onSuccess(d.role); }
      else { setError("Invalid code"); }
    } catch { setError("Error checking code"); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-8 w-full max-w-sm mx-4">
        <h2 className="text-lg font-bold text-white mb-1">Access Code</h2>
        <p className="text-xs text-zinc-500 mb-6 font-mono">Enter your developer or admin code</p>
        <input type="password" value={code} onChange={e => { setCode(e.target.value); setError(""); }}
          onKeyDown={e => { if (e.key === "Enter") submit(); }}
          placeholder="Enter code..." autoFocus
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-zinc-600 mb-2" />
        {error && <p className="text-red-400 text-xs font-mono mb-2">{error}</p>}
        <div className="flex gap-2">
          <button onClick={submit} className="flex-1 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono">Submit</button>
          <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 text-xs font-mono">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ==================== DEV CONSOLE ====================
function DevConsole({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full min-h-screen bg-[#060a18] text-white overflow-y-auto">
      <header className="bg-gradient-to-r from-[#0a1030] via-[#0d1540] to-[#0a1030] border-b border-[#1a2850] px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs tracking-[0.2em] font-mono mb-2"><Cpu className="w-4 h-4" /> DEVELOPER CONSOLE</div>
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              <h1 className="text-3xl font-bold text-white">{getGreeting()} G</h1>
            </div>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-[#1a2850]/50 border border-[#2a3870] rounded-lg text-blue-300 hover:text-white text-sm font-mono">✕ CLOSE</button>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0a1030]/80 border border-[#1a2850] rounded-xl p-5">
            <p className="text-[10px] text-blue-400/60 uppercase tracking-[0.15em] font-mono mb-2">Active Sessions</p>
            <p className="text-4xl font-bold text-white">3</p>
          </div>
          <div className="bg-[#0a1030]/80 border border-[#1a2850] rounded-xl p-5">
            <p className="text-[10px] text-blue-400/60 uppercase tracking-[0.15em] font-mono mb-2">System Uptime</p>
            <p className="text-4xl font-bold text-white">{Math.floor(performance.now() / 1000 / 60)}m</p>
          </div>
          <div className="bg-[#0a1030]/80 border border-[#1a2850] rounded-xl p-5">
            <p className="text-[10px] text-blue-400/60 uppercase tracking-[0.15em] font-mono mb-2">Proxy Engine</p>
            <p className="text-xl font-bold text-white">XT / RV / SW / BSS</p>
          </div>
          <div className="bg-[#0a1030]/80 border border-[#1a2850] rounded-xl p-5">
            <p className="text-[10px] text-blue-400/60 uppercase tracking-[0.15em] font-mono mb-2">Memory</p>
            <p className="text-4xl font-bold text-white">~48MB</p>
          </div>
        </div>
        <div className="bg-[#0a1030]/80 border border-[#1a2850] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Proxy Engines Status</h2>
          {PROXY_MODES.map(m => (
            <div key={m.id} className="flex items-center justify-between py-3 border-b border-[#1a2850] last:border-0">
              <div><span className="text-sm font-bold text-white">{m.badge}</span><p className="text-xs text-blue-300/60">{m.fullName}</p></div>
              <span className="text-xs text-emerald-400 font-mono">● active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN CONSOLE ====================
function AdminConsole({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const [announceMsg, setAnnounceMsg] = useState("");
  return (
    <div className="w-full min-h-screen bg-[#0a0606] text-white overflow-y-auto">
      <header className="bg-gradient-to-r from-[#1a0808] via-[#2a1010] to-[#1a0808] border-b border-[#502020] px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs tracking-[0.2em] font-mono mb-2"><Users className="w-4 h-4" /> ADMIN CONSOLE</div>
            <h1 className="text-3xl font-bold text-white">Sup <span className="text-amber-400">G</span></h1>
          </div>
          <div className="flex gap-2">
            <button onClick={onLogout} className="px-4 py-2 bg-[#2a1414]/50 border border-[#502020] rounded-lg text-red-300 hover:text-white text-sm font-mono flex items-center gap-2"><LogOut className="w-3.5 h-3.5" /> Logout</button>
            <button onClick={onClose} className="px-4 py-2 bg-[#2a1414]/50 border border-[#502020] rounded-lg text-amber-300 hover:text-white text-sm font-mono">✕ CLOSE</button>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1a0808]/80 border border-[#502020] rounded-xl p-5">
            <p className="text-[10px] text-amber-400/60 uppercase tracking-[0.15em] font-mono mb-2">Active Gateways</p>
            <p className="text-4xl font-bold text-white">12</p>
          </div>
          <div className="bg-[#1a0808]/80 border border-[#502020] rounded-xl p-5">
            <p className="text-[10px] text-amber-400/60 uppercase tracking-[0.15em] font-mono mb-2">Connected Users</p>
            <p className="text-4xl font-bold text-white">47</p>
          </div>
          <div className="bg-[#1a0808]/80 border border-[#502020] rounded-xl p-5">
            <p className="text-[10px] text-amber-400/60 uppercase tracking-[0.15em] font-mono mb-2">Status</p>
            <p className="text-xl font-bold text-emerald-400">RUNNING</p>
          </div>
        </div>
        <div className="bg-[#1a0808]/80 border border-[#502020] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-400" /> Announcements</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" value={announceMsg} onChange={e => setAnnounceMsg(e.target.value)}
              placeholder="Write an announcement..." className="flex-1 bg-[#0a0606] border border-[#502020] rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-amber-600" />
            <button onClick={async () => {
              if (!announceMsg.trim()) return;
              await fetch("/api/admin/announcement", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: announceMsg }) });
              setAnnounceMsg("");
            }} className="px-4 py-2 bg-amber-600/20 border border-amber-600/40 rounded-lg text-amber-300 hover:text-white text-sm font-mono">Send</button>
          </div>
        </div>
        <div className="bg-[#1a0808]/80 border border-[#502020] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Gateway Controls</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#502020]/50"><span className="text-sm text-zinc-300">SW Proxy Engine</span><span className="text-xs text-emerald-400 font-mono">● active</span></div>
            <div className="flex items-center justify-between py-2 border-b border-[#502020]/50"><span className="text-sm text-zinc-300">RV Proxy Engine</span><span className="text-xs text-emerald-400 font-mono">● active</span></div>
            <div className="flex items-center justify-between py-2 border-b border-[#502020]/50"><span className="text-sm text-zinc-300">BSS Proxy Engine</span><span className="text-xs text-emerald-400 font-mono">● active</span></div>
            <div className="flex items-center justify-between py-2"><span className="text-sm text-zinc-300">XT Proxy Engine</span><span className="text-xs text-emerald-400 font-mono">● active</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SETTINGS MODAL ====================
function SettingsModal({ onClose, aiHistory, searchHistory, onClearAI, onClearSearch }: {
  onClose: () => void; aiHistory: { role: string; text: string }[]; searchHistory: string[];
  onClearAI: () => void; onClearSearch: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-8 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-zinc-400" /><h2 className="text-xl font-bold text-white">Settings</h2></div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-white">AI History ({aiHistory.length})</h3>
            {aiHistory.length > 0 && <button onClick={onClearAI} className="text-xs text-red-400 hover:text-red-300 font-mono">Clear all</button>}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-h-40 overflow-y-auto no-scrollbar space-y-2">
            {aiHistory.length === 0 ? <p className="text-xs text-zinc-600 italic">No AI conversations yet</p> :
              aiHistory.map((m, i) => (
                <div key={i} className="text-xs"><span className={m.role === "user" ? "text-blue-400" : "text-emerald-400"}>{m.role === "user" ? "You:" : "AI:"}</span> <span className="text-zinc-300">{m.text}</span></div>
              ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-white">Search History ({searchHistory.length})</h3>
            {searchHistory.length > 0 && <button onClick={onClearSearch} className="text-xs text-red-400 hover:text-red-300 font-mono">Clear all</button>}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-h-40 overflow-y-auto no-scrollbar space-y-1">
            {searchHistory.length === 0 ? <p className="text-xs text-zinc-600 italic">No searches yet</p> :
              searchHistory.map((s, i) => <p key={i} className="text-xs text-zinc-400 font-mono">→ {s}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== AI CHAT PANEL ====================
function AIChatPanel({ onClose, messages, onSend }: { onClose: () => void; messages: { role: string; text: string }[]; onSend: (msg: string) => void }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 h-96 bg-[#0a0a0a] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-sm font-semibold text-white">XENA AI</span></div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${m.role === "user" ? "bg-blue-600/20 border border-blue-600/30 text-blue-200" : "bg-zinc-800/50 border border-zinc-800 text-zinc-300"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="px-3 py-2 border-t border-zinc-800 flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && input.trim()) { onSend(input.trim()); setInput(""); } }}
          placeholder="ask me anything..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-zinc-600" />
        <button onClick={() => { if (input.trim()) { onSend(input.trim()); setInput(""); } }} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white"><Send className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ==================== TAB BAR ====================
function TabBar({ tabs, activeTab, onSelect, onClose }: { tabs: Tab[]; activeTab: string; onSelect: (id: string) => void; onClose: (id: string) => void }) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar px-2 py-1 border-b border-zinc-800/50">
      {tabs.map(tab => (
        <div key={tab.id} onClick={() => onSelect(tab.id)}
          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg cursor-pointer text-xs transition-colors min-w-0 max-w-[160px] ${activeTab === tab.id ? "bg-zinc-900 text-white border border-zinc-800 border-b-transparent" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"}`}>
          <Globe className="w-3 h-3 shrink-0" />
          <span className="truncate">{tab.title}</span>
          {tabs.length > 1 && <X className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white ml-auto" onClick={e => { e.stopPropagation(); onClose(tab.id); }} />}
        </div>
      ))}
    </div>
  );
}

// ==================== MAIN APP ====================
let tabCounter = 0;
const HOME_URL = "https://lite.duckduckgo.com/lite/";

function App() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: "1", title: "Home", url: "", proxyUrl: "" }]);
  const [activeTab, setActiveTab] = useState("1");
  const [urlInput, setUrlInput] = useState("");
  const [proxyMode, setProxyMode] = useState(PROXY_MODES[0]);
  const [showModePicker, setShowModePicker] = useState(false);
  const [funFact, setFunFact] = useState(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fun fact rotation every 25 seconds
  useEffect(() => {
    const iv = setInterval(() => {
      setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
    }, 25000);
    return () => clearInterval(iv);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "t") { e.preventDefault(); openNewTab(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "w") { e.preventDefault(); closeTab(activeTab); }
      if ((e.ctrlKey || e.metaKey) && e.key === "l") { e.preventDefault(); document.getElementById("url-bar")?.focus(); }
      if (e.key === "Escape") { document.getElementById("url-bar")?.blur(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, tabs]);

  function openNewTab() {
    const id = String(++tabCounter);
    setTabs(prev => [...prev, { id, title: "New Tab", url: "", proxyUrl: "" }]);
    setActiveTab(id);
    setUrlInput("");
  }

  function closeTab(id: string) {
    if (tabs.length <= 1) return;
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const filtered = prev.filter(t => t.id !== id);
      if (activeTab === id) {
        const newIdx = Math.min(idx, filtered.length - 1);
        setActiveTab(filtered[newIdx].id);
      }
      return filtered;
    });
  }

  function navigate(url: string) {
    if (!url.trim()) return;
    let finalUrl = url;
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;
    setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, url: finalUrl, proxyUrl: buildProxyUrl(finalUrl), title: getDomain(finalUrl) } : t));
    setUrlInput(finalUrl);
    setSearchHistory(prev => [finalUrl, ...prev.filter(s => s !== finalUrl)].slice(0, 50));
    setIframeKey(k => k + 1);
  }

  function buildProxyUrl(url: string): string {
    const enc = b64e(url);
    return `/${proxyMode.id}/${enc}`;
  }

  function handleSearchOrNav(input: string) {
    if (isUrl(input)) {
      navigate(input);
    } else {
      const query = encodeURIComponent(input);
      navigate(`https://lite.duckduckgo.com/lite/?q=${query}`);
    }
  }

  const activeTabData = tabs.find(t => t.id === activeTab) || tabs[0];
  const isHome = !activeTabData.url;

  // AI chat
  async function sendAIMessage(msg: string) {
    const newMsgs = [...aiMessages, { role: "user" as const, text: msg }];
    setAiMessages(newMsgs);
    try {
      const r = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ content: msg }], mode: "chill" }) });
      const d = await r.json();
      setAiMessages(prev => [...prev, { role: "assistant", text: d.response || "cheese" }]);
    } catch {
      const fallbacks = ["cheese", "bro idk", "that's kinda crazy ngl", "the vibes are off today", "cheese is good", "i'm just a chill ai what do you want from me", "ok but consider: socks with sandals"];
      setAiMessages(prev => [...prev, { role: "assistant", text: fallbacks[Math.floor(Math.random() * fallbacks.length)] }]);
    }
  }

  // Access code success
  function handleCodeSuccess(r: string) {
    setRole(r);
    setShowCodeModal(false);
  }

  function handleLogout() {
    setRole(null);
  }

  const showDevConsole = role === "developer";
  const showAdminConsole = role === "admin";

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      <StarField />

      {/* FULL PAGE ROUTES */}
      {showDevConsole && role === "developer" && (
        <div className="relative z-50">
          <DevConsole onClose={() => setRole(null)} />
        </div>
      )}
      {showAdminConsole && role === "admin" && (
        <div className="relative z-50">
          <AdminConsole onClose={() => setRole(null)} onLogout={handleLogout} />
        </div>
      )}

      {/* MAIN UI (hidden when in dev/admin console) */}
      {!role || (role !== "developer" && role !== "admin") ? (
        <>
          {/* TOP BAR */}
          <div className="relative z-10 flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur-sm border-b border-zinc-800/50">
            <div className="flex items-center gap-1.5">
              <button onClick={() => { iframeRef.current?.contentWindow?.history.back(); }} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"><ArrowLeft className="w-4 h-4" /></button>
              <button onClick={() => { iframeRef.current?.contentWindow?.history.forward(); }} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"><ArrowRight className="w-4 h-4" /></button>
              <button onClick={() => { if (activeTabData.url) { setIframeKey(k => k + 1); } }} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"><RotateCw className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5">
              {!isHome && (
                <button onClick={() => setShowModePicker(!showModePicker)} className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-md text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-700">
                  {proxyMode.name}
                </button>
              )}
              <div className="flex-1 relative">
                {isHome ? (
                  <div className="flex items-center gap-2 w-full">
                    <Search className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <span className="text-xs text-zinc-600 truncate">{funFact}</span>
                  </div>
                ) : (
                  <input id="url-bar" type="text" value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSearchOrNav(urlInput); }}
                    placeholder="Search or enter URL..."
                    className="w-full bg-transparent text-xs text-white outline-none placeholder-zinc-600" />
                )}
              </div>
              {/* Mode picker dropdown */}
              {showModePicker && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl z-50 animate-fadeIn">
                  {PROXY_MODES.map(m => (
                    <button key={m.id} onClick={() => { setProxyMode(m); setShowModePicker(false); if (activeTabData.url) { setIframeKey(k => k + 1); } }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${proxyMode.id === m.id ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"}`}>
                      <div><span className="font-bold text-xs">{m.badge}</span><p className="text-zinc-600 text-[10px]">{m.desc}</p></div>
                      <span className="text-[10px] text-zinc-600 font-mono">{m.latency}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowSettings(true)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"><Settings className="w-4 h-4" /></button>
              <button onClick={() => setShowAIChat(!showAIChat)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"><Send className="w-4 h-4" /></button>
              <button onClick={() => setShowCodeModal(true)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"><Terminal className="w-4 h-4" /></button>
              <button onClick={openNewTab} className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* TABS BAR */}
          <TabBar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} onClose={closeTab} />

          {/* MAIN CONTENT */}
          <div className="flex-1 relative overflow-hidden">
            {/* HOME PAGE */}
            {isHome && (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                {/* OLED black background handling */}
                <div className="absolute inset-0 bg-black" />
                <div className="relative z-10 flex flex-col items-center w-full max-w-xl">
                  <h1 className="text-7xl font-bold text-white/90 glow mb-6 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>XENA</h1>
                  <div className="w-full relative">
                    <input type="text" value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSearchOrNav(urlInput); }}
                      placeholder={funFact}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all placeholder-zinc-600 text-center"
                    />
                    <button onClick={() => { if (urlInput.trim()) handleSearchOrNav(urlInput); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 text-zinc-500 hover:text-white transition-colors">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-700 mt-8 max-w-md text-center leading-relaxed">
                    Riverbend Tutoring opens every engagement with a free intake call, then settles into a steady weekly rhythm built around the student's actual coursework, deadlines, and study habits.
                  </p>
                </div>
              </div>
            )}

            {/* IFRAME CONTENT */}
            {!isHome && (
              <iframe key={iframeKey} ref={iframeRef}
                src={buildProxyUrl(activeTabData.url)}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin allow-forms allow-scripts allow-popups"
                title={activeTabData.title}
              />
            )}
          </div>
        </>
      ) : null}

      {/* MODALS */}
      {showCodeModal && <CodeModal onClose={() => setShowCodeModal(false)} onSuccess={handleCodeSuccess} />}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)}
          aiHistory={aiMessages}
          searchHistory={searchHistory}
          onClearAI={() => setAiMessages([])}
          onClearSearch={() => setSearchHistory([])}
        />
      )}
      {showAIChat && <AIChatPanel onClose={() => setShowAIChat(false)} messages={aiMessages} onSend={sendAIMessage} />}
    </div>
  );
}

export default App;
