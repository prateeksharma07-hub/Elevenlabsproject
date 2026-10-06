# ElevenLabs API Security Architecture Guide

> **Security Analysis & Backend Migration Blueprint**  
> **Target Audience:** First-Year Software Engineering & Full-Stack Developers  
> **Application:** AURA // Neural Voice Studio  

---

## 1. Current Architecture: Browser-Side API Calls

In the current development prototype, audio synthesis requests are dispatched directly from the user's browser in `app.js`:

```javascript
// Browser initiates direct request to ElevenLabs API:
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
  method: 'POST',
  headers: {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': apiKey // ⚠️ SENSITIVE KEY SENT FROM CLIENT
  },
  body: JSON.stringify({ text, model_id, voice_settings })
});
```

---

## 2. Security Implications & Risks

### 2.1 The Core Problem: The Client Environment is Untrusted
In web development, **any code executed inside the user's web browser is completely exposed to anyone opening the page**. 

Even if an API key is placed inside an environment variable (like `VITE_ELEVENLABS_API_KEY`) or in `localStorage`:
1. **Network Tab Inspection:** Anyone can open Chrome DevTools (press `F12`), go to the **Network** tab, filter by `fetch`, click the request to `api.elevenlabs.io`, and view the full HTTP headers containing `'xi-api-key'`.
2. **Bundle Inspection:** Any `VITE_` prefixed environment variables are baked directly into the generated JavaScript bundle at build time. Anyone can search the `.js` files for string tokens.
3. **Storage Extraction:** Values in `localStorage` can be read by any JavaScript running on the origin or through browser extensions.

### 2.2 Repercussions of Key Leakage
* **Financial Billing Drain:** ElevenLabs charges based on synthesized character quotas. A stolen key allows third parties to drain your monthly character allocation or trigger significant overage charges.
* **Account Suspension:** Automated scrapers constantly crawl GitHub and public web apps searching for exposed API tokens (`sk_...`). Once detected by ElevenLabs security bots or GitHub Secret Scanning, the API key is automatically revoked.
* **Service Disruption:** Your project or demo abruptly stops functioning when the key is blocked or characters are exhausted.

---

## 3. The Production Solution: Backend Proxy Endpoint (BFF Pattern)

In production software architecture, sensitive API keys are stored **exclusively on a secure server**. The browser never contacts ElevenLabs directly. Instead:

```
[ User Browser / Client ]
           │
           │  1. POST /api/synthesize
           │     { text, voiceId, settings } (NO API KEY)
           ▼
[ Your Backend Server / Cloudflare Worker / Express / Next.js ]
           │
           │  2. Authenticate user / apply rate limiting
           │  3. Attach process.env.ELEVENLABS_API_KEY
           │  4. POST https://api.elevenlabs.io/v1/text-to-speech/...
           ▼
[ ElevenLabs API ]
           │
           │  5. Return audio/mpeg stream
           ▼
[ Your Backend Server ]
           │
           │  6. Stream audio/mpeg directly to client
           ▼
[ User Browser / Web Audio API ]
```

---

## 4. Implementation Blueprint: Minimal Backend Proxy

Here is how simple it is to build a secure proxy with **Node.js (Express)**:

### `server.js` (Backend Server)
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Reads .env on server only

const app = express();
app.use(cors({ origin: 'https://your-frontend-domain.com' }));
app.use(express.json());

// Secure Synthesis Endpoint
app.post('/api/synthesize', async (req, res) => {
  const { voiceId, text, modelId, voiceSettings } = req.body;

  // 1. Basic validation
  if (!text || text.length > 5000) {
    return res.status(400).json({ error: 'Invalid text payload' });
  }

  try {
    // 2. Secret key stays strictly in server memory
    const elevenLabsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: voiceSettings
      })
    });

    if (!elevenLabsRes.ok) {
      const err = await elevenLabsRes.text();
      return res.status(elevenLabsRes.status).send(err);
    }

    // 3. Pipe audio stream back to browser
    res.setHeader('Content-Type', 'audio/mpeg');
    const arrayBuffer = await elevenLabsRes.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));

  } catch (error) {
    res.status(500).json({ error: 'Internal synthesis error' });
  }
});

app.listen(3001, () => console.log('Secure Voice Proxy running on port 3001'));
```

### Client Frontend Update (`app.js` in Production)
```javascript
// The client now calls the local proxy - zero keys exposed!
const response = await fetch('/api/synthesize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    voiceId: voiceSelect.value,
    text,
    modelId: modelSelect.value,
    voiceSettings: {
      stability: parseFloat(stabilitySlider.value),
      similarity_boost: parseFloat(similaritySlider.value),
      style: parseFloat(styleSlider.value)
    }
  })
});
```

---

## 5. Current Development Mode Handling

To keep the academic demo fully functional without requiring a separate backend process to be running during development:
1. The project uses local environment variables (`.env.local`) or client-side storage for testing.
2. `.env.local` is **strictly excluded via `.gitignore`** so keys are never committed to GitHub.
3. Placeholders in `app.js` prevent accidental exposure.
4. When ready to deploy to production, migrating to the `/api/synthesize` proxy takes less than 15 minutes by adopting the pattern shown above.
