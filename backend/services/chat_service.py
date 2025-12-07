"""
Chat Service - Handle chat with AI
"""
from models import (
    create_chat, get_chat_by_id, add_chat_message, 
    get_chat_messages_for_api, update_chat_title
)
from utils.ai_formatter import call_kolosal_ai


def process_chat(user_id: int, messages: list, chat_id: str = None) -> dict:
    """
    Process chat messages with AI
    
    Args:
        user_id: User ID
        messages: List of message objects with 'content' and 'role'
        chat_id: Optional existing chat ID
    
    Returns:
        dict with chat info and AI response
    """
    # Create new chat if no chat_id provided
    if not chat_id:
        # Generate title from first message
        first_msg = messages[0].get("content", "")[:50] if messages else "New Chat"
        title = first_msg + "..." if len(messages[0].get("content", "")) > 50 else first_msg
        
        chat_result = create_chat(user_id, title)
        if "error" in chat_result:
            return {"error": chat_result["error"]}
        
        chat_id = chat_result["chat_id"]
        is_new_chat = True
    else:
        # Verify chat exists and belongs to user
        chat = get_chat_by_id(chat_id)
        if not chat:
            return {"error": "Chat not found"}
        if chat["user_id"] != user_id:
            return {"error": "Unauthorized access to chat"}
        is_new_chat = False
    
    # Add all input messages to database
    for msg in messages:
        content = msg.get("content", "")
        role = msg.get("role", "user")
        
        if not content:
            continue
            
        add_result = add_chat_message(chat_id, content, role)
        if "error" in add_result:
            return {"error": add_result["error"]}
    
    # Get all messages for this chat
    all_messages = get_chat_messages_for_api(chat_id)
    
    # Call AI
    ai_result = call_kolosal_ai(all_messages)
    
    if not ai_result["success"]:
        return {
            "error": ai_result.get("error", "AI request failed"),
            "chat_id": chat_id,
            "is_new_chat": is_new_chat
        }
    
    ai_response = ai_result["content"]
    
    # Add AI response to database
    add_chat_message(chat_id, ai_response, "assistant")
    
    return {
        "chat_id": chat_id,
        "is_new_chat": is_new_chat,
        "response": ai_response,
        "message_count": len(all_messages) + 1
    }


def format_text_via_chat(user_id: int, text: str, title: str = None) -> dict:
    """
    Format/normalize text using chat - for OCR integration
    
    Args:
        user_id: User ID
        text: Raw text to format
        title: Optional custom title for the chat (if None, uses first 50 chars of text)
    
    Returns:
        dict with formatted result
    """
    messages = [
        {
            "content": f"Please format this text data into structured JSON where possible. Provide only valid JSON as the output. Text: {text}",
            "role": "user"
        }
    ]
    
    if title is None:
        title = text[:50].strip() if text else "OCR Result"
        if len(text) > 50:
            title += "..."
    
    # Create chat with custom title
    chat_result = create_chat(user_id, title)
    if "error" in chat_result:
        return {"error": chat_result["error"]}
    
    chat_id = chat_result["chat_id"]
    
    # Add OCR text as user message (for context)
    add_chat_message(chat_id, f"Here is the data:\n{text}", "user")
    
    # Get all messages for this chat
    all_messages = get_chat_messages_for_api(chat_id)
    
    # Call AI for formatting
    ai_result = call_kolosal_ai(all_messages)
    
    if not ai_result["success"]:
        return {
            "error": ai_result.get("error", "AI request failed"),
            "chat_id": chat_id,
            "is_new_chat": True
        }
    
    ai_response = ai_result["content"]
    
    # Add AI response to database
    add_chat_message(chat_id, ai_response, "assistant")
    
    return {
        "chat_id": chat_id,
        "is_new_chat": True,
        "response": ai_response,
        "message_count": 2
    }


def save_ocr_result_to_chat(user_id: int, ocr_result: str, title: str = None, engine: str = "kolosalocr") -> dict:
    """
    Save OCR result to a new chat without calling AI
    Used for Kolosal OCR which already returns structured data
    
    Args:
        user_id: User ID
        ocr_result: OCR result text/JSON to save
        title: Title from OCR response (for kolosalocr)
        engine: OCR engine name for fallback title
    
    Returns:
        dict with chat_id
    """
    if not title:
        title = f"OCR Result ({engine})"
    
    chat_result = create_chat(user_id, title)
    if "error" in chat_result:
        return {"error": chat_result["error"]}
    
    chat_id = chat_result["chat_id"]
    
    # Add OCR result as user message
    add_result = add_chat_message(chat_id, f"OCR Result:\n{ocr_result}", "user")
    if "error" in add_result:
        return {"error": add_result["error"]}
    
    # Add assistant acknowledgment
    add_chat_message(chat_id, "That is good, OCR processing is complete.", "assistant")
    
    return {
        "chat_id": chat_id,
        "is_new_chat": True,
        "response": ocr_result
    }
