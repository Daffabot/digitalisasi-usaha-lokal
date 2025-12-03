"""
PaddleOCR API Server - Main Application Entry Point
"""
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import (
    HOST, PORT, DEBUG,
    RATE_LIMIT_DEFAULT, RATE_LIMIT_BATCH, RATE_LIMIT_DIRECT
)
from routes import register_blueprints
from models.ocr import load_ocr_model, test_paddle_ocr
from services.worker import start_worker
from services.scheduler import start_scheduler, shutdown_scheduler


def create_app():
    """Application factory function"""
    app = Flask(__name__)
    
    # Disable strict slashes globally
    app.url_map.strict_slashes = False
    
    # Enable CORS
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
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
    print(f"Endpoints:")
    print(f"  POST /ocr            - Single image OCR with queue")
    print(f"  POST /ocr/batch      - Batch image OCR with queue")
    print(f"  GET  /take/<job_id>  - Get job results")
    print(f"  GET  /stats          - Server statistics")
    print(f"  GET  /health         - Health check")
    print(f"  POST /ocr/direct     - Direct OCR (no queue)")
    print("=" * 50 + "\n")


def main():
    """Main entry point"""
    try:
        # Load OCR model
        load_ocr_model()
        
        # Test OCR
        test_paddle_ocr()
        
        # Create Flask app
        app = create_app()
        
        # Start background services
        start_worker()
        start_scheduler()
        
        # Print startup info
        print_startup_info()
        
        # Run server
        app.run(
            host=HOST,
            port=PORT,
            threaded=True,
            debug=DEBUG
        )
        
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        shutdown_scheduler()


if __name__ == "__main__":
    main()
