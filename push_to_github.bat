@echo off
title Push CineVibe to GitHub
cd /d "%~dp0"
echo ========================================================
echo          CineVibe — Push to GitHub Repository
echo ========================================================
echo.

git remote -v >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Remote repository already configured:
    git remote -v
    echo.
    set /p PUSH_NOW="Push to this remote now? (Y/N): "
    if /i "%PUSH_NOW%"=="Y" (
        git push -u origin main
        goto done
    )
)

echo Please enter your GitHub Repository URL.
echo Example: https://github.com/YOUR_USERNAME/cinevibe.git
echo.
set /p REPO_URL="Enter GitHub Repository URL: "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Aborting.
    pause
    exit /b 1
)

git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
echo Remote 'origin' set to %REPO_URL%.
echo.
echo Pushing branch 'main' to GitHub...
git push -u origin main

:done
echo.
echo ========================================================
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Code successfully pushed to GitHub!
) else (
    echo [NOTE] If prompted for authentication, log in using your
    echo GitHub account or Personal Access Token (PAT).
)
echo ========================================================
pause
