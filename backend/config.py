"""
Configuration settings for the OCR API
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Queue Configuration
MAX_QUEUE_SIZE = 100
JOB_EXPIRY = 43200  # 12 hours
AVG_TIME = 10  # 2 seconds per job

# File Configuration
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
MAX_BATCH_SIZE = 100
MAX_IMAGE_DIMENSION = 1920

# Rate Limiting
RATE_LIMIT_DEFAULT = "10 per minute"
RATE_LIMIT_BATCH = "5 per minute"
RATE_LIMIT_DIRECT = "5 per minute"

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# PaddleOCR Configuration
OCR_LANG = "id"
OCR_DEVICE = "cpu"
TEXT_DET_THRESH = 0.3
TEXT_DET_BOX_THRESH = 0.5
TEXT_RECOGNITION_BATCH_SIZE = 6

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ACCESS_TOKEN_EXPIRES = 60 * 5  # 5 minutes
JWT_REFRESH_TOKEN_EXPIRES = 60 * 60 * 24 * 30  # 1 month
JWT_EMAIL_TOKEN_EXPIRES = 3600  # 1 hour for email verification

# Database Configuration
DATABASE_TYPE = os.getenv("DATABASE_TYPE", "sqlite")  # sqlite or postgresql
DATABASE_PATH = os.getenv("DATABASE_PATH", "database/database.db")  # for SQLite

# PostgreSQL Configuration
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", 5432))
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")
POSTGRES_DB = os.getenv("POSTGRES_DB", "excel_pdf_db")
POSTGRES_SSLMODE = os.getenv("POSTGRES_SSLMODE", "require")

# Resend Configuration for Email
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@yourdomain.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Kolosal AI configuration
KOLOSAL_API_KEY = os.getenv("KOLOSAL_API_KEY", "")
KOLOSAL_API_URL = "https://api.kolosal.ai/v1/chat/completions"
KOLOSAL_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct"
KOLOSAL_MAX_TOKENS = int(os.getenv("KOLOSAL_MAX_TOKENS", 1000))

# Kolosal OCR API configuration
KOLOSAL_OCR_API_KEY = os.getenv("KOLOSAL_OCR_API_KEY", "")
KOLOSAL_OCR_API_URL = "https://api.kolosal.ai/ocr"

DOWNLOAD_DIR = os.getenv("DOWNLOAD_DIR", "download")

ORIGIN_URL = os.getenv("ORIGIN_URL", "http://localhost:3000,http://localhost:5173").split(",")