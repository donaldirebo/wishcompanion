import aiohttp
from typing import List, Dict
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class ImgurService:
    """Production Imgur service with error handling"""
    
    def __init__(self):
        self.base_url = "https://api.imgur.com/3"
        self.headers = {}
        if settings.IMGUR_CLIENT_ID:
            self.headers['Authorization'] = f'Client-ID {settings.IMGUR_CLIENT_ID}'
    
    async def fetch_viral_gallery(self, limit: int = 60):
        """Fetch viral content from Imgur"""
        
        logger.info("Fetching from Imgur")
        posts = []
        
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/gallery/hot/viral/0"
                
                async with session.get(url, headers=self.headers, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        for item in data.get('data', [])[:limit]:
                            if item.get('nsfw'):
                                continue
                            
                            post_data = self._extract_post_data(item)
                            if post_data:
                                posts.append(post_data)
                        
                        logger.info(f"Imgur: {len(posts)} posts")
                    else:
                        logger.error(f"Imgur error: {response.status}")
                        
        except Exception as e:
            logger.error(f"Imgur fetch failed: {e}")
        
        return posts
    
    def _extract_post_data(self, item):
        """Extract post data"""
        
        try:
            if item.get('is_album'):
                images = item.get('images', [])
                if not images:
                    return None
                item = images[0]
            
            content_type = "video" if item.get('type', '').startswith('video') else "image"
            
            return {
                "external_id": f"imgur_{item.get('id')}",
                "source": "imgur",
                "title": item.get('title') or 'Untitled',
                "content_url": item.get('link'),
                "content_type": content_type,
                "tags": ["imgur"],
                "post_metadata": {
                    "views": item.get('views', 0),
                    "ups": item.get('ups', 0),
                }
            }
        except:
            return None

imgur_service = ImgurService()
