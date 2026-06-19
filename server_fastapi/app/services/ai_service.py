import json
import os
from typing import List, Dict
from app.config import settings
from groq import AsyncGroq

async def generate_job_tasks(
    job_title: str,
    sector_type: str,
    department: str,
    years_experience: int,
    tools: List[str]
) -> Dict:
    """
    Generate job tasks based on user profile using Groq AI
    Returns tasks grouped by category
    """
    
    tools_str = ", ".join(tools) if tools else "basic office tools"
    
    prompt = f"""Given the following professional profile:
    - Job Title: {job_title}
    - Sector: {sector_type}
    - Department: {department}
    - Experience: {years_experience} years
    - Current Tools: {tools_str}
    
    Generate 6-8 realistic job tasks this person performs. For each task provide exactly these fields:
    - category (e.g., "Reporting & Analytics", "Communication", "Administration")
    - task_name (concise title)
    - task_description (2-3 sentences)
    - frequency (daily/weekly/monthly)
    - complexity (low/medium/high)
    - estimated_hours (time spent per occurrence, as an integer)
    
    Return as a JSON object with a single key "tasks_list" containing an array of these tasks.
    Do not output any markdown or explanation, just the raw JSON object.
    """
    
    try:
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        tasks = data.get("tasks_list", [])
        
        if not tasks:
            raise ValueError("No tasks were returned by the AI.")
            
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        # Allow the exception to bubble up so the router can return a proper 500 error to the client
        raise Exception(f"AI task generation failed: {str(e)}")
        
    # Add id to tasks
    for i, task in enumerate(tasks):
        task["id"] = i + 1
        
    match_percentage = min(72 + (years_experience * 2), 98) # Simulate match percentage
    
    # Group tasks by category
    grouped_tasks = {}
    for task in tasks:
        category = task.get("category", "General")
        if category not in grouped_tasks:
            grouped_tasks[category] = []
        grouped_tasks[category].append(task)
    
    return {
        "tasks": grouped_tasks,
        "total_tasks": len(tasks),
        "match_percentage": match_percentage
    }
