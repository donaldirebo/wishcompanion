Fetch positive content from YouTube and Reddit using RSS feeds instead of APIs for unlimited scaling.

## Why RSS Instead of APIs?
- NO quotas or rate limits
- NO API keys needed  
- Scales to unlimited users
- FREE forever
- Simpler implementation

## YouTube RSS Integration

Channels to Monitor (20+):
- The Dodo (animal rescue)
- BBC Earth (nature)
- National Geographic (wildlife)
- Brave Wilderness
- Baby Animals compilations

Implementation:
```
RSS URL: https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
Library: feedparser
```

## Reddit RSS Integration

Subreddits: r/aww, r/Eyebleach, r/MadeMeSmile, r/UpliftingNews, r/HumansBeingBros

Implementation:
```
RSS URL: https://www.reddit.com/r/SUBREDDIT/.rss
Multi: https://www.reddit.com/r/aww+Eyebleach/.rss
```

## Tasks
- Install feedparser
- Create YouTubeRSSService
- Create RedditRSSService  
- Parse feeds and extract content
- Test with 10+ sources

Assignee: donaldirebo
