# altitude Mail

A standalone email client application with AI-powered features, part of the altitude workspace platform.

## Features

- 📧 Full email client with inbox, sent, drafts, spam
- 🤖 AI-powered email drafting and refinement
- 📊 Email analytics and insights
- 🧹 Inbox cleaner for newsletter management
- ⚡ Action center for meetings, tasks, and follow-ups

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3001`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anon key |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI features |

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js server (bundled with Vite in dev mode)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API (optional)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/mail` | List all emails |
| GET | `/api/mail/emails` | List emails by folder |
| GET | `/api/mail/settings` | Get user settings |
| PUT | `/api/mail/settings` | Update user settings |
| POST | `/api/ai/generate-draft` | AI email drafting |
| POST | `/api/ai/refine-draft` | AI email refinement |

## License

Part of the altitude workspace platform.
