# 🎨 Wishscroll - Happy Scrolling

> Safe, positive content app for hospital and hospice patients

[![Project Board](https://img.shields.io/badge/Project-Board-blue)](https://github.com/users/donaldirebo/projects/2)

## 📖 What is Wishscroll?

Wishscroll is a content curation platform that brings joy to hospital and hospice patients by providing a safe, positive alternative to traditional social media. Inspired by youboop.com's clean interface with auto-play capabilities.

**The Problem:**
For 10 years, Wishplay organization has been saving uplifting posts from Reddit and social media. Currently, patients access these by logging into staff accounts - exposing them to ALL content (negative news, politics, toxic comments).

**The Solution:**
A dedicated PWA showing ONLY curated positive content with smart filtering and personalized recommendations.

## ✨ Core Features

### 🖼️ Content Sources (RSS-Based - No API Quotas!)
- **YouTube Videos** - Via RSS feeds from positive channels (unlimited!)
  - The Dodo, BBC Earth, National Geographic, animal channels
- **Reddit Posts** - Via RSS feeds from positive subreddits (unlimited!)
  - r/aww, r/MadeMeSmile, r/UpliftingNews, r/wholesome, etc.
- **Imgur Images** - Via API (generous 12,500/day limit)

**Why RSS?** Unlimited scaling - serve 10 or 10,000 users with zero quota concerns!

### 📱 youboop.com-Inspired Interface
- **Full-screen vertical display** (mobile-optimized)
- **Circular navigation buttons** (bottom corners)
  - ◄ Back button (left)
  - ► Next button (right)
- **Swipe gestures** (left=back, right=next)
- **Auto-play mode** (shiya801's innovation!)
  - Auto-advance after 3s/5s/10s
  - Perfect for low-energy patients
  - Toggle on/off anytime

### 🎯 Smart Content Filtering
**4-Layer Safety System:**
1. **NSFW Filter** - Block adult content
2. **Keyword Blacklist** - Block negative words (death, war, politics, sad, etc.)
3. **Sentiment Analysis** - Only show positive content (score > 0.4)
4. **Quality Filter** - Minimum upvote/view thresholds

### 💫 User Features
- ❤️ Like/Dislike tracking
- ⭐ Save favorites
- ↗️ Share with family
- 🎲 Shuffle mode (random content)
- 🎯 Personalization (learns preferences)
- 📊 Filter by: New, Trending, Top, Category

### ♿ Accessibility
- Large touch targets (56x56px buttons)
- High contrast (white buttons on dark backgrounds)
- Adjustable font sizes
- Simple, clear navigation
- Designed for elderly/ill patients

## 🏗️ Tech Stack

**Frontend:** React 18 + TypeScript + Vite + PWA  
**Backend:** FastAPI (Python) + PostgreSQL + Redis + Celery  
**Content:** YouTube RSS + Reddit RSS + Imgur API  
**Parsing:** feedparser (RSS), TextBlob (sentiment)  
**Deployment:** Vercel (frontend) + Railway (backend)  
**DevOps:** Docker + GitHub Actions

## 📊 Architecture Highlights

**Scalable Content Ingestion:**
```
Celery (every hour) → Fetch RSS feeds → Filter content → Store in PostgreSQL
Users → Read from database (instant, no quotas!)
```

**Why This Scales:**
- RSS feeds have NO quotas
- External APIs called once/hour (not per user!)
- Can serve unlimited users from cached database
- $0 content costs forever

## 📅 Timeline (12 Weeks)

- 🏗️ **Phase 1:** Foundation (Weeks 1-4) - Database, Auth, API ✅ 27% Complete!
- 🎨 **Phase 2:** Content System (Weeks 5-7) - RSS feeds, filtering
- 📱 **Phase 3:** User Interface (Weeks 8-9) - youboop.com-style swiper, auto-play
- 🧪 **Phase 4:** Testing & Polish (Weeks 10-12) - User testing, deployment
- 📝 **Phase 5:** Thesis (Weeks 13-16) - Documentation, defense

## 👥 Team

- **Donald Irebo** (donaldirebo) - Backend Lead
- **Reuben Comla** (ReubenComla) - Frontend Lead  
- **shiya801** - PM / QA (auto-play feature idea!)
- **empressT** (empress-t-png) - Documentation / Research

## 🎓 Academic Context

**Program:** MSc in Cyber-Physical Systems  
**University:** Northeastern University  
**Completion:** June 2026  
**Focus:** Scalable content curation for healthcare wellness

## 🚀 Quick Start
```bash
git clone https://github.com/donaldirebo/wishcompanion.git
cd wishcompanion

# Start services
docker-compose up -d db redis

cd backend
uvicorn app.main:app --reload

# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 📊 Project Tracking

**Board:** https://github.com/users/donaldirebo/projects/2  
**Progress:** 4/15 issues complete (27%)

---

⭐ Creating safe digital spaces for vulnerable populations  
💡 Special thanks to shiya801 for auto-play feature concept!
