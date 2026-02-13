# 🎨 Wishscroll - Happy Scrolling

> NEW positive content app for hospital and hospice patients

[![Project Board](https://img.shields.io/badge/Project-Board-blue)](https://github.com/users/donaldirebo/projects/2)

## 📖 What is Wishscroll?

Wishscroll is a **brand new content curation platform** being built from scratch to bring joy to hospital and hospice patients through curated positive content.

**Current Situation at Wishplay:**
When patients want to view these saved posts, they currently log into the staff's Reddit account on their devices. This approach has problems:
- Patients are exposed to ALL of Reddit (negative news, politics, toxic content)
- Only one account can be used at a time
- No personalization for individual patients
- Clunky user experience
- No content filtering or safety controls

**Our Solution (NEW App - Wishscroll):**
Build a dedicated Progressive Web App that:
- Shows ONLY curated positive content
- Has automated content filtering
- Personalizes to each patient's preferences
- Provides safe, controlled environment
- Scales to multiple patients simultaneously
- Modern, accessible interface

**This is a greenfield project** - we're building Wishscroll from the ground up!

## ✨ Core Features (Being Built)

### 🖼️ Content Sources (RSS-Based)
- **YouTube Videos** - Via RSS feeds from positive channels
  - The Dodo, BBC Earth, National Geographic, animal channels
  - NO API quotas - unlimited scaling!
- **Reddit Posts** - Via RSS feeds from positive subreddits  
  - r/aww, r/MadeMeSmile, r/UpliftingNews, etc.
  - NO API quotas - unlimited scaling!
- **Imgur Images** - Via API (generous free tier)

### 📱 youboop.com-Inspired Interface (NEW!)
- Full-screen vertical content display
- Circular navigation buttons (◄ Back, Next ►)
- Auto-play mode (shiya801's innovation!)
- Swipe gestures
- Like/Save/Share functionality

### 🎯 4-Layer Content Filtering (NEW!)
1. NSFW blocking
2. Keyword blacklist (death, war, politics, etc.)
3. Sentiment analysis (positive only)
4. Quality thresholds (upvote minimums)

### 💫 Personalization (NEW!)
- Learns what each patient enjoys
- Adjusts content based on likes/dislikes
- Category preferences
- Individual user profiles

## 🏗️ Tech Stack

**Frontend:** React 18 + TypeScript + Vite + PWA  
**Backend:** FastAPI + PostgreSQL + Redis + Celery  
**Content:** YouTube RSS + Reddit RSS + Imgur API  
**Deployment:** Vercel + Railway  

## 📅 Development Timeline

**Project Started:** Feb 11, 2026  
**Target Completion:** June 2026 (16 weeks)

- 🏗️ **Phase 1:** Foundation (Weeks 1-4) ← IN PROGRESS (27% done!)
- 🎨 **Phase 2:** Content System (Weeks 5-7)
- 📱 **Phase 3:** User Interface (Weeks 8-9)
- 🧪 **Phase 4:** Testing (Weeks 10-12)
- 📝 **Phase 5:** Thesis (Weeks 13-16)

## 👥 Development Team

- **Donald Irebo** - Backend Lead (Database, APIs, Content System)
- **Reuben Comla** - Frontend Lead (React, UI/UX, PWA)
- **shiya801** - PM / QA (Auto-play feature innovator!)
- **empressT** - Documentation / Research

## 🎓 Academic Context

**Program:** MSc in Cyber-Physical Systems  
**University:** Northeastern University  
**Student:** Donald Irebo  
**Expected Completion:** June 2026  
**Project Type:** Thesis - Healthcare Technology

## 📊 Current Progress

**Completed (4/15 issues):**
- ✅ Repository structure
- ✅ PostgreSQL database (4 tables)
- ✅ FastAPI backend with routers
- ✅ JWT authentication system

**In Progress:**
- 🏗️ RSS content ingestion (YouTube, Reddit)
- 🏗️ Content filtering system
- 🏗️ Frontend development

**Board:** https://github.com/users/donaldirebo/projects/2

---

⭐ **This is a brand new application** - building safe digital spaces from scratch  
💡 Special thanks to shiya801 for auto-play innovation!
