# ── Stage 1: Base image ──────────────────────────────────────────────────────
# python:3.11-slim = Python 3.11 on minimal Debian (no bloat)
FROM python:3.11-slim

# ── Stage 2: Set working directory inside the container ──────────────────────
# All commands from here execute inside /app
WORKDIR /app

# ── Stage 3: Install dependencies ────────────────────────────────────────────
# Copy requirements FIRST so Docker caches this layer.
# If only your code changes (not requirements), Docker skips re-installing — much faster.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 4: Copy your actual code ───────────────────────────────────────────
# Copied AFTER pip install so code changes don't bust the pip cache layer
COPY . .

# ── Stage 5: Tell Docker which port this app listens on ──────────────────────
# This is documentation only — doesn't actually open the port (that's -p in docker run)
EXPOSE 8000

# ── Stage 6: Start the server ────────────────────────────────────────────────
# host 0.0.0.0 = accept connections from outside the container (required!)
# $PORT = Render/Railway injects this env var automatically
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
