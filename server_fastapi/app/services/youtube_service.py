"""
YouTube Video Search and Curation Service
Searches YouTube for AI tool tutorials and creates structured learning content
"""

import aiohttp
import asyncpg
from typing import List, Dict, Optional
from urllib.parse import quote_plus
import re
import json

class YouTubeService:
    """Service for searching and curating YouTube tutorial videos"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://www.googleapis.com/youtube/v3"
    
    async def search_tool_tutorials(
        self,
        tool_name: str,
        max_results: int = 5,
        min_duration: int = 300,  # 5 minutes minimum
        max_duration: int = 3600  # 1 hour maximum
    ) -> List[Dict]:
        """
        Search YouTube for tutorial videos about a specific AI tool
        
        Args:
            tool_name: Name of the AI tool
            max_results: Maximum number of videos to return
            min_duration: Minimum video duration in seconds
            max_duration: Maximum video duration in seconds
            
        Returns:
            List of video information dictionaries
        """
        
        print(f"\n🔍 Searching YouTube for: {tool_name}")
        
        # If no API key, use mock data for development
        if not self.api_key or self.api_key == "your_youtube_api_key_here" or len(self.api_key) < 30:
            print(f"⚠️  No valid YouTube API key (length: {len(self.api_key) if self.api_key else 0}), using mock data for {tool_name}")
            return await self._generate_mock_videos(tool_name, max_results)
        
        try:
            print(f"✅ Using YouTube API to search for {tool_name} tutorials...")
            # Search for videos
            search_query = f"{tool_name} tutorial beginner guide"
            videos = await self._youtube_search(search_query, max_results * 2)
            
            print(f"📹 Found {len(videos)} videos for {tool_name}")
            
            # Filter and rank videos
            filtered_videos = []
            for video in videos:
                duration = video.get('duration_seconds', 0)
                if min_duration <= duration <= max_duration:
                    filtered_videos.append(video)
            
            # Sort by relevance and quality indicators
            filtered_videos.sort(key=lambda x: (
                x.get('view_count', 0) > 1000,  # Has decent views
                x.get('like_ratio', 0),  # Good like ratio
                -abs(x.get('duration_seconds', 0) - 900)  # Prefer ~15 min videos
            ), reverse=True)
            
            final_videos = filtered_videos[:max_results]
            print(f"✨ Selected {len(final_videos)} best videos for {tool_name}")
            
            return final_videos
            
        except Exception as e:
            print(f"❌ Error searching YouTube for {tool_name}: {e}")
            print(f"⚠️  Falling back to mock data for {tool_name}")
            return await self._generate_mock_videos(tool_name, max_results)
    
    async def _youtube_search(self, query: str, max_results: int) -> List[Dict]:
        """Make actual YouTube API search request"""
        
        search_url = f"{self.base_url}/search"
        params = {
            'part': 'snippet',
            'q': query,
            'type': 'video',
            'maxResults': max_results,
            'videoDuration': 'medium',  # 4-20 minutes
            'videoEmbeddable': 'true',
            'relevanceLanguage': 'en',
            'key': self.api_key
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(search_url, params=params) as response:
                if response.status != 200:
                    raise Exception(f"YouTube API error: {response.status}")
                
                data = await response.json()
                video_ids = [item['id']['videoId'] for item in data.get('items', [])]
                
                # Get detailed video information
                return await self._get_video_details(video_ids)
    
    async def _get_video_details(self, video_ids: List[str]) -> List[Dict]:
        """Get detailed information for video IDs"""
        
        if not video_ids:
            return []
        
        details_url = f"{self.base_url}/videos"
        params = {
            'part': 'snippet,contentDetails,statistics',
            'id': ','.join(video_ids),
            'key': self.api_key
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(details_url, params=params) as response:
                if response.status != 200:
                    raise Exception(f"YouTube API error: {response.status}")
                
                data = await response.json()
                
                videos = []
                for item in data.get('items', []):
                    video = self._parse_video_data(item)
                    videos.append(video)
                
                return videos
    
    def _parse_video_data(self, item: Dict) -> Dict:
        """Parse YouTube API video data into our format"""
        
        snippet = item.get('snippet', {})
        statistics = item.get('statistics', {})
        content_details = item.get('contentDetails', {})
        
        # Parse duration from ISO 8601 format (PT15M30S)
        duration_str = content_details.get('duration', 'PT0S')
        duration_seconds = self._parse_duration(duration_str)
        
        view_count = int(statistics.get('viewCount', 0))
        like_count = int(statistics.get('likeCount', 0))
        
        # Calculate like ratio
        like_ratio = like_count / view_count if view_count > 0 else 0
        
        return {
            'video_id': item['id'],
            'title': snippet.get('title', ''),
            'description': snippet.get('description', ''),
            'channel_name': snippet.get('channelTitle', ''),
            'channel_id': snippet.get('channelId', ''),
            'thumbnail_url': snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
            'published_at': snippet.get('publishedAt', ''),
            'duration_seconds': duration_seconds,
            'view_count': view_count,
            'like_count': like_count,
            'like_ratio': like_ratio,
            'embed_url': f"https://www.youtube.com/embed/{item['id']}",
            'watch_url': f"https://www.youtube.com/watch?v={item['id']}"
        }
    
    def _parse_duration(self, duration_str: str) -> int:
        """Parse ISO 8601 duration to seconds (PT15M30S -> 930)"""
        
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration_str)
        
        if not match:
            return 0
        
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        
        return hours * 3600 + minutes * 60 + seconds
    
    async def _generate_mock_videos(self, tool_name: str, count: int) -> List[Dict]:
        """Generate mock video data for development without API key"""
        
        mock_templates = [
            {
                'title_template': '{tool} Complete Tutorial for Beginners',
                'duration': 900,
                'views': 125000,
                'channel': 'Tech Academy'
            },
            {
                'title_template': 'Getting Started with {tool} - Full Course',
                'duration': 1200,
                'views': 89000,
                'channel': 'AI Learning Hub'
            },
            {
                'title_template': '{tool} Tutorial - Master in 15 Minutes',
                'duration': 900,
                'views': 156000,
                'channel': 'Quick Learn'
            },
            {
                'title_template': 'How to Use {tool} - Step by Step Guide',
                'duration': 720,
                'views': 67000,
                'channel': 'Digital Skills'
            },
            {
                'title_template': '{tool} for Professionals - Advanced Tips',
                'duration': 1500,
                'views': 45000,
                'channel': 'Pro Tech Tips'
            }
        ]
        
        videos = []
        for i, template in enumerate(mock_templates[:count]):
            video_id = f"mock_{tool_name.lower().replace(' ', '_')}_{i+1}"
            
            videos.append({
                'video_id': video_id,
                'title': template['title_template'].format(tool=tool_name),
                'description': f"Learn {tool_name} from scratch. This comprehensive tutorial covers all the basics and advanced features.",
                'channel_name': template['channel'],
                'channel_id': f'channel_{i+1}',
                'thumbnail_url': f'https://img.youtube.com/vi/{video_id}/hqdefault.jpg',
                'published_at': '2024-01-01T00:00:00Z',
                'duration_seconds': template['duration'],
                'view_count': template['views'],
                'like_count': int(template['views'] * 0.05),
                'like_ratio': 0.05,
                'embed_url': f'https://www.youtube.com/embed/{video_id}',
                'watch_url': f'https://www.youtube.com/watch?v={video_id}',
                'is_mock': True
            })
        
        return videos
    
    async def create_lesson_structure(
        self,
        tool_name: str,
        tool_description: str,
        videos: List[Dict]
    ) -> List[Dict]:
        """
        Create a structured lesson plan from videos
        
        Args:
            tool_name: Name of the tool
            tool_description: Description of what the tool does
            videos: List of video data
            
        Returns:
            List of structured lessons
        """
        
        lessons = []
        
        # Lesson 1: Introduction (shortest video or first 10 min of longest)
        if videos:
            intro_video = min(videos, key=lambda x: x['duration_seconds'])
            lessons.append({
                'lesson_order': 1,
                'lesson_type': 'video',
                'lesson_title': f'Introduction to {tool_name}',
                'lesson_description': f'Get started with {tool_name} and learn the basics.',
                'video_data': intro_video,
                'estimated_minutes': max(10, intro_video['duration_seconds'] // 60)
            })
        
        # Lesson 2-N: Core tutorials (remaining videos)
        for i, video in enumerate(videos[1:], start=2):
            lesson_title = self._generate_lesson_title(tool_name, i, len(videos))
            lessons.append({
                'lesson_order': i,
                'lesson_type': 'video',
                'lesson_title': lesson_title,
                'lesson_description': video['title'],
                'video_data': video,
                'estimated_minutes': video['duration_seconds'] // 60
            })
        
        # Final Lesson: Assessment
        lessons.append({
            'lesson_order': len(lessons) + 1,
            'lesson_type': 'quiz',
            'lesson_title': f'{tool_name} Mastery Assessment',
            'lesson_description': f'Test your knowledge of {tool_name}',
            'estimated_minutes': 15
        })
        
        return lessons
    
    def _generate_lesson_title(self, tool_name: str, lesson_num: int, total: int) -> str:
        """Generate contextual lesson titles"""
        
        if lesson_num == 2:
            return f'Getting Started with {tool_name}'
        elif lesson_num == total - 1:
            return f'Advanced {tool_name} Techniques'
        elif lesson_num == total:
            return f'{tool_name} Best Practices'
        else:
            return f'{tool_name} - Part {lesson_num - 1}'


async def generate_course_from_tools(
    db: asyncpg.Connection,
    tools: List[Dict],
    profile: Dict,
    youtube_api_key: Optional[str] = None
) -> Dict:
    """
    Generate a complete course with YouTube videos for selected tools
    
    Args:
        db: Database connection
        tools: List of selected tools
        profile: User profile data
        youtube_api_key: YouTube API key (optional)
        
    Returns:
        Course data with modules and video lessons
    """
    
    print(f"\n🎓 Starting course generation for {len(tools)} tools")
    print(f"👤 Profile: {profile.get('job_title', 'Unknown')} in {profile.get('sector_type', 'Unknown')} sector")
    
    youtube = YouTubeService(youtube_api_key)
    
    course_data = {
        'modules': [],
        'total_videos': 0,
        'total_duration_minutes': 0
    }
    
    for idx, tool in enumerate(tools, 1):
        tool_name = tool.get('tool_name', '')
        tool_description = tool.get('description', '')
        
        print(f"\n📦 Module {idx}/{len(tools)}: {tool_name}")
        
        # Search for tutorial videos
        print(f"   🔎 Searching for {tool_name} tutorials...")
        videos = await youtube.search_tool_tutorials(
            tool_name=tool_name,
            max_results=4  # 3-4 videos per tool
        )
        
        print(f"   ✅ Found {len(videos)} videos for {tool_name}")
        
        # Create structured lessons
        lessons = await youtube.create_lesson_structure(
            tool_name=tool_name,
            tool_description=tool_description,
            videos=videos
        )
        
        # Calculate module stats
        module_duration = sum(lesson.get('estimated_minutes', 0) for lesson in lessons)
        
        print(f"   📚 Created {len(lessons)} lessons ({module_duration} minutes)")
        
        module = {
            'module_order': idx,
            'module_title': f'Mastering {tool_name}',
            'tool_name': tool_name,
            'tool_id': tool.get('id'),
            'lessons': lessons,
            'total_lessons': len(lessons),
            'video_count': len([l for l in lessons if l['lesson_type'] == 'video']),
            'estimated_minutes': module_duration
        }
        
        course_data['modules'].append(module)
        course_data['total_videos'] += module['video_count']
        course_data['total_duration_minutes'] += module_duration
    
    print(f"\n🎉 Course generation complete!")
    print(f"   📊 {len(course_data['modules'])} modules")
    print(f"   🎬 {course_data['total_videos']} videos")
    print(f"   ⏱️  {course_data['total_duration_minutes']} minutes (~{round(course_data['total_duration_minutes']/60, 1)} hours)")
    
    return course_data
