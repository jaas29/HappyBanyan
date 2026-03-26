## Team

- Hugo Cruz
- Jose Araya
- Sebastian Rodriguez
- Bruno Valdez
- Darius Beckford

# Happy Banyan

A family wellness app that helps elderly users and their caretakers stay connected, manage daily tasks, and track well-being through a gamified growing Banyan tree metaphor.

## Features

- **Virtual Banyan Tree** — Grows through 4 stages as you complete tasks, providing visual motivation
- **Task Management** — Create, edit, and track tasks with categories (Medicine, Appointment, Grocery, Personal, Other) across daily and weekly views
- **Family Messaging** — Real-time chat between caretaker and elder, connected via a shared family code
- **Shared Tasks** — View your partner's tasks in read-only mode
- **Daily Check-Ins** — Mood tracking (Sad / Okay / Great) prompted each day on the dashboard
- **Weather** — Real-time weather for two preset locations (Sarasota, FL and Thousand Oaks, CA)
- **Quick Links** — Curated shortcuts to popular sites (NYT, YouTube, Google, Wikipedia, Amazon, etc.)
- **Email Tasks** — Export your or your partner's task list via EmailJS
- **Background Music** — Toggleable background music with volume control
- **Cheer Me Up** — Interactive popup on the dashboard

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router DOM 7, Vite 7 |
| Backend / DB | Firebase (Auth + Firestore) |
| Styling | Tailwind CSS 4 |
| Audio | Howler.js |
| Email | EmailJS |
| Weather | OpenWeatherMap API |
| PDF | jsPDF |
| Notifications | React Hot Toast |
| Prototyping | Figma |

## References

- [React](https://react.dev/) — Frontend UI library
- [React Router DOM](https://reactrouter.com/) — Client-side routing
- [Vite](https://vitejs.dev/) — Build tool and development server
- [Firebase](https://firebase.google.com/docs) — Authentication and Firestore database
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Howler.js](https://howlerjs.com/) — Audio playback library
- [EmailJS](https://www.emailjs.com/docs/) — Client-side email sending
- [OpenWeatherMap API](https://openweathermap.org/api) — Real-time weather data
- [jsPDF](https://github.com/parallax/jsPDF) — PDF generation in the browser
- [React Hot Toast](https://react-hot-toast.com/) — Toast notifications
- [Figma](https://www.figma.com/) — UI/UX prototyping and design
- [ChatGPT](https://openai.com/chatgpt) — Tree stage images generated via ChatGPT

## Getting Started

### Prerequisites

- Node.js v16+
- A [Firebase](https://firebase.google.com/) project (Auth + Firestore enabled)
- An [OpenWeatherMap](https://openweathermap.org/api) API key
- An [EmailJS](https://www.emailjs.com/) account (service, template, and public key)

### Installation

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd HappyBanyan

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in .env with your credentials (see below)

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the project root using `.env.example` as a template:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# OpenWeatherMap
VITE_OPENWEATHERMAP_API_KEY=

# EmailJS
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## How It Works

### Family Connection

During registration, users choose a role (Caretaker or Elder) and enter a shared **family code**. This code links the two accounts so they can message each other and view each other's tasks.

### Tree Growth

Completing tasks increments a counter on the user's profile. The Banyan tree advances through 4 stages:

| Stage | Completed Tasks |
|---|---|
| Sprout | 0–5 |
| Young Tree | 6–15 |
| Growing Banyan | 16–30 |
| Full Banyan | 31+ |


## Project Structure

```
src/
├── App.jsx               # Router setup & music toggle
├── main.jsx              # Entry point
├── components/
│   ├── CheerMeUpPopup.jsx
│   ├── DailyCheckIn.jsx
│   ├── ProtectedRoute.jsx
│   ├── WeatherFeatured.jsx
│   └── WeatherPanel.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   ├── Tasks.jsx
│   ├── Messages.jsx
│   ├── SharedTasks.jsx
│   ├── Weather.jsx
│   ├── QuickLinks.jsx
│   └── Settings.jsx
├── firebase/
│   └── config.js
├── utils/
│   └── openWeather.js
└── assets/
    ├── music/
    ├── logos/
    └── tree/
```
