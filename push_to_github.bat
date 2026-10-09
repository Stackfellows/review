@echo off
echo ==============================================
echo Pushing Backend Code to Stackfellows/review
echo ==============================================

:: Check if git is initialized, if not initialize it
IF NOT EXIST ".git" (
    echo Initializing new Git repository...
    git init
    git remote add origin https://github.com/Stackfellows/review.git
    git branch -M main
) ELSE (
    :: Check if remote exists, add if missing
    git remote | findstr "origin" >nul
    IF ERRORLEVEL 1 (
        git remote add origin https://github.com/Stackfellows/review.git
    )
)

:: Create .gitignore if it doesn't exist
IF NOT EXIST ".gitignore" (
    echo node_modules/ > .gitignore
    echo .env >> .gitignore
    echo Creating default .gitignore...
)

echo.
echo Adding files...
git add .

echo.
echo Committing changes...
:: Use current date and time for commit message
set datetime=%date% %time%
git commit -m "Update backend code - %datetime%"

echo.
echo Pushing to GitHub (main branch)...
git push -u origin main

echo.
echo ==============================================
echo DONE! Check https://github.com/Stackfellows/review
echo ==============================================
pause
