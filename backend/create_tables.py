"""
Create Database Tables - Run this script to initialize the database
Supports both SQLite and PostgreSQL
"""
import sqlite3
import psycopg2
import os
from config import (
    DATABASE_TYPE, DATABASE_PATH,
    POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_SSLMODE
)


def create_tables_sqlite():
    """Create all database tables for SQLite"""
    db_dir = os.path.dirname(DATABASE_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir)
        print(f"Created database directory: {db_dir}")
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    print(f"Creating SQLite tables in database: {DATABASE_PATH}")
    
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
    
    print("\nSQLite database tables created successfully!")


def create_tables_postgresql():
    """Create all database tables for PostgreSQL"""
    conn = psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        dbname=POSTGRES_DB,
        sslmode=POSTGRES_SSLMODE
    )
    cursor = conn.cursor()
    
    print(f"Creating PostgreSQL tables in database: {POSTGRES_DB}")
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            verification_token TEXT,
            verification_token_expires DOUBLE PRECISION,
            created_at DOUBLE PRECISION NOT NULL,
            updated_at DOUBLE PRECISION NOT NULL
        )
    ''')
    print("  - Created 'users' table")
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id SERIAL PRIMARY KEY,
            chat_id TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            title TEXT,
            created_at DOUBLE PRECISION NOT NULL,
            updated_at DOUBLE PRECISION NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    print("  - Created 'chats' table")
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            chat_id TEXT NOT NULL,
            message TEXT NOT NULL,
            role TEXT NOT NULL,
            message_order INTEGER NOT NULL,
            created_at DOUBLE PRECISION NOT NULL,
            FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE
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
    
    print("\nPostgreSQL database tables created successfully!")


def create_tables():
    """Create tables based on DATABASE_TYPE configuration"""
    if DATABASE_TYPE == "postgresql":
        create_tables_postgresql()
    else:
        create_tables_sqlite()


if __name__ == "__main__":
    print(f"Database Type: {DATABASE_TYPE}")
    create_tables()
