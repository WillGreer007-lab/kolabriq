# Adswish: Premium Creator Marketplace

Adswish is a full-stack, production-ready Creator Marketplace built with Next.js, Supabase, and Stripe. It seamlessly connects premium brands with high-converting creators, complete with escrow payouts, deliverable tracking, and accountability engines.

## 🚀 Features

- **Business & Creator Dashboards:** Custom portals for brands to launch campaigns and creators to find work.
- **Campaign Engine:** Strict deliverable slots, approval workflows, and a 1-30 day attribution tracker.
- **Accountability Engine (pg_cron):** Automated PostgreSQL cron jobs that enforce 12-hour pixel penalties and 1-hour missed deadline kicks.
- **Financial Routing (Stripe):** Integrated Stripe Checkout and Connect Express, featuring automated 90/10 destination charge splits for escrow payouts.
- **Realtime Chat & File Sharing:** Native 1-on-1 messaging powered by Supabase WebSockets, with built-in Cloudinary file attachments.
- **Native Mac Desktop App:** An Electron wrapper that utilizes `fluent-ffmpeg` to natively compress and process high-resolution video files directly on your computer's CPU before uploading!

---

## 💻 Installation Instructions

To run Adswish locally, follow these steps:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and npm installed on your machine.
You will also need to duplicate `.env.example` into `.env.local` and fill in your Supabase, Stripe, and Cloudinary keys.

### 2. Install Dependencies
```bash
# Clone the repository
git clone https://github.com/WillGreer007-lab/kolabriq.git
cd kolabriq

# Install all required packages
npm install
```

### 3. Running the Web Platform (Browser)
If you just want to run the standard Next.js website in your browser:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🖥️ Adswish Desktop App (Native Video Editing)

Adswish comes with a native **macOS Desktop Application** built via Electron. This Desktop App unlocks the "Mac Native Compression" feature, allowing Creators to securely trim and compress huge 4K video files using their local CPU hardware (FFmpeg) rather than relying on browser uploads.

### How to install and launch the Desktop App:

```bash
# 1. Ensure you have installed the desktop-specific dev dependencies
npm install -D electron electron-builder concurrently wait-on

# 2. Launch the Desktop App
npm run dev:desktop
```

This command will automatically boot up your local Next.js server in the background and instantly open the sleek, native macOS application window! Navigate to your **Creator > My Campaigns** page inside the Desktop App to see the exclusive native video processing features.

### Building for Production (Creating the .dmg Installer)
To compile the Desktop App into a standalone macOS `.dmg` or `.app` installer that you can distribute to creators:
```bash
npm run build:desktop
```
The packaged installers will be generated inside the `/dist` folder.

---

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router) + TypeScript
- **Database, Auth, Storage, WebSockets:** Supabase
- **Styling:** Vanilla CSS (`globals.css`) + Custom Pixis UI tokens
- **Payments:** Stripe Checkout & Connect Express
- **Video Processing:** Cloudinary (Web) + FFmpeg (Desktop)
- **Desktop Wrapper:** Electron
