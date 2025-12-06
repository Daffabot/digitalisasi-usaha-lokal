"""
Database Seeders - Run this script to seed initial data
"""
import sqlite3
import time
import hashlib
import secrets
from config import DATABASE_PATH


def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{hashed}"


def seed_users():
    """Seed initial users"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    print("Seeding users...")
    
    users = [
        {
            "full_name": "Admin User",
            "username": "admin",
            "email": "admin@example.com",
            "password": "Admin123!",
            "is_verified": 1
        },
        {
            "full_name": "Test User",
            "username": "testuser",
            "email": "test@example.com",
            "password": "Test123!",
            "is_verified": 1
        },
        {
            "full_name": "Demo User",
            "username": "demo",
            "email": "demo@example.com",
            "password": "Demo123!",
            "is_verified": 0  # Not verified for testing
        }
    ]
    
    now = time.time()
    
    for user in users:
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', 
                      (user["username"], user["email"]))
        if cursor.fetchone():
            print(f"  - User '{user['username']}' already exists, skipping...")
            continue
        
        password_hash = hash_password(user["password"])
        
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
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM users')
    conn.commit()
    conn.close()
    
    print("All users cleared from database")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--clear":
        clear_users()
    else:
        seed_users()
