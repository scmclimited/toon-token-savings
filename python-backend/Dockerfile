# Backend Dockerfile for TOON Token Savings Demo
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade pip

# Copy backend source (including requirements) and pyproject for editable install
COPY pyproject.toml ./
COPY python-backend ./python-backend
COPY data ./data

# Install Python dependencies
RUN pip install --no-cache-dir -r python-backend/requirements.txt \
    && pip install --no-cache-dir -e .

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/docs')" || exit 1

# Run the FastAPI server
CMD ["uvicorn", "src.server:app", "--host", "0.0.0.0", "--port", "8000"]

