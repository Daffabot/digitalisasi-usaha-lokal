"""
Authentication Routes
"""
import re
from flask import Blueprint, request, jsonify, make_response, g

from config import JWT_REFRESH_TOKEN_EXPIRES
from models import (
    create_user, get_user_by_username_or_email, get_user_by_id,
    verify_password, verify_user_email, regenerate_verification_token,
    update_user_full_name  # Add import
)
from middleware.auth import generate_token, decode_token, jwt_required  # Add jwt_required import
from services.email_service import send_verification_email

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password: str) -> tuple:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, None


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user
    
    Parameters:
        full_name: User's full name
        username: Unique username
        email: User's email address
        password: Password (min 8 chars, uppercase, lowercase, number)
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    full_name = data.get("full_name", "").strip()
    username = data.get("username", "").strip().lower()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    # Validate required fields
    if not full_name:
        return jsonify({"error": "Full name is required"}), 400
    if not username:
        return jsonify({"error": "Username is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400
    
    # Validate username format
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    if not re.match(r'^[a-z0-9_]+$', username):
        return jsonify({"error": "Username can only contain lowercase letters, numbers, and underscores"}), 400
    
    # Validate email format
    if not validate_email(email):
        return jsonify({"error": "Invalid email format"}), 400
    
    # Validate password
    is_valid, error_msg = validate_password(password)
    if not is_valid:
        return jsonify({"error": error_msg}), 400
    
    # Create user
    result = create_user(full_name, username, email, password)
    
    if "error" in result:
        return jsonify({"error": result["error"]}), 400
    
    # Send verification email
    email_result = send_verification_email(
        email, 
        result["verification_token"],
        full_name
    )
    
    return jsonify({
        "message": "Registration successful. Please check your email to verify your account.",
        "user": {
            "id": result["id"],
            "full_name": result["full_name"],
            "username": result["username"],
            "email": result["email"],
            "is_verified": result["is_verified"]
        },
        "email_sent": "error" not in email_result
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login user
    
    Parameters:
        users: Username or email
        password: User's password
    
    Returns:
        access_token in response body
        refresh_token in HTTP-only cookie
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    users = data.get("users", "").strip()
    password = data.get("password", "")
    
    if not users:
        return jsonify({"error": "Username or email is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400
    
    # Get user by username or email
    user = get_user_by_username_or_email(users)
    
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Verify password
    if not verify_password(password, user["password_hash"]):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Check if email is verified
    if not user["is_verified"]:
        return jsonify({
            "error": "Please verify your email before logging in",
            "email": user["email"],
            "is_verified": False
        }), 403
    
    access_token = generate_token(user["id"], user["username"], token_type="access")
    refresh_token = generate_token(user["id"], user["username"], token_type="refresh")
    
    # Create response with access token in body
    response = make_response(jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "username": user["username"],
            "email": user["email"]
        }
    }))
    
    response.set_cookie(
        "refresh_token",
        refresh_token,
        max_age=JWT_REFRESH_TOKEN_EXPIRES,
        httponly=True,
        secure=True,
        samesite="none"
    )
    
    return response


@auth_bp.route("/refresh", methods=["POST"])
def refresh_token():
    """
    Refresh access token using refresh token from cookie
    
    Returns:
        New access_token in response body
    """
    # Get refresh token from cookie
    token = request.cookies.get("refresh_token")
    
    if not token:
        return jsonify({"error": "Refresh token is required"}), 401
    
    # Decode and validate refresh token
    payload = decode_token(token, expected_type="refresh")
    if "error" in payload:
        return jsonify({"error": payload["error"]}), 401
    
    # Get user from database
    user = get_user_by_id(payload.get("user_id"))
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    # Check if email is verified
    if not user.get("is_verified"):
        return jsonify({"error": "Please verify your email first"}), 403
    
    # Generate new access token
    access_token = generate_token(user["id"], user["username"], token_type="access")
    
    return jsonify({
        "message": "Token refreshed successfully",
        "access_token": access_token
    })


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Logout user by clearing refresh token cookie
    """
    response = make_response(jsonify({
        "message": "Logout successful"
    }))
    
    # Clear refresh token cookie
    response.delete_cookie(
        "refresh_token",
        httponly=True,
        secure=True,
        samesite="none"
    )
    
    return response


@auth_bp.route("/verif-email", methods=["GET"])
def verify_email():
    """
    Verify user email with token
    
    Query Parameters:
        token: Verification token from email
    """
    token = request.args.get("token")
    
    if not token:
        return jsonify({"error": "Verification token is required"}), 400
    
    result = verify_user_email(token)
    
    if "error" in result:
        return jsonify({"error": result["error"]}), 400
    
    return jsonify({
        "message": "Email verified successfully. You can now login.",
        "email": result["email"]
    })


@auth_bp.route("/resend-verification", methods=["POST"])
def resend_verification():
    """
    Resend verification email
    
    Parameters:
        email: User's email address
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    email = data.get("email", "").strip().lower()
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    # Regenerate token
    result = regenerate_verification_token(email)
    
    if "error" in result:
        return jsonify({"error": result["error"]}), 400
    
    # Send verification email
    # Get user info for full_name
    user = get_user_by_username_or_email(email)
    email_result = send_verification_email(
        email,
        result["verification_token"],
        user["full_name"] if user else "User"
    )
    
    return jsonify({
        "message": "Verification email sent",
        "email_sent": "error" not in email_result
    })


@auth_bp.route("/update-profile", methods=["PUT"])
@jwt_required
def update_profile():
    """
    Update user's full name
    
    Requires: JWT Authorization header
    
    Parameters:
        full_name: New full name for the user
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    full_name = data.get("full_name", "").strip()
    
    if not full_name:
        return jsonify({"error": "Full name is required"}), 400
    
    if len(full_name) < 2:
        return jsonify({"error": "Full name must be at least 2 characters"}), 400
    
    # Get current user from jwt_required middleware
    user = g.current_user
    
    result = update_user_full_name(user["id"], full_name)
    
    if "error" in result:
        return jsonify({"error": result["error"]}), 400
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": user["id"],
            "full_name": full_name,
            "username": user["username"],
            "email": user["email"]
        }
    })