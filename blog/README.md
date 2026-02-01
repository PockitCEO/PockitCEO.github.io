# Blog Workflow

## Structure

```
blog/
├── posts/           # Markdown source files
│   ├── 260201-diamond-architecture.md
│   └── 260201-pcp-introduction.md
├── 260201-diamond-architecture.html  # Generated HTML
└── build.sh         # Markdown → HTML converter
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

3. Run build script (when ready): `./blog/build.sh`
4. Commit both `.md` and `.html` files

## Current Posts

- `260201-diamond-architecture.md` - Why Diamond (EIP-2535) for Onchain Games

## TODO

- [ ] Automate markdown → HTML conversion (marked, showdown, or custom parser)
- [ ] Add syntax highlighting for code blocks (Prism.js)
- [ ] Generate index page from markdown files automatically
- [ ] RSS feed generation
