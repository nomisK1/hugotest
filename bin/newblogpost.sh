#!/bin/bash

# Validate input
if [ -z "$1" ]; then
  echo "Usage: $0 \"Post Title\""
  exit 1
fi

# Set variables
TITLE="$1"
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' \
                     | sed -E 's/[^a-z0-9]+/-/g' \
                     | sed -E 's/^-+|-+$//g')
FOLDER="content/posts/$(date +%Y/%m/%d)/$SLUG"
FILE_PATH="$FOLDER/index.md"

# Create post and directory
mkdir -p "$FOLDER"
hugo new --kind posts "$FILE_PATH"

# Replace auto-generated title
sed -i "s/^title: .*/title: \"$TITLE\"/" "$FILE_PATH"

echo "Created: $FILE_PATH with title: $TITLE"

# bin/newblogpost.sh "nameMe-draft"