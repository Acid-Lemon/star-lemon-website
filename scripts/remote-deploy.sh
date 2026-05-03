#!/bin/bash
set -e

REMOTE_DIR="/www/wwwroot/star-lemon.top"
START_SCRIPT="/www/server/nodejs/vhost/scripts/star_lemon_top.sh"
PID_FILE="/www/server/nodejs/vhost/pids/star_lemon_top.pid"
ARCHIVE_NAME="$1"

export PATH=/www/server/nodejs/v24.15.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin

echo "=== Star Lemon Remote Deploy ==="

# Stop existing service
echo "[1/3] Stopping service..."
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "Stopping process $PID"
        kill -9 "$PID"
    else
        echo "Process $PID not running"
    fi
    rm -f "$PID_FILE"
fi

# Kill orphaned processes on port 3000
ORPHAN=$(netstat -tlnp 2>/dev/null | grep ':3000' | awk '{print $7}' | cut -d'/' -f1 | head -1)
if [ -n "$ORPHAN" ] && [ "$ORPHAN" != '-' ]; then
    echo "Killing orphaned next-server $ORPHAN"
    kill -9 "$ORPHAN" 2>/dev/null || true
fi

sleep 2

# Extract archive
echo "[2/3] Extracting archive..."
cd "$REMOTE_DIR"
tar -xzf "$ARCHIVE_NAME"
rm -f "$ARCHIVE_NAME"

# Install dependencies
echo "[3/3] Installing dependencies and starting..."
pnpm install --frozen-lockfile --prod

# Start via BT script
bash "$START_SCRIPT"

sleep 3

# Verify startup
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "Service started successfully, PID $PID"
    else
        echo "WARNING: PID file exists but process not running"
        exit 1
    fi
else
    echo "WARNING: PID file not found"
    exit 1
fi

# Check port
if netstat -tlnp 2>/dev/null | grep -q ':3000'; then
    echo "Port 3000 is listening"
else
    echo "Port 3000 not listening"
    exit 1
fi

echo "=== Deploy completed ==="
