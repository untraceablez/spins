#!/bin/bash
# This script starts a simple web server to serve music files
# from the /mnt/music directory. This allows the web browser
# to access the audio files for playback.
#
# This script should be run on the same machine where the
# browser is running.

set -e

MUSIC_DIR="/mnt/music"
PORT=8000

# Check if the MUSIC_DIR exists
if [ ! -d "$MUSIC_DIR" ]; then
  echo "Error: Music directory '$MUSIC_DIR' not found."
  echo "Please ensure your NFS share is mounted correctly."
  exit 1
fi

echo "---------------------------------------------------"
echo "Starting music server on port $PORT"
echo "Serving files from: $MUSIC_DIR"
echo "Access files at: http://localhost:$PORT"
echo "To stop the server, press Ctrl+C"
echo "---------------------------------------------------"

# This command starts a simple Python web server.
# The --directory flag tells it which folder to serve.
python3 -m http.server -b 127.0.0.1 --directory "$MUSIC_DIR" "$PORT"
