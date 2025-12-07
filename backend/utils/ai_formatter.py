"""
AI Formatter Service - Normalize OCR text to structured JSON using Kolosal AI
"""
import json
import re
import requests

from config import KOLOSAL_API_KEY, KOLOSAL_API_URL, KOLOSAL_MODEL, KOLOSAL_MAX_TOKENS


def call_kolosal_ai(messages: list) -> dict:
    """
    Call Kolosal AI with messages
    
    Args:
        messages: List of message objects with 'content' and 'role'
    
    Returns:
        dict with 'content' (AI response) and 'success' (bool)
    """
    if not KOLOSAL_API_KEY:
        return {"content": "", "success": False, "error": "KOLOSAL_API_KEY not configured"}
    
    try:
        response = requests.post(
            KOLOSAL_API_URL,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {KOLOSAL_API_KEY}"
            },
            json={
                "max_tokens": KOLOSAL_MAX_TOKENS,
                "messages": messages,
                "model": KOLOSAL_MODEL
            },
            timeout=60
        )
        
        if response.status_code != 200:
            return {"content": "", "success": False, "error": f"API error: {response.status_code}"}
        
        result = response.json()
        ai_output = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        return {"content": ai_output, "success": True}
        
    except requests.RequestException as e:
        return {"content": "", "success": False, "error": str(e)}
    except Exception as e:
        return {"content": "", "success": False, "error": str(e)}


def parse_json_from_response(response: str) -> dict:
    """
    Try to parse JSON from AI response
    
    Returns:
        dict with 'data' and 'is_json'
    """
    # Try direct JSON parse
    try:
        parsed = json.loads(response)
        return {"data": parsed, "is_json": True}
    except json.JSONDecodeError:
        pass
    
    # Try to extract JSON from markdown code block
    json_match = re.search(r'\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`', response)
    if json_match:
        try:
            parsed = json.loads(json_match.group(1))
            return {"data": parsed, "is_json": True}
        except json.JSONDecodeError:
            pass
    
    # Return raw text
    return {"data": response, "is_json": False}
