# PaddleOCR API Dockerfile
FROM python:3.11-slim-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV FLASK_DEBUG=0
ENV FLASK_ENV=production
ENV DEBUG=false
ENV KMP_DUPLICATE_LIB_OK=TRUE
ENV OMP_NUM_THREADS=1
ENV MKL_NUM_THREADS=1
ENV OPENBLAS_NUM_THREADS=1
ENV VECLIB_MAXIMUM_THREADS=1
ENV NUMEXPR_NUM_THREADS=1
ENV FLAGS_use_mkldnn=0
ENV FLAGS_allocator_strategy=naive_best_fit

# Set working directory
WORKDIR /app

# Install system dependencies for PaddleOCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p database download

RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Only run init scripts if database does not exist or is empty\n\
if [ ! -f "/app/database/database.db" ] || [ ! -s "/app/database/database.db" ]; then\n\
    echo "=== Initializing Database Tables ==="\n\
    python create_tables.py\n\
    echo "=== Seeding Database ==="\n\
    python seeders.py\n\
else\n\
    echo "=== Database already exists, skipping initialization ==="\n\
fi\n\
\n\
echo "=== Starting Application ==="\n\
exec python app.py\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expose the port
EXPOSE 8000

# Run entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]