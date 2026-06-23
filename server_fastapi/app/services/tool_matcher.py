"""
Intelligent AI Tool Matching Service
Matches user tasks to the most appropriate AI tools based on category, complexity, and context
"""

from typing import List, Dict, Tuple
# pyrefly: ignore [missing-import]
import asyncpg
from collections import defaultdict
from app.config import settings

# Task category to tool category mappings
TASK_TO_TOOL_MAPPING = {
    # Reporting & Analytics
    "reporting": ["data-analysis", "productivity", "automation"],
    "analytics": ["data-analysis", "productivity"],
    "data analysis": ["data-analysis", "productivity"],
    "data": ["data-analysis", "automation"],
    "metrics": ["data-analysis", "productivity"],
    "insights": ["data-analysis", "productivity"],
    "dashboard": ["data-analysis", "automation"],
    
    # Communication
    "communication": ["communication", "writing", "productivity"],
    "email": ["communication", "writing"],
    "meeting": ["communication", "productivity"],
    "presentation": ["presentation", "communication", "creative"],
    "stakeholder": ["communication", "writing", "productivity"],
    "collaboration": ["communication", "productivity", "project-management"],
    
    # Documentation & Writing
    "documentation": ["writing", "productivity", "document"],
    "writing": ["writing", "productivity"],
    "report": ["writing", "data-analysis", "productivity"],
    "policy": ["writing", "document", "productivity"],
    "memo": ["writing", "communication"],
    "proposal": ["writing", "presentation", "productivity"],
    
    # Administrative
    "administration": ["automation", "productivity", "document"],
    "administrative": ["automation", "productivity", "document"],
    "scheduling": ["automation", "project-management", "productivity"],
    "coordination": ["project-management", "communication", "automation"],
    "organization": ["productivity", "automation", "project-management"],
    "filing": ["document", "automation", "productivity"],
    
    # HR & People Management
    "recruitment": ["hr-tools", "communication", "automation"],
    "hr": ["hr-tools", "communication", "document"],
    "performance": ["hr-tools", "data-analysis", "productivity"],
    "onboarding": ["hr-tools", "automation", "productivity"],
    "training": ["hr-tools", "productivity", "communication"],
    "employee": ["hr-tools", "communication", "productivity"],
    
    # Project Management
    "project": ["project-management", "productivity", "communication"],
    "task": ["project-management", "productivity", "automation"],
    "workflow": ["automation", "project-management", "productivity"],
    "process": ["automation", "project-management", "productivity"],
    
    # Research & Knowledge
    "research": ["research", "productivity", "data-analysis"],
    "investigation": ["research", "data-analysis", "productivity"],
    "analysis": ["data-analysis", "research", "productivity"],
}

# Keyword to tool category mappings (for task descriptions)
DESCRIPTION_KEYWORDS = {
    # Data & Analytics keywords
    "analyze": "data-analysis",
    "metrics": "data-analysis",
    "statistics": "data-analysis",
    "chart": "data-analysis",
    "visualization": "data-analysis",
    "dashboard": "data-analysis",
    "insights": "data-analysis",
    "trends": "data-analysis",
    "forecast": "data-analysis",
    
    # Communication keywords
    "email": "communication",
    "meeting": "communication",
    "call": "communication",
    "message": "communication",
    "communicate": "communication",
    "coordinate": "communication",
    "update": "communication",
    "transcribe": "communication",
    "notes": "communication",
    
    # Writing keywords
    "write": "writing",
    "draft": "writing",
    "document": "writing",
    "report": "writing",
    "memo": "writing",
    "proposal": "writing",
    "summary": "writing",
    "content": "writing",
    
    # Automation keywords
    "automate": "automation",
    "schedule": "automation",
    "workflow": "automation",
    "process": "automation",
    "routine": "automation",
    "repetitive": "automation",
    
    # Presentation keywords
    "present": "presentation",
    "slide": "presentation",
    "deck": "presentation",
    "visualize": "presentation",
}


