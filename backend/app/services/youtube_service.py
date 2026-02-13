import feedparser
from typing import List, Dict

class YouTubeRSSService:
    POSITIVE_CHANNELS = {
        'The Dodo': 'UCIveFvW-ARp_B1o4pwujFgw',
        'BBC Earth': 'UCwmZiChSryoWQCZMIQezgTg',
        'National Geographic': 'UCpVm7bg6pXKo1Pr6k5kxG9A',
    }
    
    def fetch_videos_from_channels(self, max_per_channel: int = 10):
        all_videos = []
        print(f"Fetching from {len(self.POSITIVE_CHANNELS)} channels...")
        
        for channel_name, channel_id in self.POSITIVE_CHANNELS.items():
            try:
                rss_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
                feed = feedparser.parse(rss_url)
                
                for entry in feed.entries[:max_per_channel]:
                    video_id = entry.yt_videoid if hasattr(entry, 'yt_videoid') else entry.id.split(':')[-1]
                    all_videos.append({
                        "external_id": f"youtube_{video_id}",
                        "source": "youtube",
                        "title": entry.title,
                        "content_url": entry.link,
                        "content_type": "video",
                        "tags": ["youtube", "video"],
                        "post_metadata": {"channel": channel_name, "video_id": video_id}
                    })
                print(f"  ✅ {channel_name}: {len(feed.entries[:max_per_channel])} videos")
            except Exception as e:
                print(f"  ⚠️  {channel_name}: {e}")
        
        return all_videos

youtube_service = YouTubeRSSService()
