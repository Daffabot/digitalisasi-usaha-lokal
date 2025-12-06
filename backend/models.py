"""
Database Models and User Functions - Multi-Database Support (SQLite and PostgreSQL)
"""
import sqlite3
import psycopg2
import psycopg2.extras
from psycopg2 import pool
import time
import hashlib
import secrets
import uuid
from contextlib import contextmanager
from config import (
    DATABASE_TYPE, DATABASE_PATH,
    POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_SSLMODE,
    JWT_EMAIL_TOKEN_EXPIRES
)

# Connection pool for PostgreSQL
_pg_pool = None


def init_pg_pool():
    """Initialize PostgreSQL connection pool"""
    global _pg_pool
    if _pg_pool is None:
        _pg_pool = pool.ThreadedConnectionPool(
            minconn=2,
            maxconn=20,
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            dbname=POSTGRES_DB,
            sslmode=POSTGRES_SSLMODE,
            connect_timeout=10
        )
        print(f"[INFO] PostgreSQL connection pool initialized")


@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = None
    try:
        if DATABASE_TYPE == "postgresql":
            if _pg_pool is None:
                init_pg_pool()
            conn = _pg_pool.getconn()
            conn.autocommit = False
            yield conn
            conn.commit()
        else:  # sqlite
            conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
            conn.row_factory = sqlite3.Row
            yield conn
            conn.commit()
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except:
                pass
        raise e
    finally:
        if conn:
            if DATABASE_TYPE == "postgresql":
                try:
                    conn.rollback()  # Cleanup any pending transaction
                    _pg_pool.putconn(conn)
                except Exception as e:
                    print(f"[WARN] Error returning connection to pool: {e}")
                    try:
                        conn.close()
                    except:
                        pass
            else:
                try:
                    conn.close()
                except:
                    pass


def get_cursor(conn):
    """Get cursor based on database type"""
    if DATABASE_TYPE == "postgresql":
        return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    return conn.cursor()


