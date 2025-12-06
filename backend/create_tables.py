"""
Create Database Tables - Run this script to initialize the database
"""
import sqlite3
import os
from config import DATABASE_PATH


def create_tables():
    """Create all database tables"""
    db_dir = os.path.dirname(DATABASE_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)
        print(f"Created database directory: {db_dir}")
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    print(f"Creating tables in database: {DATABASE_PATH}")
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_verified INTEGER DEFAULT 0,
            verification_token TEXT,
            verification_token_expires REAL,
            created_at REAL NOT NULL,
            updated_at REAL NOT NULL
        )
    ''')
    print("  - Created 'users' table")
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            title TEXT,
            created_at REAL NOT NULL,
            updated_at REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    print("  - Created 'chats' table")
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id TEXT NOT NULL,
            message TEXT NOT NULL,
            role TEXT NOT NULL,
            message_order INTEGER NOT NULL,
            created_at REAL NOT NULL,
            FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
        )
    ''')
    print("  - Created 'chat_messages' table")
    
    # Create indexes for faster lookups
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chats_chat_id ON chats(chat_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chat_messages_order ON chat_messages(chat_id, message_order)')
    print("  - Created indexes")
    
    conn.commit()
    conn.close()
    
    print("\nDatabase tables created successfully!")


if __name__ == "__main__":
    create_tables()
