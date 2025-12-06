"""
Database Models and User Functions - SQLite
"""
import sqlite3
import threading
import time
import hashlib
import secrets
import uuid
from config import DATABASE_PATH, JWT_EMAIL_TOKEN_EXPIRES

# Thread-local storage for database connections
_local = threading.local()


def get_db():
    """Get thread-local database connection"""
    if not hasattr(_local, 'connection'):
        _local.connection = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
        _local.connection.row_factory = sqlite3.Row
    return _local.connection


def close_db():
    """Close database connection"""
    if hasattr(_local, 'connection'):
        _local.connection.close()
        del _local.connection


# ============ Password Functions ============

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{hashed}"


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    try:
        salt, hashed = password_hash.split(':')
        return hashlib.sha256((password + salt).encode()).hexdigest() == hashed
    except:
        return False


def generate_verification_token() -> str:
    """Generate a random verification token"""
    return secrets.token_urlsafe(32)


# ============ User CRUD Functions ============

def create_user(full_name: str, username: str, email: str, password: str) -> dict:
    """
    Create a new user
    
    Returns:
        dict with user info or error
    """
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if username exists
    cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
    if cursor.fetchone():
        return {"error": "Username already exists"}
    
    # Check if email exists
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    if cursor.fetchone():
        return {"error": "Email already exists"}
    
    now = time.time()
    password_hash = hash_password(password)
    verification_token = generate_verification_token()
    token_expires = now + JWT_EMAIL_TOKEN_EXPIRES
    
    try:
        cursor.execute('''
            INSERT INTO users (full_name, username, email, password_hash, 
                             verification_token, verification_token_expires,
                             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (full_name, username, email, password_hash, 
              verification_token, token_expires, now, now))
        conn.commit()
        
        return {
            "id": cursor.lastrowid,
            "full_name": full_name,
            "username": username,
            "email": email,
            "verification_token": verification_token,
            "is_verified": False
        }
    except Exception as e:
        return {"error": str(e)}


def get_user_by_username_or_email(identifier: str) -> dict:
    """Get user by username or email"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, full_name, username, email, password_hash, is_verified
        FROM users 
        WHERE username = ? OR email = ?
    ''', (identifier, identifier))
    
    row = cursor.fetchone()
    if row:
        return {
            "id": row["id"],
            "full_name": row["full_name"],
            "username": row["username"],
            "email": row["email"],
            "password_hash": row["password_hash"],
            "is_verified": bool(row["is_verified"])
        }
    return None


def get_user_by_id(user_id: int) -> dict:
    """Get user by ID"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, full_name, username, email, is_verified
        FROM users WHERE id = ?
    ''', (user_id,))
    
    row = cursor.fetchone()
    if row:
        return {
            "id": row["id"],
            "full_name": row["full_name"],
            "username": row["username"],
            "email": row["email"],
            "is_verified": bool(row["is_verified"])
        }
    return None


def verify_user_email(token: str) -> dict:
    """Verify user email with token"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, email, verification_token_expires, is_verified
        FROM users WHERE verification_token = ?
    ''', (token,))
    
    row = cursor.fetchone()
    if not row:
        return {"error": "Invalid verification token"}
    
    if row["is_verified"]:
        return {"error": "Email already verified"}
    
    if time.time() > row["verification_token_expires"]:
        return {"error": "Verification token has expired"}
    
    # Update user as verified
    cursor.execute('''
        UPDATE users 
        SET is_verified = 1, verification_token = NULL, 
            verification_token_expires = NULL, updated_at = ?
        WHERE id = ?
    ''', (time.time(), row["id"]))
    conn.commit()
    
    return {"success": True, "email": row["email"]}


def regenerate_verification_token(email: str) -> dict:
    """Regenerate verification token for user"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, is_verified FROM users WHERE email = ?', (email,))
    row = cursor.fetchone()
    
    if not row:
        return {"error": "Email not found"}
    
    if row["is_verified"]:
        return {"error": "Email already verified"}
    
    new_token = generate_verification_token()
    token_expires = time.time() + JWT_EMAIL_TOKEN_EXPIRES
    
    cursor.execute('''
        UPDATE users 
        SET verification_token = ?, verification_token_expires = ?, updated_at = ?
        WHERE id = ?
    ''', (new_token, token_expires, time.time(), row["id"]))
    conn.commit()
    
    return {"verification_token": new_token, "email": email}


def get_all_users() -> list:
    """Get all users (for admin/seeder purposes)"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, full_name, username, email, is_verified, created_at
        FROM users ORDER BY created_at DESC
    ''')
    
    return [dict(row) for row in cursor.fetchall()]


