"""
Quiz Generation Service using YouTube Transcripts and Groq AI
"""

import os
import json
import re
# pyrefly: ignore [missing-import]
from youtube_transcript_api import YouTubeTranscriptApi
from groq import Groq
from app.config import settings


class QuizGenerator:
    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY
        if not self.groq_api_key:
            print("⚠️  Warning: GROQ_API_KEY not found in environment")
        self.client = Groq(api_key=self.groq_api_key) if self.groq_api_key else None
        
    def extract_video_id(self, url: str) -> str:
        """Extract YouTube video ID from URL"""
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:embed\/)([0-9A-Za-z_-]{11})',
            r'^([0-9A-Za-z_-]{11})$'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def fetch_transcript(self, video_id: str) -> str:
        """
        Fetch transcript from YouTube video
        Tries multiple strategies:
        1. Manual captions in Urdu/Hindi/English
        2. Auto-generated captions in any available language
        3. Fallback to English auto-generated
        """
        try:
            # Strategy 1: Try to get transcript in preferred languages
            try:
                transcript_list = YouTubeTranscriptApi.get_transcript(
                    video_id, 
                    languages=['ur', 'hi', 'en']
                )
                full_transcript = ' '.join([entry['text'] for entry in transcript_list])
                print(f"✅ Found manual transcript ({len(full_transcript)} chars)")
                return full_transcript
            except:
                pass
            
            # Strategy 2: Try to get ANY available transcript (including auto-generated)
            try:
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                
                # Try to find transcript in preferred languages (including auto-generated)
                for lang_code in ['ur', 'hi', 'en', 'en-US', 'en-GB']:
                    try:
                        transcript = transcript_list.find_transcript([lang_code])
                        transcript_data = transcript.fetch()
                        full_transcript = ' '.join([entry['text'] for entry in transcript_data])
                        print(f"✅ Found transcript in {lang_code} ({len(full_transcript)} chars)")
                        return full_transcript
                    except:
                        continue
                
                # Try to get any available transcript and translate to English
                try:
                    # Get first available transcript
                    available = list(transcript_list)
                    if available:
                        transcript = available[0]
                        # Try to translate to English if not already
                        if transcript.language_code not in ['en', 'en-US', 'en-GB']:
                            try:
                                translated = transcript.translate('en')
                                transcript_data = translated.fetch()
                            except:
                                # If translation fails, use original
                                transcript_data = transcript.fetch()
                        else:
                            transcript_data = transcript.fetch()
                        
                        full_transcript = ' '.join([entry['text'] for entry in transcript_data])
                        print(f"✅ Found transcript in {transcript.language_code} ({len(full_transcript)} chars)")
                        return full_transcript
                except:
                    pass
            except:
                pass
            
            print(f"❌ No transcript available for video {video_id}")
            return None
            
        except Exception as e:
            print(f"Error fetching transcript for {video_id}: {e}")
            return None
    
    def generate_quiz_questions(self, transcript: str, tool_name: str, video_title: str) -> list:
        """
        Generate quiz questions using Groq AI based on video transcript
        """
        if not self.client:
            print("Groq client not initialized")
            return []
        
        # Limit transcript length to avoid token limits
        max_chars = 8000
        if len(transcript) > max_chars:
            # Take first 3/4 and last 1/4 to get intro and conclusion
            split_point = int(max_chars * 0.75)
            transcript = transcript[:split_point] + " ... " + transcript[-(max_chars - split_point):]
        
        system_prompt = """You are an expert educator creating assessment questions for online courses about AI tools.

Generate 5 multiple-choice questions based on the video transcript provided. 

Requirements:
1. Questions should test understanding of key concepts, not just recall
2. Each question should have 4 options (A, B, C, D)
3. Only one option should be correct
4. Questions should be practical and relevant to real-world usage
5. Avoid trivial or overly specific questions
6. Focus on HOW to use the tool, not just WHAT it is

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": "A"
  }
]

Do not include any other text, explanation, or markdown formatting. Only return the JSON array."""

        user_prompt = f"""Tool Name: {tool_name}
Video Title: {video_title}

Transcript:
{transcript}

Generate 5 multiple-choice questions based on this content."""

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            
            # Try to extract JSON if wrapped in markdown
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()
            
            # Parse JSON
            questions = json.loads(content)
            
            # Validate structure
            if not isinstance(questions, list) or len(questions) == 0:
                print("Invalid response structure from Groq")
                return []
            
            # Validate each question
            valid_questions = []
            for q in questions:
                if all(key in q for key in ['question', 'options', 'correct']):
                    if len(q['options']) == 4 and q['correct'] in ['A', 'B', 'C', 'D']:
                        valid_questions.append(q)
            
            print(f"✅ Generated {len(valid_questions)} quiz questions")
            return valid_questions
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON from Groq response: {e}")
            print(f"Response content: {content[:500]}")
            return []
        except Exception as e:
            print(f"Error generating quiz with Groq: {e}")
            return []
    
    async def generate_quiz_for_video(
        self, 
        db, 
        video_url: str, 
        video_id_str: str,
        module_id: int,
        tool_name: str,
        video_title: str
    ) -> dict:
        """
        Main function to generate quiz for a video
        Checks if quiz exists, if not generates new one
        """
        # Check if quiz already exists for this video
        existing_quiz = await db.fetchrow(
            """
            SELECT q.id, q.quiz_title
            FROM quizzes q
            WHERE q.module_id = $1 AND q.video_id = $2
            """,
            module_id,
            video_id_str
        )
        
        if existing_quiz:
            print(f"✅ Quiz already exists for video {video_id_str}")
            return {
                "quiz_id": existing_quiz['id'],
                "quiz_title": existing_quiz['quiz_title'],
                "cached": True
            }
        
        # Extract video ID
        video_id = self.extract_video_id(video_url)
        if not video_id:
            print(f"❌ Could not extract video ID from {video_url}")
            return None
        
        print("⏭️ Skipping transcript fetch and AI quiz generation. Using default questions.")
        
        # Default placeholder questions
        questions = [
            {
                "question": f"What is the main purpose of {tool_name}?",
                "options": [
                    f"To assist with specific tasks related to {tool_name}",
                    "To replace human creativity entirely",
                    "To slow down productivity",
                    "None of the above"
                ],
                "correct": "A"
            },
            {
                "question": "Which of the following is a best practice when using this tool?",
                "options": [
                    "Providing vague instructions",
                    "Providing clear and detailed prompts",
                    "Never verifying the output",
                    "Using it for unrelated tasks"
                ],
                "correct": "B"
            },
            {
                "question": f"How can {tool_name} improve your workflow?",
                "options": [
                    "By automating repetitive tasks and providing guided assistance",
                    "By increasing the time it takes to complete a project",
                    "It has no impact on workflow",
                    "By deleting important files"
                ],
                "correct": "A"
            }
        ]
        
        # Create quiz in database
        quiz_id = await db.fetchval(
            """
            INSERT INTO quizzes (module_id, quiz_title, passing_score, video_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            """,
            module_id,
            f"{tool_name} Knowledge Check",
            70,  # 70% passing score
            video_id_str
        )
        
        # Insert questions
        for idx, q in enumerate(questions):
            await db.execute(
                """
                INSERT INTO quiz_questions 
                (quiz_id, question_text, question_type, options, correct_answer, question_order)
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                quiz_id,
                q['question'],
                'multiple_choice',
                json.dumps(q['options']),  # Store as JSON string
                q['correct'],
                idx + 1
            )
        
        print(f"✅ Quiz created with {len(questions)} questions (ID: {quiz_id})")
        
        return {
            "quiz_id": quiz_id,
            "quiz_title": f"{tool_name} Knowledge Check",
            "question_count": len(questions),
            "cached": False
        }


# Singleton instance
quiz_generator = QuizGenerator()
