"""
JWT Authentication Middleware
"""
import time
import jwt
from functools import wraps
from flask import request, jsonify, g

from config import JWT_SECRET_KEY, JWT_ACCESS_TOKEN_EXPIRES, JWT_REFRESH_TOKEN_EXPIRES
from models import get_user_by_id


def generate_token(user_id: int, username: str, token_type: str = "access") -> str:
    """Generate JWT token (access or refresh)"""
    if token_type == "refresh":
        expires = JWT_REFRESH_TOKEN_EXPIRES
    else:
        expires = JWT_ACCESS_TOKEN_EXPIRES
    
    payload = {
        "user_id": user_id,
        "username": username,
        "type": token_type,
        "exp": time.time() + expires,
        "iat": time.time()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")


def decode_token(token: str, expected_type: str = "access") -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        
        # Check if token is expired
        if payload.get("exp", 0) < time.time():
            return {"error": "Token has expired"}
        
        # Check token type
        if payload.get("type") != expected_type:
            return {"error": f"Invalid token type. Expected {expected_type} token"}
        
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token has expired"}
    except jwt.InvalidTokenError as e:
        return {"error": f"Invalid token: {str(e)}"}


def jwt_required(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]
        
        if not token:
            return jsonify({"error": "Authorization token is required"}), 401
        
        # Decode and validate token (expect access token)
        payload = decode_token(token, expected_type="access")
        if "error" in payload:
            return jsonify({"error": payload["error"]}), 401
        
        # Get user from database
        user = get_user_by_id(payload.get("user_id"))
        if not user:
            return jsonify({"error": "User not found"}), 401
        
        # Check if email is verified
        if not user.get("is_verified"):
            return jsonify({"error": "Please verify your email first"}), 403
        
        # Store user in flask g object for use in route
        g.current_user = user
        
        return f(*args, **kwargs)
    return decorated
