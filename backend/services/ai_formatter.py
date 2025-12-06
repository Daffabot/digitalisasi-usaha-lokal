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
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
    if json_match:
        try:
            parsed = json.loads(json_match.group(1))
            return {"data": parsed, "is_json": True}
        except json.JSONDecodeError:
            pass
    
    # Return raw text
    return {"data": response, "is_json": False}


def normalize_text_with_ai(text: str) -> dict:
    """
    Normalize OCR text to structured JSON using Kolosal AI
    
    Args:
        text: Raw OCR text
    
    Returns:
        dict with 'data' (parsed JSON or raw text) and 'is_json' (bool)
    """
    if not KOLOSAL_API_KEY:
        print("Warning: KOLOSAL_API_KEY not configured, returning raw text")
        return {"data": text, "is_json": False}
    
    if not text or text.strip() == "":
        return {"data": "", "is_json": False}
    
    messages = [
        {
            "content": f"Please format this text data into structured JSON where possible. Provide only valid JSON as the output. Text: {text}",
            "role": "user"
        }
    ]
    
    result = call_kolosal_ai(messages)
    
    if not result["success"]:
        print(f"Kolosal AI error: {result.get('error')}")
        return {"data": text, "is_json": False}
    
    return parse_json_from_response(result["content"])