class ToolMatcher:
    """Intelligent tool matching service"""
    
    def __init__(self, db: asyncpg.Connection):
        self.db = db
    
    async def _match_tools_with_ai(
        self,
        tasks: List[Dict],
        all_tools: List[Dict],
        max_tools: int
    ) -> List[Dict]:
        """Match tools to tasks using Groq AI"""
        from groq import AsyncGroq
        import json
        
        # Format task and tool summaries to keep token usage minimal
        tasks_summary = [
            {
                "id": t.get("id"),
                "category": t.get("category"),
                "task_name": t.get("task_name"),
                "task_description": t.get("task_description")
            }
            for t in tasks
        ]
        
        tools_summary = [
            {
                "id": t.get("id"),
                "tool_name": t.get("tool_name"),
                "tool_category": t.get("tool_category"),
                "description": t.get("description")
            }
            for t in all_tools
        ]
        
        prompt = f"""You are an expert assistant matching professional work tasks with the best AI tools from a database.

User's Work Tasks:
{json.dumps(tasks_summary, indent=2)}

Available AI Tools in Database:
{json.dumps(tools_summary, indent=2)}

Your task:
Analyze the user's tasks and select the top {max_tools} AI tools from the available list that are most useful to automate or assist with these specific tasks.

For each matched tool, you MUST return:
1. "tool_id": The exact integer ID of the matched tool from the database.
2. "relevance_score": An integer from 1 to 100 representing how well the tool fits.
3. "relevance_reason": A concise reason stating which task(s) it assists/automates, starting with 'Automates:' (e.g. "Automates: draft reports, document writing").

Return your response ONLY as a valid JSON object with a single key "matched_tools" containing a list of these matched tools.
Do not output any markdown code blocks, conversational text, or explanation, just the raw JSON object.
"""
        
        try:
            client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            response = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content.strip()
            data = json.loads(content)
            matches = data.get("matched_tools", [])
            
            # Map matches back to original tool dictionary records
            tool_by_id = {t["id"]: t for t in all_tools}
            result = []
            for m in matches:
                tool_id = m.get("tool_id")
                if tool_id in tool_by_id:
                    result.append({
                        "tool": tool_by_id[tool_id],
                        "score": float(m.get("relevance_score", 70)),
                        "relevance_reason": m.get("relevance_reason", "task automation")
                    })
            
            return result
        except Exception as e:
            print(f"Error matching tools with Groq AI: {e}")
            return []

    async def match_tools_to_tasks(
        self, 
        tasks: List[Dict],
        max_tools: int = 5
    ) -> List[Dict]:
        """
        Match the most relevant AI tools to user's confirmed tasks
        
        Args:
            tasks: List of task dictionaries with category, task_name, task_description
            max_tools: Maximum number of tools to recommend
            
        Returns:
            List of matched tools with relevance scores and automation details
        """
        # Fetch all available tools from database
        all_tools = await self._fetch_all_tools()
        if not all_tools:
            return []

        # Try AI matching first if GROQ_API_KEY is available
        if settings.GROQ_API_KEY and len(settings.GROQ_API_KEY) > 20:
            print("🤖 Matching tools to tasks using Groq AI...")
            ai_matches = await self._match_tools_with_ai(tasks, all_tools, max_tools)
            if ai_matches:
                print(f"✅ AI matched {len(ai_matches)} tools successfully")
                return ai_matches
        
        print("⚠️ Falling back to rule-based keyword matching for tool recommendation")
        # Analyze tasks to extract relevant keywords and categories
        task_categories = self._extract_task_categories(tasks)
        task_keywords = self._extract_task_keywords(tasks)
        
        # Score each tool based on relevance
        scored_tools = []
        for tool in all_tools:
            score = self._calculate_tool_score(
                tool=tool,
                task_categories=task_categories,
                task_keywords=task_keywords,
                tasks=tasks
            )
            
            if score > 0:
                scored_tools.append({
                    "tool": tool,
                    "score": score,
                    "relevance_reason": self._generate_relevance_reason(tool, tasks)
                })
        
        # Sort by score and return top matches
        scored_tools.sort(key=lambda x: x["score"], reverse=True)
        
        # Ensure diversity in tool categories
        diverse_tools = self._ensure_tool_diversity(scored_tools, max_tools)
        
        return diverse_tools[:max_tools]
    
    def _extract_task_categories(self, tasks: List[Dict]) -> Dict[str, int]:
        """Extract and count task categories"""
        categories = defaultdict(int)
        
        for task in tasks:
            category = task.get("category", "").lower()
            
            # Map category to tool categories
            for keyword, tool_categories in TASK_TO_TOOL_MAPPING.items():
                if keyword in category:
                    for tool_cat in tool_categories:
                        categories[tool_cat] += 2  # Weight by 2 for category match
        
        return dict(categories)
    
    def _extract_task_keywords(self, tasks: List[Dict]) -> Dict[str, int]:
        """Extract keywords from task names and descriptions"""
        keywords = defaultdict(int)
        
        for task in tasks:
            text = f"{task.get('task_name', '')} {task.get('task_description', '')}".lower()
            
            # Check for keyword matches
            for keyword, tool_category in DESCRIPTION_KEYWORDS.items():
                if keyword in text:
                    keywords[tool_category] += 1
        
        return dict(keywords)
    
    async def _fetch_all_tools(self) -> List[Dict]:
        """Fetch all tools from database"""
        tools = await self.db.fetch(
            """
            SELECT id, tool_name, tool_category, description, 
                   official_url, difficulty_level, is_free, pricing_info
            FROM ai_tools
            ORDER BY tool_category, difficulty_level
            """
        )
        
        return [dict(tool) for tool in tools]
    
    def _calculate_tool_score(
        self,
        tool: Dict,
        task_categories: Dict[str, int],
        task_keywords: Dict[str, int],
        tasks: List[Dict]
    ) -> float:
        """Calculate relevance score for a tool"""
        score = 0.0
        tool_category = tool.get("tool_category", "").lower()
        
        # Category match score (highest weight)
        if tool_category in task_categories:
            score += task_categories[tool_category] * 10
        
        # Keyword match score
        if tool_category in task_keywords:
            score += task_keywords[tool_category] * 5
        
        # Difficulty bonus (prefer beginner tools)
        if tool.get("difficulty_level") == "beginner":
            score += 3
        elif tool.get("difficulty_level") == "intermediate":
            score += 1
        
        # Free tier bonus (slight preference)
        if tool.get("is_free"):
            score += 2
        
        return score
    
    def _generate_relevance_reason(self, tool: Dict, tasks: List[Dict]) -> str:
        """Generate a human-readable reason for tool recommendation"""
        tool_category = tool.get("tool_category", "")
        
        # Find matching tasks
        matching_tasks = []
        for task in tasks:
            task_text = f"{task.get('category', '')} {task.get('task_name', '')}".lower()
            
            # Check if tool category relates to task
            for keyword, categories in TASK_TO_TOOL_MAPPING.items():
                if keyword in task_text and tool_category in categories:
                    matching_tasks.append(task.get("task_name", ""))
                    break
        
        if matching_tasks:
            return f"Automates: {', '.join(matching_tasks[:2])}"
        
        # Fallback generic reason
        category_descriptions = {
            "data-analysis": "data analysis and reporting tasks",
            "communication": "meeting and communication tasks",
            "writing": "documentation and writing tasks",
            "automation": "workflow automation tasks",
            "productivity": "productivity and organization tasks",
            "presentation": "presentation creation tasks",
            "hr-tools": "HR and people management tasks",
            "project-management": "project and task management",
        }
        
        return f"Helps with {category_descriptions.get(tool_category, 'various work tasks')}"
    
    def _ensure_tool_diversity(
        self, 
        scored_tools: List[Dict], 
        max_tools: int
    ) -> List[Dict]:
        """Ensure diverse tool categories in recommendations"""
        diverse_tools = []
        used_categories = set()
        
        # First pass: one tool per category
        for item in scored_tools:
            tool = item["tool"]
            category = tool.get("tool_category")
            
            if category not in used_categories:
                diverse_tools.append(item)
                used_categories.add(category)
                
                if len(diverse_tools) >= max_tools:
                    return diverse_tools
        
        # Second pass: fill remaining slots with highest scored tools
        for item in scored_tools:
            if item not in diverse_tools:
                diverse_tools.append(item)
                
                if len(diverse_tools) >= max_tools:
                    return diverse_tools
        
        return diverse_tools


