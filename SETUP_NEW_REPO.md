# Setting Up PWYCRR Git Repository

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `pwycrr`
3. Choose Private or Public
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

## Step 2: Run Setup Script (Recommended)

From the PWYCRR directory, run:

```powershell
.\setup-pwycrr-repo.ps1
```

This script will:
- Initialize git repository (if not already initialized)
- Remove any old remotes
- Add the new remote origin pointing to `https://github.com/MediumThor/pwycrr.git`
- Stage all files
- Create initial commit
- Prepare for push

## Step 3: Push to GitHub

After running the setup script, push your code:

```bash
git push -u origin main
```

When prompted for authentication:
- **Username**: `MediumThor`
- **Password**: Use a Personal Access Token (not your GitHub password)

### Creating a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "PWYCRR Project"
4. Select scopes: Check `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing

## Manual Setup (Alternative)

If you prefer to set up manually:

```bash
# Initialize git (if not already done)
git init

# Remove old remote if it exists
git remote remove origin

# Add new remote
git remote add origin https://github.com/MediumThor/pwycrr.git

# Stage all files
git add .

# Commit
git commit -m "Initial commit for PWYCRR project"

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Repository Information

- **Repository URL**: https://github.com/MediumThor/pwycrr
- **GitHub Username**: MediumThor
- **Project Name**: PWYCRR
