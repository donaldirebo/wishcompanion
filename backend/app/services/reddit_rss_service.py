import feedparser
import re
from typing import List, Dict

class RedditRSSService:
    POSITIVE_SUBREDDITS = ['aww', 'Eyebleach', 'MadeMeSmile', 'UpliftingNews', 'HumansBeingBros']
    
    def fetch_posts_from_subreddits(self, limit_per_sub: int = 15):
        all_posts = []
        print(f"Fetching from {len(self.POSITIVE_SUBREDDITS)} subreddits...")
        
        for subreddit in self.POSITIVE_SUBREDDITS:
            try:
                rss_url = f"https://www.reddit.com/r/{subreddit}/.rss?limit={limit_per_sub}"
                feed = feedparser.parse(rss_url)
                
                for entry in feed.entries:
                    content_url = entry.link
                    if hasattr(entry, 'content'):
                        img_match = re.search(r'<img[^>]+src="([^"]+)"', entry.content[0].value)
                        if img_match:
                            content_url = img_match.group(1).replace('&amp;', '&')
                    
                    all_posts.append({
                        "external_id": f"reddit_{entry.id.split('_')[-1] if '_' in entry.id else entry.id}",
                        "source": "reddit",
                        "title": entry.title,
                        "content_url": content_url,
                        "content_type": "image",
                        "tags": [subreddit.lower()],
                        "post_metadata": {"subreddit": subreddit}
                    })
                
                print(f"  ✅ r/{subreddit}: {len(feed.entries)} posts")
            except Exception as e:
                print(f"  ⚠️  r/{subreddit}: {e}")
        
        return all_posts

reddit_rss_service = RedditRSSService()
