"""
PaddleOCR API Server - Main Application Entry Point
"""
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import (
    HOST, PORT, DEBUG, ORIGIN_URL,
    RATE_LIMIT_DEFAULT, RATE_LIMIT_BATCH, RATE_LIMIT_DIRECT
)
from routes import register_blueprints
from ml.ocr import load_ocr_model
from models import init_pg_pool, get_db_connection
from core.worker import start_worker
from core.scheduler import start_scheduler, shutdown_scheduler


def init_db():
    """Initialize database - ensure tables exist"""
    from config import DATABASE_TYPE
    
    if DATABASE_TYPE == "postgresql":
        print("Using PostgreSQL database")
        # Initialize connection pool
        init_pg_pool()
        # Test the connection
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            print("PostgreSQL connection successful")
    else:
        print("Using SQLite database")
        # For SQLite, create database file if not exists
        import os
        from config import DATABASE_PATH
        db_dir = os.path.dirname(DATABASE_PATH)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir)
            print(f"Created database directory: {db_dir}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Create users table if not exists
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
            
            # Create indexes
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)')
    
    print("Database initialized successfully")


def create_app():
    """Application factory function"""
    app = Flask(__name__)
    
    # Disable strict slashes globally
    app.url_map.strict_slashes = False
    
    CORS(app, resources={
        r"/*": {
            "origins": ORIGIN_URL,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Setup rate limiting
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=[RATE_LIMIT_DEFAULT],
        storage_uri="memory://"
    )
    
    # Apply specific rate limits to routes
    @app.before_request
    def apply_rate_limits():
        pass  # Rate limits are applied via decorators
    
    # Store limiter on app for use in routes if needed
    app.limiter = limiter
    
    # Register blueprints
    register_blueprints(app)
    
    return app


def print_startup_info():
    """Print server startup information"""
    print("\n" + "=" * 50)
    print("PaddleOCR API Server")
    print("=" * 50)
    print(f"Authentication Endpoints:")
    print(f"  POST /auth/register       - Register new user")
    print(f"  POST /auth/login          - Login (get JWT token)")
    print(f"  GET  /auth/verify-email   - Verify email")
    print(f"  POST /auth/resend-verification - Resend verification email")
    print(f"\nProtected OCR Endpoints (requires JWT):")
    print(f"  POST /ocr            - Single image OCR with queue")
    print(f"  POST /ocr/batch      - Batch image OCR with queue")
    print(f"  GET  /take/<job_id>  - Get job results")
    print(f"  POST /ocr/direct     - Direct OCR (no queue)")
    print(f"\nPublic Endpoints:")
    print(f"  GET  /stats          - Server statistics")
    print(f"  GET  /health         - Health check")
    print("=" * 50 + "\n")

# Create Flask app
app = create_app()

def main():
    """Main entry point"""
    try:
        # Initialize database
        init_db()
        
        # Load OCR model
        load_ocr_model()
        
        print("PaddleOCR ready (test skipped)")
        
        # Start background services
        start_worker()
        start_scheduler()
        
        # Print startup info
        print_startup_info()
        
        app.run(
            host=HOST,
            port=PORT,
            threaded=True,
            debug=False,  # Force disable debug mode
            use_reloader=False  # Disable reloader to keep jobs in memory
        )
        
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        shutdown_scheduler()


if __name__ == "__main__":
    main()