async def generate_learning_modules(
    db: asyncpg.Connection,
    matched_tools: List[Dict],
    profile: Dict
) -> List[Dict]:
    """
    Generate detailed learning modules for matched tools
    
    Args:
        db: Database connection
        matched_tools: List of matched tools with scores
        profile: User profile information
        
    Returns:
        List of learning modules with details
    """
    modules = []
    
    for idx, item in enumerate(matched_tools, 1):
        tool = item["tool"]
        
        # Calculate estimated time based on difficulty
        difficulty = tool.get("difficulty_level", "beginner")
        base_minutes = {
            "beginner": 45,
            "intermediate": 60,
            "advanced": 90
        }.get(difficulty, 45)
        
        # Add variation
        estimated_minutes = base_minutes + (idx * 5)
        
        # Determine lesson count based on difficulty
        lesson_count = {
            "beginner": 4,
            "intermediate": 5,
            "advanced": 6
        }.get(difficulty, 4)
        
        modules.append({
            "tool_id": tool["id"],
            "tool_name": tool["tool_name"],
            "tool_category": tool["tool_category"],
            "module_title": f"Mastering {tool['tool_name']} for {tool['tool_category'].replace('-', ' ').title()}",
            "module_order": idx,
            "lessons": lesson_count,
            "estimated_minutes": estimated_minutes,
            "automates_what": item.get("relevance_reason", "work automation"),
            "difficulty": difficulty,
            "description": tool.get("description", ""),
            "official_url": tool.get("official_url", ""),
            "is_free": tool.get("is_free", False),
            "pricing_info": tool.get("pricing_info", "")
        })
    
    return modules
