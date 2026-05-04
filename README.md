# 🗺️ Journey Journal

Journey Journal is a full-stack travel journaling application that allows users to log trips, track visited countries on an interactive world map, and store memories with photos and notes.

It consists of:
- A **React (Vite) frontend**
- A **Node.js + Express backend**
- A **Supabase (PostgreSQL) database**

---

## 🚀 Features

### 🌍 Core Functionality
- Trip management (CRUD)
- Interactive world map with visited country highlighting
- Trip detail pages with photos and notes
- Dashboard with personal travel overview
- User-specific collections and data

### 🔐 Authentication
- Secure login and signup via Supabase Auth
- Row-level security policies for per-user data isolation
- Protected routes for authenticated access only

### 🗺️ Maps & Geolocation
- Interactive world map built with React Simple Maps and D3 Geo
- Google Maps embed on trip detail pages for location display
- Real-time map updates as new trips are logged

### 📸 Media
- Photo upload and storage via Supabase Storage
- Inline photo rendering on trip detail pages

---

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- TypeScript
- React Router v7
- Axios
- React Simple Maps
- D3 Geo
- Tailwind CSS
- ESLint

### Backend & Data
- Node.js
- Express
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
- @react-google-maps/api
- dotenv