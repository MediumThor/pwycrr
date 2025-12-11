# Push PWYCRR to GitHub - Instructions

## Quick Setup (If Git is Installed)

Run the PowerShell script:
```powershell
.\push-to-github.ps1
```

## Manual Setup (Step by Step)

If you prefer to run commands manually, or if the script doesn't work:

### 1. Navigate to Project Directory
```powershell
cd "C:\Users\User\Desktop\Coding\PWYCRR\PWYCRR"
```

### 2. Initialize Git (if not already done)
```bash
git init
```

### 3. Remove Old Remote (if exists)
```bash
git remote remove origin
```

### 4. Add New Remote
```bash
git remote add origin https://github.com/MediumThor/pwycrr.git
```

### 5. Stage All Files
```bash
git add .
```

### 6. Commit
```bash
git commit -m "Initial commit for PWYCRR project"
```

### 7. Rename Branch to Main (if needed)
```bash
git branch -M main
```

### 8. Push Using Token
```bash
git push https://YOUR_GITHUB_TOKEN@github.com/MediumThor/pwycrr.git main
```

Or set the remote URL with token:
```bash
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/MediumThor/pwycrr.git
git push -u origin main
```

**Note**: Replace `YOUR_GITHUB_TOKEN` with your actual Personal Access Token.

## If Git is Not Installed

### Option 1: Install Git for Windows
1. Download from: https://git-scm.com/download/win
2. During installation, select "Add Git to PATH"
3. Restart PowerShell
4. Run the script or manual commands above

### Option 2: Use GitHub Desktop
1. Download GitHub Desktop: https://desktop.github.com/
2. Sign in with your GitHub account
3. Click "File" → "Add Local Repository"
4. Select the PWYCRR folder
5. Click "Publish repository" (it will create and push to GitHub)

### Option 3: Use GitHub CLI (gh)
If you have GitHub CLI installed:
```powershell
gh auth login
gh repo create MediumThor/pwycrr --private --source=. --remote=origin --push
```

## Repository Information
- **Repository URL**: https://github.com/MediumThor/pwycrr
- **GitHub Username**: MediumThor
- **Token**: Provided (stored in push-to-github.ps1)

## Security Note
⚠️ The Personal Access Token is included in the script. After pushing, consider:
- Revoking the token and creating a new one
- Using Git Credential Manager to store credentials securely
- Setting up SSH keys for future authentication

