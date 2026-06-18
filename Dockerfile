# syntax=docker/dockerfile:1

# ---- Stage 1: Build Frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Serve Backend & Frontend ----
FROM python:3.11-slim AS runner
WORKDIR /app/backend

# Install build dependencies if needed (none are strictly required for standard requirements, but lets keep it clean)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY backend/ ./

# Copy compiled frontend static assets from Stage 1 into the location expected by main.py
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# SQLite persistence directory (mount volume here)
ENV DATA_DIR=/app/backend/data
ENV NODE_ENV=production
RUN mkdir -p /app/backend/data

VOLUME ["/app/backend/data"]
EXPOSE 3000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
