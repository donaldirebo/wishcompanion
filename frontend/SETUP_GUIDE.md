# WishScroll Frontend — Complete Setup Guide

## What Was Changed
1. ✅ White/light theme throughout (Login, Register, Profile, Favourites, Feed)
2. ✅ Larger action buttons (Dislike 68px, Like 68px, Favourite 80px)
3. ✅ Up/Down swipe navigation (swipe up = next post, swipe down = previous post)
4. ✅ Full routing wired up (App.tsx with auth guards)
5. ✅ AuthContext created (login, register, logout, session restore)
6. ✅ contentService created (feed, interact, favorites)
7. ✅ authService created (login, register, getMe)
8. ✅ TypeScript types created (Post, User, etc.)
9. ✅ Capacitor added for Android/iOS compilation
10. ✅ PWA meta tags added to index.html

---

## STEP 1 — Install Node.js (if not already installed)

1. Go to: https://nodejs.org
2. Download the **LTS** version (e.g. v20 or v22)
3. Run the installer, click Next through all steps
4. Verify: open Command Prompt and type:
   ```
   node --version
   npm --version
   ```
   Both should print version numbers (e.g. v20.x.x)

---

## STEP 2 — Install Project Dependencies

Open Command Prompt (or Terminal on Mac), navigate to the frontend folder:

```bash
cd path\to\wishscroll\frontend
```

Then install all packages:

```bash
npm install
```

This installs:
- React 18, TypeScript, Vite
- framer-motion (animations)
- react-swipeable (swipe gestures)
- axios (API calls)
- tailwindcss (styling)
- @capacitor/core, @capacitor/android, @capacitor/ios (mobile)

---

## STEP 3 — Start the Development Preview

Make sure Donald's backend is running first (docker-compose or local FastAPI).

Then start the frontend:

```bash
npm run dev
```

Open your browser at: **http://localhost:5173**

You will see the WishScroll app with:
- White clean background with glowing accents
- Login / Register screens
- Full swipe feed (left=dislike, right=like, up=next, down=previous)
- Larger buttons
- Profile and Favourites pages

### Hot Reload
Any file you save will instantly update in the browser — no need to restart.

---

## STEP 4 — Test on Your Phone (Mobile Browser Preview)

While `npm run dev` is running, find your computer's local IP:

**Windows:**
```
ipconfig
```
Look for "IPv4 Address" (e.g. 192.168.1.45)

**Mac:**
```
ifconfig | grep inet
```

Then on your phone (same WiFi), open:
```
http://192.168.1.45:5173
```

This lets you test swipe gestures on a real phone immediately.

---

## STEP 5 — Build for Production

When ready to compile to a final build:

```bash
npm run build
```

This creates a `dist/` folder with optimised files ready for deployment.

---

## STEP 6 — Compile as Android App (APK)

### Prerequisites
- Install **Android Studio**: https://developer.android.com/studio
- During install, also install Android SDK (it will prompt you)
- Install **Java JDK 17+**: https://adoptium.net

### Steps

1. Build the web app:
   ```bash
   npm run build
   ```

2. Add Android platform (first time only):
   ```bash
   npm run cap:add:android
   ```

3. Sync your web build into Capacitor:
   ```bash
   npm run cap:sync
   ```

4. Open Android Studio:
   ```bash
   npm run cap:open:android
   ```

5. In Android Studio:
   - Wait for Gradle to sync (bottom progress bar)
   - Click the green ▶ **Run** button
   - Choose an emulator or your physical phone (plug in via USB, enable USB debugging)
   - The WishScroll app will launch on the device!

6. To generate an APK for sharing:
   - In Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**
   - APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## STEP 7 — Compile as iPhone App (iOS)

> Requires a Mac computer and Xcode

1. Install Xcode from the Mac App Store
2. Build and add iOS:
   ```bash
   npm run build
   npm run cap:add:ios
   npm run cap:sync
   npm run cap:open:ios
   ```
3. In Xcode, select a simulator or connected iPhone and click ▶ Run

---

## STEP 8 — Deploy Frontend Online (Vercel)

1. Push your frontend folder to GitHub
2. Go to https://vercel.com → New Project → Import from GitHub
3. Set root directory to `frontend`
4. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://wishscroll-backend.railway.app/api/v1`
5. Click Deploy
6. Your app will be live at `https://wishscroll.vercel.app`

---

## Project Structure

```
frontend/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx       ← Login state, auth guards
│   ├── services/
│   │   ├── apiClient.ts          ← Axios with JWT interceptor
│   │   ├── authService.ts        ← Login, register, getMe
│   │   └── contentService.ts     ← Feed, interact, favorites
│   ├── types/
│   │   └── api.ts                ← TypeScript types (Post, User, etc.)
│   ├── components/
│   │   └── ContentSwiper.tsx     ← Main swipe feed (updated)
│   ├── pages/
│   │   ├── Login.tsx             ← White theme login
│   │   ├── Register.tsx          ← White theme register
│   │   ├── Home.tsx              ← Feed page
│   │   ├── Profile.tsx           ← User profile
│   │   └── Favourites.tsx        ← Saved content
│   ├── App.tsx                   ← Router + auth guards (updated)
│   ├── index.css                 ← Design system + Tailwind (updated)
│   └── main.tsx                  ← Entry point
├── .env                          ← API URL config
├── capacitor.config.ts           ← Mobile app config
├── tailwind.config.js            ← Tailwind setup
├── package.json                  ← All dependencies
└── index.html                    ← PWA meta tags (updated)
```

---

## Swipe Controls Summary

| Gesture        | Action              |
|----------------|---------------------|
| Swipe Left     | Dislike (skip post) |
| Swipe Right    | Like post           |
| Swipe Up       | Next post           |
| Swipe Down     | Previous post       |
| Tap 💜 Button  | Save to Favourites  |

---

## Common Issues

**"Module not found" errors**
→ Run `npm install` again

**Blank white screen**
→ Check browser console (F12) for errors
→ Make sure backend is running at localhost:8000

**Can't connect to backend**
→ Check `.env` file has correct VITE_API_URL
→ Make sure Docker / backend is running

**Android build fails**
→ Make sure Android Studio and JDK 17 are installed
→ Run `npm run build` before `cap:sync`

---

*WishScroll — Your daily dose of joy 🌟*
*Frontend: Reuben Comla | Backend: Donald Irebo*
