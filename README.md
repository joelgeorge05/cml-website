# CML Kaliyar Mekhala Portal

The official portal for the Cherupushpa Mission League (CML) Kaliyar Mekhala (Kothamangalam Diocese). This application manages arts events, participant registrations, competition results, blood donor lists, and news announcements for the region.

## Run Locally

**Prerequisites:** Node.js v18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables by ensuring `.env` is populated with the correct Supabase keys and secrets.
3. Run the app in development mode:
   ```bash
   npm run dev
   ```

## Production Build

To build the application for production (client and server):
```bash
npm run build
```

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** Express + Node.js
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
