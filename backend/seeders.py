"""
Database Seeders - Run this script to seed initial data
Supports both SQLite and PostgreSQL
"""
import sqlite3
import psycopg2
import psycopg2.extras
import time
import hashlib
import secrets
from config import (
    DATABASE_TYPE, DATABASE_PATH,
    POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_SSLMODE
)


def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{hashed}"


def get_connection():
    """Get database connection based on type"""
    if DATABASE_TYPE == "postgresql":
        return psycopg2.connect(
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            dbname=POSTGRES_DB,
            sslmode=POSTGRES_SSLMODE
        )
    else:
        return sqlite3.connect(DATABASE_PATH)


def seed_users():
    """Seed initial users"""
    conn = get_connection()
    
    if DATABASE_TYPE == "postgresql":
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    else:
        cursor = conn.cursor()
    
    print(f"Seeding users to {DATABASE_TYPE.upper()} database...")
    
    users = [
        {
            "full_name": "Admin User",
            "username": "admin",
            "email": "admin@example.com",
            "password": "Admin123!",
            "is_verified": True if DATABASE_TYPE == "postgresql" else 1
        },
        {
            "full_name": "Test User",
            "username": "testuser",
            "email": "test@example.com",
            "password": "Test123!",
            "is_verified": True if DATABASE_TYPE == "postgresql" else 1
        },
        {
            "full_name": "Demo User",
            "username": "demo",
            "email": "demo@example.com",
            "password": "Demo123!",
            "is_verified": False if DATABASE_TYPE == "postgresql" else 0  # Not verified for testing
        }
    ]
    
    now = time.time()
    
    for user in users:
        # Check if user already exists
        if DATABASE_TYPE == "postgresql":
            cursor.execute('SELECT id FROM users WHERE username = %s OR email = %s', 
                          (user["username"], user["email"]))
        else:
            cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', 
                          (user["username"], user["email"]))
        
        if cursor.fetchone():
            print(f"  - User '{user['username']}' already exists, skipping...")
            continue
        
        password_hash = hash_password(user["password"])
        
        if DATABASE_TYPE == "postgresql":
            cursor.execute('''
                INSERT INTO users (full_name, username, email, password_hash, 
                                 is_verified, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (user["full_name"], user["username"], user["email"], 
                  password_hash, user["is_verified"], now, now))
        else:
            cursor.execute('''
                INSERT INTO users (full_name, username, email, password_hash, 
                                 is_verified, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (user["full_name"], user["username"], user["email"], 
                  password_hash, user["is_verified"], now, now))
        
        print(f"  - Created user: {user['username']} ({user['email']})")
    
    conn.commit()
    conn.close()
    
    print("\nSeeding completed!")
    print("\nTest credentials:")
    print("  Admin:  admin / Admin123!")
    print("  User:   testuser / Test123!")
    print("  Demo:   demo / Demo123! (not verified)")


def clear_users():
    """Clear all users from database"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Delete all users (cascade will delete chats and messages)
    cursor.execute('DELETE FROM users')
    conn.commit()
    conn.close()
    
    print(f"All users cleared from {DATABASE_TYPE.upper()} database")


if __name__ == "__main__":
    import sys
    
    print(f"Database Type: {DATABASE_TYPE}")
    
    if len(sys.argv) > 1 and sys.argv[1] == "--clear":
        clear_users()
    else:
        seed_users()
