#!/bin/bash
# This script generates a playlist of all .flac and .mp3 files
# in a specified directory and saves it as a JSON file.
#
# Requires `jq` to be installed: sudo apt-get install jq
#
# The script should be run from the root of the 'spins' project directory.
# The generated playlist.json will be created in the same directory.

set -e

MUSIC_DIR="/mnt/music"
OUTPUT_FILE="playlist.json"

# Check if the MUSIC_DIR exists
if [ ! -d "$MUSIC_DIR" ]; then
  echo "Error: Music directory '$MUSIC_DIR' not found."
  echo "Please ensure your NFS share is mounted correctly."
  exit 1
fi

echo "Searching for music files in '$MUSIC_DIR'..."

# Find all .flac and .mp3 files and format them as a JSON array.
# The `find` command gets the list of files.
# We then pipe this to `jq` to create a valid JSON array of strings.
# The paths in the JSON will be absolute (e.g., "/mnt/music/Artist/Album/Song.flac").
find "$MUSIC_DIR" -type f \( -iname "*.flac" -o -iname "*.mp3" \) | jq -R . | jq -s . > "$OUTPUT_FILE"

echo "Success! Playlist generated at '$OUTPUT_FILE' with $(jq 'length' "$OUTPUT_FILE") tracks."
