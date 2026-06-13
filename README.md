# TrialRoom.ai

Virtual Fashion Try-On Platform — See how any outfit looks on you before you wear it.

![TrialRoom.ai](https://img.shields.io/badge/TrialRoom-ai-0284C7?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-38BDF8?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-0D9488?style=for-the-badge)

---

## What is TrialRoom.ai?

TrialRoom.ai is a cutting-edge virtual try-on platform that lets users visualize any garment on themselves in seconds — no physical fitting room needed.

Upload your photo, choose a garment, and see your perfect look instantly.

---

## Features

- Virtual Try-On — See any outfit on yourself in under 30 seconds
- 8+ Garment Types — Shirts, trousers, blazers, sarees, lehengas and more
- Bilingual — Full Bangla and English language support
- Fully Responsive — Works on mobile, tablet and desktop
- Save and Share — Download your look or share it with friends
- Rate Your Look — Built-in rating system
- Privacy First — Your photos are never stored on our servers

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js                            |
| Styling     | Inline CSS + Google Fonts           |
| Backend     | Node.js + Express                   |
| Fonts       | Orbitron, Share Tech Mono, Hind Siliguri |
| Deployment  | Vercel (frontend) + Railway (backend) |

---

## Installation

### Prerequisites

- Node.js v18+
- npm v9+

### Clone the repository

```bash
git clone https://github.com/your-username/trialroom.git
cd trialroom
```

### Install dependencies

```bash
npm install
```

### Setup environment

Create a `.env` file in the root directory:

```env
PROCESSING_KEY=your_key_here
PORT=3001
```

---

## Running the App

Important: This app requires two servers running simultaneously.
The React app (port 3000) communicates with a local processing server (port 3001).
If the processing server is not running, try-on will not work.

### Start both servers with one command:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

Do NOT use `npm start` alone — it starts only the React app without the processing server.

---

## Project Structure

```
trialroom/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main app component
│   ├── api.js          # Processing service connector
│   ├── index.js        # React entry point
│   └── index.css       # Global styles
├── server.js           # Processing proxy server
├── .env                # Environment variables (do not commit)
├── package.json
└── README.md
```

---

## Deployment

### Frontend — Vercel

```bash
npm run build
npx vercel --prod
```

### Backend — Railway

1. Push code to GitHub
2. Connect repo on railway.app
3. Add environment variables
4. Deploy

---

## Available Scripts

| Command         | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Start both frontend and backend      |
| `npm start`     | Start React app only                 |
| `npm run build` | Build for production                 |
| `npm test`      | Run tests                            |

---

## Roadmap

- User authentication (Google Login)
- Try-on history and saved looks
- My Wardrobe feature
- Community feed and social sharing
- Brand dashboard and embed widget
- Mobile app (React Native)

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT © 2026 TrialRoom.ai