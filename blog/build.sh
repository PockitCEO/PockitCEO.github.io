#!/bin/bash
# Build script: Convert markdown posts to HTML

POSTS_DIR="blog/posts"
OUTPUT_DIR="blog"
TEMPLATE="blog/template.html"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Process each markdown file
for md_file in "$POSTS_DIR"/*.md; do
    if [ -f "$md_file" ]; then
        filename=$(basename "$md_file" .md)
        html_file="$OUTPUT_DIR/${filename}.html"
        
        echo "Building: $md_file → $html_file"
        
        # Extract title and date from markdown
        title=$(grep "^# " "$md_file" | head -1 | sed 's/^# //')
        date=$(grep "^\*\*Date:\*\*" "$md_file" | sed 's/.*: //')
        
        # Simple markdown to HTML conversion (basic)
        # For production, use a proper markdown parser (marked, showdown, etc.)
        # This is a placeholder for now
        
        echo "  Title: $title"
        echo "  Date: $date"
    fi
done

echo "Build complete. Run 'npm install -g marked' for full markdown rendering."
