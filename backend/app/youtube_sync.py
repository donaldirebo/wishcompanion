import xml.etree.ElementTree as ET
from datetime import datetime
from app.database import SessionLocal
from app.models import Post

# ─────────────────────────────────────────────
# ADD YOUR YOUTUBE PLAYLIST IDs HERE (one per line in the list)
# To find a playlist ID:
#   1. Go to YouTube and open any playlist
#   2. Copy the URL - e.g. https://youtube.com/playlist?list=PLxxxxxxxx
#   3. The playlist ID is the part after "list=" e.g. PLxxxxxxxx
# ─────────────────────────────────────────────
PLAYLIST_IDS = [
    "PLqNVAh4vnnHGYoNaLbStSCSt4qOFNf2A4",
]

YT_RSS_URL = "https://www.youtube.com/feeds/videos.xml?playlist_id={playlist_id}"


def fetch_playlist(playlist_id: str) -> dict:
    """Fetch a YouTube playlist RSS feed and return videos + category name."""
    import urllib.request
    url = YT_RSS_URL.format(playlist_id=playlist_id)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "WishScroll/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read()
    except Exception as e:
        print(f"[youtube_sync] Failed to fetch playlist {playlist_id}: {e}")
        return {"category": "", "items": {}}

    try:
        root = ET.fromstring(body)
    except ET.ParseError as e:
        print(f"[youtube_sync] Failed to parse XML for {playlist_id}: {e}")
        return {"category": "", "items": {}}

    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt":   "http://www.youtube.com/xml/schemas/2015",
        "media":"http://search.yahoo.com/mrss/",
    }

    # Use playlist title as category name (mirrors the plugin logic)
    title_el = root.find("atom:title", ns)
    category = title_el.text.strip() if title_el is not None and title_el.text else f"Playlist {playlist_id}"

    items = {}
    for entry in root.findall("atom:entry", ns):
        vid_el = entry.find("yt:videoId", ns)
        if vid_el is None or not vid_el.text:
            continue
        video_id = vid_el.text.strip()

        title_el = entry.find("atom:title", ns)
        title = title_el.text.strip() if title_el is not None and title_el.text else "Untitled"

        items[video_id] = {
            "video_id":   video_id,
            "title":      title,
            "category":   category,
            "embed_url":  f"https://www.youtube.com/embed/{video_id}",
        }

    print(f"[youtube_sync] Playlist '{category}': {len(items)} videos fetched")
    return {"category": category, "items": items}


def sync_all_playlists():
    """
    Replicates the WordPress plugin's sync_all() exactly:
    - Fetches all playlist RSS feeds
    - Merges videos (deduplicates by video_id)
    - Clears existing posts and replaces with fresh data
    """
    if not PLAYLIST_IDS:
        print("[youtube_sync] No playlist IDs configured. Add them to PLAYLIST_IDS in youtube_sync.py")
        return

    merged = {}  # video_id -> item data

    for pid in PLAYLIST_IDS:
        feed = fetch_playlist(pid)
        for vid, data in feed["items"].items():
            if vid not in merged:
                merged[vid] = data
            else:
                print(f"[youtube_sync] Duplicate video {vid} skipped")

    if not merged:
        print("[youtube_sync] No videos fetched. Check your playlist IDs.")
        return

    db = SessionLocal()
    try:
        from app.models import Interaction

        # Delete interactions first to avoid foreign key constraint errors
        post_ids = [p.id for p in db.query(Post).all()]
        if post_ids:
            db.query(Interaction).filter(Interaction.post_id.in_(post_ids)).delete(synchronize_session=False)
        db.query(Post).delete(synchronize_session=False)
        db.commit()
        print(f"[youtube_sync] Cleared all existing posts and interactions")

        # Insert fresh posts from RSS feeds
        for vid, data in merged.items():
            post = Post(
                title=data["title"],
                content_url=data["embed_url"],
                content_type="video",
                source="youtube",
                tags=f"youtube,{data['category'].lower().replace(' ', '_')}",
                created_at=datetime.utcnow(),
            )
            db.add(post)

        db.commit()
        print(f"[youtube_sync] Synced {len(merged)} YouTube videos into database")

    except Exception as e:
        db.rollback()
        print(f"[youtube_sync] Database error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    sync_all_playlists()