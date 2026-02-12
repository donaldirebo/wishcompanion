import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import User, Post, Interaction, Preference

async def test():
    print("🧪 Testing Wishscroll database...\n")
    
    async with AsyncSessionLocal() as session:
        # Create user
        user = User(
            email="margaret@wishscroll.com",
            password_hash="hashed_password",
            name="Margaret Chen"
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        print(f"✅ Created user: {user.email} (ID: {user.id})")
        
        # Create post
        post = Post(
            external_id="reddit_aww_abc123",
            source="reddit",
            title="Golden retriever puppy playing with ball",
            content_url="https://i.redd.it/puppy123.jpg",
            content_type="image",
            tags=["animals", "dogs", "cute", "happy"],
            post_metadata={"upvotes": 15420, "awards": 5, "subreddit": "aww"},
            sentiment_score=0.95
        )
        session.add(post)
        await session.commit()
        await session.refresh(post)
        print(f"✅ Created post: {post.title} (ID: {post.id})")
        
        # Create interaction
        interaction = Interaction(
            user_id=user.id,
            post_id=post.id,
            interaction_type="like",
            dwell_time_seconds=15
        )
        session.add(interaction)
        await session.commit()
        print(f"✅ Created interaction: User liked post")
        
        # Create preferences
        pref = Preference(
            user_id=user.id,
            preferred_tags=["animals", "nature", "humor"],
            settings={"font_size": "large", "theme": "light"}
        )
        session.add(pref)
        await session.commit()
        print(f"✅ Created preferences: {pref.preferred_tags}")
        
        # Test relationships
        await session.refresh(user)
        print(f"\n✅ User has {len(user.interactions)} interaction(s)")
        print(f"✅ User preferences: {user.preferences.preferred_tags}")
        
        print("\n🎉 WISHSCROLL DATABASE WORKING PERFECTLY!\n")
        print("All 4 tables functional:")
        print("  - users ✅")
        print("  - posts ✅")
        print("  - interactions ✅")
        print("  - preferences ✅")

asyncio.run(test())
