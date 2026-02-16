# GitHub Setup Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Enter Repository name: `it-clinic` (or any name you prefer)
3. Add Description: "IT Clinic - Service & Tech Store - A modern web app for IT services and products"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README (we already have one)
6. Click **Create repository**

## Step 2: Push Your Code

After creating the repo, run these commands in your terminal (in the project folder):

```bash
# Add all files to git
git add .

# Commit the files
git commit -m "Initial commit - IT Clinic web application"

# Connect to your GitHub repo (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/it-clinic.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify on GitHub

1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. The README should display automatically

## Step 4: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New Project**
3. Find and select your `it-clinic` repository
4. Click **Import**

### Configure Environment Variables in Vercel:

In the Vercel dashboard during deployment:

1. Expand **Environment Variables**
2. Add these variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your_supabase_project_url |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your_supabase_anon_key |

3. Click **Deploy**

Wait for the build to complete. Your site will be live at `https://it-clinic.vercel.app` (or similar).

## Alternative: Using GitHub Desktop (GUI)

If you prefer a graphical interface:

1. Download GitHub Desktop: https://desktop.github.com/
2. Sign in with your GitHub account
3. Click **File > Add local repository**
4. Select your `D:\it-clinic` folder
5. Click **Publish repository**
6. Fill in the name and description
7. Click **Publish**

## Troubleshooting

### "fatal: not a git repository"
Run: `git init` first

### "fatal: remote origin already exists"
Run: `git remote remove origin` then try again

### "failed to push some refs"
Run: `git pull origin main --rebase` then `git push`

### Large file errors
If you get errors about large files, make sure `node_modules` is in `.gitignore` (it should be already)