def execute_query(cursor, query, params=None):
    """Execute query with proper parameter substitution"""
    if DATABASE_TYPE == "postgresql":
        query = query.replace('?', '%s')
    if params:
        cursor.execute(query, params)
    else:
        cursor.execute(query)


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
    """Create a new user"""
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        # Check if username exists
        execute_query(cursor, 'SELECT id FROM users WHERE username = ?', (username,))
        if cursor.fetchone():
            return {"error": "Username already exists"}
        
        # Check if email exists
        execute_query(cursor, 'SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            return {"error": "Email already exists"}
        
        now = time.time()
        password_hash = hash_password(password)
        verification_token = generate_verification_token()
        token_expires = now + JWT_EMAIL_TOKEN_EXPIRES
        
        try:
            if DATABASE_TYPE == "postgresql":
                query = '''
                    INSERT INTO users (full_name, username, email, password_hash, 
                                     verification_token, verification_token_expires,
                                     created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                '''
                cursor.execute(query, (full_name, username, email, password_hash, 
                      verification_token, token_expires, now, now))
                user_id = cursor.fetchone()['id']
            else:
                query = '''
                    INSERT INTO users (full_name, username, email, password_hash, 
                                     verification_token, verification_token_expires,
                                     created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                '''
                cursor.execute(query, (full_name, username, email, password_hash, 
                      verification_token, token_expires, now, now))
                user_id = cursor.lastrowid
            
            return {
                "id": user_id,
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
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, '''
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
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, '''
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
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, '''
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
        if DATABASE_TYPE == "postgresql":
            query = '''
                UPDATE users 
                SET is_verified = TRUE, verification_token = NULL, 
                    verification_token_expires = NULL, updated_at = %s
                WHERE id = %s
            '''
        else:
            query = '''
                UPDATE users 
                SET is_verified = 1, verification_token = NULL, 
                    verification_token_expires = NULL, updated_at = ?
                WHERE id = ?
            '''
        
        cursor.execute(query, (time.time(), row["id"]))
        
        return {"success": True, "email": row["email"]}


def regenerate_verification_token(email: str) -> dict:
    """Regenerate verification token for user"""
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, 'SELECT id, is_verified FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        
        if not row:
            return {"error": "Email not found"}
        
        if row["is_verified"]:
            return {"error": "Email already verified"}
        
        new_token = generate_verification_token()
        token_expires = time.time() + JWT_EMAIL_TOKEN_EXPIRES
        
        execute_query(cursor, '''
            UPDATE users 
            SET verification_token = ?, verification_token_expires = ?, updated_at = ?
            WHERE id = ?
        ''', (new_token, token_expires, time.time(), row["id"]))
        
        return {"verification_token": new_token, "email": email}


def get_all_users() -> list:
    """Get all users (for admin/seeder purposes)"""
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, '''
            SELECT id, full_name, username, email, is_verified, created_at
            FROM users ORDER BY created_at DESC
        ''')
        
        return [dict(row) for row in cursor.fetchall()]


# ============ Chat CRUD Functions ============

def create_chat(user_id: int, title: str = None) -> dict:
    """Create a new chat"""
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        chat_id = str(uuid.uuid4())
        now = time.time()
        
        try:
            if DATABASE_TYPE == "postgresql":
                query = '''
                    INSERT INTO chats (chat_id, user_id, title, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                '''
                cursor.execute(query, (chat_id, user_id, title, now, now))
                pk_id = cursor.fetchone()['id']
            else:
                query = '''
                    INSERT INTO chats (chat_id, user_id, title, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                '''
                cursor.execute(query, (chat_id, user_id, title, now, now))
                pk_id = cursor.lastrowid
            
            return {
                "id": pk_id,
                "chat_id": chat_id,
                "user_id": user_id,
                "title": title,
                "created_at": now
            }
        except Exception as e:
            return {"error": str(e)}


def get_chat_by_id(chat_id: str) -> dict:
    """Get chat by chat_id"""
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, '''
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
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, '''
            SELECT id, chat_id, user_id, title, created_at, updated_at
            FROM chats WHERE user_id = ? ORDER BY updated_at DESC
        ''', (user_id,))
        
        return [dict(row) for row in cursor.fetchall()]


def update_chat_title(chat_id: str, title: str) -> bool:
    """Update chat title"""
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, '''
            UPDATE chats SET title = ?, updated_at = ? WHERE chat_id = ?
        ''', (title, time.time(), chat_id))
        
        return cursor.rowcount > 0


def update_chat_timestamp(chat_id: str) -> bool:
    """Update chat timestamp"""
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, '''
            UPDATE chats SET updated_at = ? WHERE chat_id = ?
        ''', (time.time(), chat_id))
        
        return cursor.rowcount > 0


# ============ Chat Message CRUD Functions ============

def add_chat_message(chat_id: str, message: str, role: str) -> dict:
    """Add a message to a chat"""
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        # Get next order number
        if DATABASE_TYPE == "postgresql":
            query = '''
                SELECT COALESCE(MAX(message_order), 0) + 1 FROM chat_messages WHERE chat_id = %s
            '''
        else:
            query = '''
                SELECT COALESCE(MAX(message_order), 0) + 1 FROM chat_messages WHERE chat_id = ?
            '''
        
        cursor.execute(query, (chat_id,))
        result = cursor.fetchone()
        next_order = result[0] if DATABASE_TYPE == "sqlite" else list(result.values())[0]
        
        now = time.time()
        
        try:
            if DATABASE_TYPE == "postgresql":
                query = '''
                    INSERT INTO chat_messages (chat_id, message, role, message_order, created_at)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                '''
                cursor.execute(query, (chat_id, message, role, next_order, now))
                msg_id = cursor.fetchone()['id']
            else:
                query = '''
                    INSERT INTO chat_messages (chat_id, message, role, message_order, created_at)
                    VALUES (?, ?, ?, ?, ?)
                '''
                cursor.execute(query, (chat_id, message, role, next_order, now))
                msg_id = cursor.lastrowid
            
            # Update chat timestamp (in same transaction)
            execute_query(cursor, '''
                UPDATE chats SET updated_at = ? WHERE chat_id = ?
            ''', (now, chat_id))
            
            return {
                "id": msg_id,
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
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, '''
            SELECT id, chat_id, message, role, message_order, created_at
            FROM chat_messages 
            WHERE chat_id = ? 
            ORDER BY message_order ASC
        ''', (chat_id,))
        
        return [dict(row) for row in cursor.fetchall()]


def get_chat_messages_for_api(chat_id: str) -> list:
    """Get messages formatted for AI API"""
    with get_db_connection() as conn:
        cursor = get_cursor(conn)
        
        execute_query(cursor, '''
            SELECT message as content, role
            FROM chat_messages 
            WHERE chat_id = ? 
            ORDER BY message_order ASC
        ''', (chat_id,))
        
        return [{"content": row["content"], "role": row["role"]} for row in cursor.fetchall()]
