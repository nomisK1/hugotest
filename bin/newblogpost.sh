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
FOLDER="content/blog/$(date +%Y/%m/%d)/$SLUG"

# Create post and directory
mkdir -p "$FOLDER"
hugo new --kind blog "$FOLDER/index.md"

# Show result
echo "✅ Blog post created:"
echo "Title: $TITLE"
echo "Slug: $SLUG"
echo "Path: $FOLDER/index.md"

# bin/newblogpost.sh "My First Post"