# ============ Chat CRUD Functions ============

def create_chat(user_id: int, title: str = None) -> dict:
    """
    Create a new chat
    
    Returns:
        dict with chat info
    """
    conn = get_db()
    cursor = conn.cursor()
    
    chat_id = str(uuid.uuid4())
    now = time.time()
    
    try:
        cursor.execute('''
            INSERT INTO chats (chat_id, user_id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (chat_id, user_id, title, now, now))
        conn.commit()
        
        return {
            "id": cursor.lastrowid,
            "chat_id": chat_id,
            "user_id": user_id,
            "title": title,
            "created_at": now
        }
    except Exception as e:
        return {"error": str(e)}


def get_chat_by_id(chat_id: str) -> dict:
    """Get chat by chat_id"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, chat_id, user_id, title, created_at, updated_at
        FROM chats WHERE chat_id = ?
    ''', (chat_id,))
    
    row = cursor.fetchone()
    if row:
        return {
            "id": row["id"],
            "chat_id": row["chat_id"],
            "user_id": row["user_id"],
            "title": row["title"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        }
    return None


def get_chats_by_user(user_id: int) -> list:
    """Get all chats for a user"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, chat_id, user_id, title, created_at, updated_at
        FROM chats WHERE user_id = ? ORDER BY updated_at DESC
    ''', (user_id,))
    
    return [dict(row) for row in cursor.fetchall()]


def update_chat_title(chat_id: str, title: str) -> bool:
    """Update chat title"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE chats SET title = ?, updated_at = ? WHERE chat_id = ?
    ''', (title, time.time(), chat_id))
    conn.commit()
    
    return cursor.rowcount > 0


def update_chat_timestamp(chat_id: str) -> bool:
    """Update chat timestamp"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE chats SET updated_at = ? WHERE chat_id = ?
    ''', (time.time(), chat_id))
    conn.commit()
    
    return cursor.rowcount > 0


# ============ Chat Message CRUD Functions ============

def add_chat_message(chat_id: str, message: str, role: str) -> dict:
    """
    Add a message to a chat
    
    Args:
        chat_id: Chat ID
        message: Message content
        role: Role (user/assistant/system)
    
    Returns:
        dict with message info
    """
    conn = get_db()
    cursor = conn.cursor()
    
    # Get next order number
    cursor.execute('''
        SELECT COALESCE(MAX(message_order), 0) + 1 FROM chat_messages WHERE chat_id = ?
    ''', (chat_id,))
    next_order = cursor.fetchone()[0]
    
    now = time.time()
    
    try:
        cursor.execute('''
            INSERT INTO chat_messages (chat_id, message, role, message_order, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (chat_id, message, role, next_order, now))
        conn.commit()
        
        # Update chat timestamp
        update_chat_timestamp(chat_id)
        
        return {
            "id": cursor.lastrowid,
            "chat_id": chat_id,
            "message": message,
            "role": role,
            "message_order": next_order,
            "created_at": now
        }
    except Exception as e:
        return {"error": str(e)}


def get_chat_messages(chat_id: str) -> list:
    """Get all messages for a chat in order"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, chat_id, message, role, message_order, created_at
        FROM chat_messages 
        WHERE chat_id = ? 
        ORDER BY message_order ASC
    ''', (chat_id,))
    
    return [dict(row) for row in cursor.fetchall()]


def get_chat_messages_for_api(chat_id: str) -> list:
    """Get messages formatted for AI API"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT message as content, role
        FROM chat_messages 
        WHERE chat_id = ? 
        ORDER BY message_order ASC
    ''', (chat_id,))
    
    return [{"content": row["content"], "role": row["role"]} for row in cursor.fetchall()]
