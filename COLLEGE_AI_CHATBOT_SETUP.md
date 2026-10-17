# Maa Maturani Devi Pharmacy College — College AI Assistant

The project now includes a floating College AI Assistant widget across rendered HTML pages.

## Features
- Floating chatbot launcher and responsive chat panel.
- College FAQs for name, establishment, management, courses, admission, fees, location, contact, faculty, placements and documents.
- Hindi/English-friendly responses.
- Optional AI API integration for broader questions.
- Verified-information guardrails: the bot does not invent fees, dates, phone numbers, affiliations or placement statistics.

## Run locally
1. Install Node.js (the project uses ES modules).
2. Run `npm install`.
3. Create your own `.env` file using your existing deployment values:
   - `PORT=5000`
   - `MONGO_URI=your_mongodb_connection_string`
   - `SESSION_SECRET=your_long_random_secret`
4. Optional AI provider:
   - `AI_API_KEY=your_provider_api_key`
   - `AI_BASE_URL=https://api.openai.com/v1` (optional; defaults to this)
   - `AI_MODEL=gpt-4o-mini` (optional; defaults to this)
5. Run `npm run dev` and open `http://localhost:5000`.

Without `AI_API_KEY` (or `OPENAI_API_KEY`), the chatbot still responds using its local college FAQ knowledge base. For open-ended AI answers, configure an AI provider key on the server. Never place the API key in frontend JavaScript.

## Files added/changed
- `routes/chatbotRoutes.js` — chatbot API and college FAQ knowledge base.
- `public/college-chatbot-widget.html` — widget markup.
- `public/css/college-chatbot.css` — responsive design.
- `public/js/college-chatbot.js` — chat interactions.
- `server.js` — mounts API and injects the widget into rendered HTML pages.

## Important
Course pages and college details can change. Confirm the current fees, admission dates, approvals, affiliations, contact details and availability with the college before publishing those details as official facts.
