# Script to push PWYCRR to GitHub
# GitHub Token and Repository
# IMPORTANT: Replace YOUR_GITHUB_TOKEN with your actual Personal Access Token
# You can create one at: https://github.com/settings/tokens
$GITHUB_TOKEN = "YOUR_GITHUB_TOKEN"
$REPO_URL = "https://github.com/MediumThor/pwycrr.git"

Write-Host "Setting up PWYCRR repository for GitHub..." -ForegroundColor Green

# Function to execute git commands
function Invoke-Git {
    param([string[]]$Arguments)
    
    if ($script:gitExe) {
        & $script:gitExe $Arguments
    } else {
        git $Arguments
    }
}

# Try to find Git
$gitExe = $null
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "Found Git in PATH" -ForegroundColor Green
} else {
    $gitPaths = @(
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files (x86)\Git\bin\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\bin\git.exe",
        "$env:ProgramFiles\Git\cmd\git.exe"
    )
    
    foreach ($path in $gitPaths) {
        if (Test-Path $path) {
            $script:gitExe = $path
            Write-Host "Found Git at: $path" -ForegroundColor Green
            break
        }
    }
}

if (-not $gitExe -and -not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed or not found." -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Or use winget: winget install --id Git.Git -e --source winget" -ForegroundColor Yellow
    Write-Host "`nAfter installing Git, run this script again or use the manual commands in PUSH_INSTRUCTIONS.md" -ForegroundColor Yellow
    exit 1
}

# Navigate to script directory
Set-Location $PSScriptRoot
Write-Host "Current directory: $PSScriptRoot" -ForegroundColor Cyan

# Initialize git if needed
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Cyan
    Invoke-Git @("init")
} else {
    Write-Host "Git repository already initialized." -ForegroundColor Yellow
}

# Remove old remote if exists
Write-Host "Configuring remote..." -ForegroundColor Cyan
Invoke-Git @("remote", "remove", "origin") 2>$null

# Add new remote
Invoke-Git @("remote", "add", "origin", $REPO_URL)

# Verify remote
Write-Host "`nRemote configuration:" -ForegroundColor Cyan
Invoke-Git @("remote", "-v")

# Stage all files
Write-Host "`nStaging all files..." -ForegroundColor Cyan
Invoke-Git @("add", ".")

# Check status
$statusOutput = Invoke-Git @("status", "--porcelain")
if ($statusOutput) {
    Write-Host "`nCommitting files..." -ForegroundColor Cyan
    Invoke-Git @("commit", "-m", "Initial commit for PWYCRR project")
    
    # Ensure we're on main branch
    $currentBranch = Invoke-Git @("branch", "--show-current")
    if ($currentBranch -ne "main") {
        Write-Host "Renaming branch to 'main'..." -ForegroundColor Cyan
        Invoke-Git @("branch", "-M", "main")
    }
    
    # Push using token in URL
    Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
    $pushUrl = "https://$GITHUB_TOKEN@github.com/MediumThor/pwycrr.git"
    Invoke-Git @("push", "-u", $pushUrl, "main")
    
    Write-Host "`n✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/MediumThor/pwycrr" -ForegroundColor Cyan
} else {
    Write-Host "`nNo changes to commit." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
