"""
Chat Routes
"""
from flask import Blueprint, request, jsonify, g
from middleware.auth import jwt_required
from services.chat_service import process_chat
from models import get_chat_by_id, get_chats_by_user, get_chat_messages

chat_bp = Blueprint('chat', __name__, url_prefix='/chat')


@chat_bp.route('', methods=['POST'])
@jwt_required
def chat():
    """
    Chat with AI
    
    Parameters:
        - message (required): Array of message objects [{"content": "...", "role": "user"}]
        - id-chat (optional): Existing chat ID to continue conversation
    """
    current_user = g.current_user
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    # Validate message parameter
    messages = data.get("message")
    if not messages:
        return jsonify({"error": "message parameter is required"}), 400
    
    if not isinstance(messages, list):
        return jsonify({"error": "message must be an array"}), 400
    
    if len(messages) == 0:
        return jsonify({"error": "message array cannot be empty"}), 400
    
    # Validate each message object
    for i, msg in enumerate(messages):
        if not isinstance(msg, dict):
            return jsonify({"error": f"message[{i}] must be an object"}), 400
        if "content" not in msg:
            return jsonify({"error": f"message[{i}] must have 'content' field"}), 400
        if "role" not in msg:
            return jsonify({"error": f"message[{i}] must have 'role' field"}), 400
        if msg["role"] not in ["user", "assistant", "system"]:
            return jsonify({"error": f"message[{i}] role must be 'user', 'assistant', or 'system'"}), 400
    
    # Get optional chat ID
    chat_id = data.get("id-chat")
    
    # Process chat
    result = process_chat(current_user["id"], messages, chat_id)
    
    if "error" in result:
        return jsonify({"error": result["error"]}), 400
    
    return jsonify({
        "success": True,
        "chat_id": result["chat_id"],
        "is_new_chat": result["is_new_chat"],
        "response": result["response"],
        "message_count": result["message_count"]
    }), 200


@chat_bp.route('/history', methods=['GET'])
@jwt_required
def get_history():
    """Get all chats for current user"""
    current_user = g.current_user
    chats = get_chats_by_user(current_user["id"])
    
    return jsonify({
        "success": True,
        "chats": chats
    }), 200


@chat_bp.route('/<chat_id>', methods=['GET'])
@jwt_required
def get_chat(chat_id):
    """Get chat details and messages"""
    current_user = g.current_user
    
    chat = get_chat_by_id(chat_id)
    if not chat:
        return jsonify({"error": "Chat not found"}), 404
    
    if chat["user_id"] != current_user["id"]:
        return jsonify({"error": "Unauthorized"}), 403
    
    messages = get_chat_messages(chat_id)
    
    return jsonify({
        "success": True,
        "chat": chat,
        "messages": messages
    }), 200

