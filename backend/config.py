"""
Configuration settings for the OCR API
"""
import os

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

