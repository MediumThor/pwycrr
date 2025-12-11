# PowerShell script to set up PWYCRR repository
# Run this script from the PWYCRR directory

Write-Host "Setting up PWYCRR Git Repository..." -ForegroundColor Green

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Navigate to project directory
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

Write-Host "Current directory: $projectDir" -ForegroundColor Cyan

# Check if .git already exists
if (Test-Path .git) {
    Write-Host "Git repository already initialized." -ForegroundColor Yellow
    
    # Check for existing remotes
    $remotes = git remote -v
    if ($remotes) {
        Write-Host "Existing remotes found:" -ForegroundColor Yellow
        Write-Host $remotes
        
        # Remove old origin if it exists
        Write-Host "`nRemoving old 'origin' remote..." -ForegroundColor Yellow
        git remote remove origin 2>$null
    }
} else {
    Write-Host "Initializing new git repository..." -ForegroundColor Cyan
    git init
}

# Add new remote
$repoUrl = "https://github.com/MediumThor/pwycrr.git"
Write-Host "`nAdding remote origin: $repoUrl" -ForegroundColor Cyan
git remote add origin $repoUrl

# Verify remote was added
Write-Host "`nVerifying remote configuration..." -ForegroundColor Cyan
git remote -v

# Stage all files
Write-Host "`nStaging all files..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "`nCommitting files..." -ForegroundColor Cyan
    git commit -m "Initial commit for PWYCRR project"
    
    # Rename branch to main if needed
    $currentBranch = git branch --show-current
    if ($currentBranch -ne "main") {
        Write-Host "Renaming branch to 'main'..." -ForegroundColor Cyan
        git branch -M main
    }
    
    Write-Host "`nReady to push! Run the following command:" -ForegroundColor Green
    Write-Host "git push -u origin main" -ForegroundColor Yellow
    Write-Host "`nNote: You may need to authenticate with GitHub." -ForegroundColor Yellow
    Write-Host "Use your GitHub username (MediumThor) and a Personal Access Token as the password." -ForegroundColor Yellow
} else {
    Write-Host "`nNo changes to commit. Repository is up to date." -ForegroundColor Yellow
}

Write-Host "`nSetup complete!" -ForegroundColor Green

