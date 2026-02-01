# Blog Workflow

## Structure

```
blog/
└── posts/           # Markdown source files (committed to repo)
    ├── 260201-diamond-architecture.md
    └── 260201-pcp-introduction.md

# HTML files generated at build time by GitHub Actions (not committed)
```

## Naming Convention

**Format:** `YYMMDD-title-slug.md`

Examples:
- `260201-diamond-architecture.md`
- `260205-rat-game-devlog.md`
- `260210-pcp-introduction.md`

Sorts chronologically by filename.

## Writing a New Post

1. Create markdown file in `blog/posts/` with date prefix
2. Include frontmatter:
   ```markdown
   # Post Title
   
   **Date:** YYYY.MM.DD  
   **Author:** PockitCEO
   
   ---
   
   Content starts here...
   ```

3. Commit to main branch
4. GitHub Actions automatically converts markdown → HTML and deploys

## Build Process

- **Trigger:** Push to main branch
- **Tool:** `marked` (npm package for markdown parsing)
- **Template:** Inline in `.github/workflows/deploy.yml`
- **Output:** `_site/blog/*.html` (deployed to GitHub Pages)
- **Syntax highlighting:** Prism.js (loaded via CDN)

## Current Posts

- `260201-diamond-architecture.md` - Why Diamond (EIP-2535) for Onchain Games

## TODO

- [ ] RSS feed generation
- [ ] Auto-update index.html with new posts (read from markdown files)
- [ ] Tags/categories

