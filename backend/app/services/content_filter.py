from textblob import TextBlob
from typing import Dict

class ContentFilter:
    """4-layer content filtering system for patient safety"""
    
    # Banned keywords (negative content)
    BANNED_KEYWORDS = [
        'death', 'died', 'dead', 'killed', 'murder', 'suicide', 'shooting',
        'gun', 'weapon', 'war', 'violence', 'attack', 'terror', 'bomb',
        'sad', 'tragic', 'tragedy', 'disaster', 'accident', 'crash', 'fire',
        'devastating', 'heartbreaking', 'mourning', 'grief',
        'politics', 'political', 'election', 'trump', 'biden', 'protest',
        'hate', 'angry', 'rage', 'awful', 'terrible', 'horrible',
        'depressing', 'suffer', 'pain', 'sick', 'disease', 'cancer',
        'divorce', 'breakup', 'cheating', 'abuse',
    ]
    
    # Positive keywords (boost neutral content)
    POSITIVE_KEYWORDS = [
        'puppy', 'kitten', 'baby', 'cute', 'adorable', 'sweet', 'love',
        'happy', 'joy', 'smile', 'celebrate', 'beautiful', 'amazing',
        'rescue', 'saved', 'hero', 'kind', 'wholesome', 'heartwarming',
        'success', 'win', 'celebrate', 'congratulations', 'proud',
    ]
    
    MIN_SENTIMENT_SCORE = 0.0  # Lower threshold - allow neutral content
    
    def is_content_safe(self, post_data: Dict) -> tuple[bool, float, str]:
        """Check if content is safe for patients"""
        
        # Layer 1: NSFW
        if post_data.get('nsfw', False):
            return False, 0.0, "NSFW content"
        
        # Layer 2: Keyword blacklist
        title = post_data.get('title', '').lower()
        for keyword in self.BANNED_KEYWORDS:
            if keyword in title:
                return False, 0.0, f"Contains banned keyword: {keyword}"
        
        # Layer 3: Sentiment analysis
        sentiment_score = self._analyze_sentiment(title)
        
        # Boost for positive keywords (allow if contains cute/puppy/etc)
        has_positive_keyword = any(kw in title for kw in self.POSITIVE_KEYWORDS)
        
        if has_positive_keyword:
            # Allow positive keyword content even with neutral sentiment
            return True, max(sentiment_score, 0.5), "Positive keyword detected"
        
        # Otherwise check sentiment threshold
        if sentiment_score < self.MIN_SENTIMENT_SCORE:
            return False, sentiment_score, f"Sentiment too low: {sentiment_score:.2f}"
        
        return True, sentiment_score, "All filters passed"
    
    def _analyze_sentiment(self, text: str) -> float:
        """Analyze sentiment using TextBlob"""
        if not text:
            return 0.0
        blob = TextBlob(text)
        return blob.sentiment.polarity
    
    def filter_posts(self, posts: list[Dict]) -> tuple[list[Dict], list[Dict]]:
        """Filter list of posts"""
        safe = []
        blocked = []
        
        for post in posts:
            is_safe, sentiment, reason = self.is_content_safe(post)
            post['sentiment_score'] = sentiment
            
            if is_safe:
                safe.append(post)
            else:
                blocked.append({**post, 'block_reason': reason})
        
        return safe, blocked

content_filter = ContentFilter()
