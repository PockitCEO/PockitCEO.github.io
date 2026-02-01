# GitHub Pages Setup

This site uses GitHub Actions for deployment.

## Configuration Required

1. Go to: https://github.com/PockitCEO/pockitceo/settings/pages
2. Under "Build and deployment":
   - Source: **GitHub Actions** (not "Deploy from a branch")
3. Save

The workflow (`.github/workflows/deploy.yml`) will:
- Convert markdown posts to HTML using `marked`
- Apply styling template
- Deploy to GitHub Pages

## First Deploy

After pushing the workflow file, GitHub Actions will run automatically on the next commit to `main`.

Check status: https://github.com/PockitCEO/pockitceo/actions
