# Website Template

## Setup Instructions

### 1. Enable GitHub Pages
1. Go to your repository **Settings**
2. Navigate to **Pages** in the left sidebar
3. Under "Source", select your branch (usually `main`)
4. Click **Save**

### 2. Configure Custom Domain
1. In the **Pages** settings, enter your custom domain
2. Update the `CNAME` file in this repository with your domain name

### 3. Configure DNS
Point your domain to GitHub Pages by adding these A records to your DNS provider:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

For subdomains (e.g., `www`), add a CNAME record pointing to `<username>.github.io`.
