@echo off
setlocal

cd /d "%~dp0.."

echo Starting CTFL 4.0 Study Lab...
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required but was not found.
  echo Install Node.js 24 or newer from https://nodejs.org/ and run this script again.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is required but was not found.
  echo Install Node.js 24 or newer from https://nodejs.org/ and run this script again.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies with npm ci...
  call npm ci
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
  )
  echo.
)

echo Opening the app in your default browser...
call npm run dev -- --host 127.0.0.1 --open

if errorlevel 1 (
  echo.
  echo The app could not be started.
  pause
  exit /b 1
)
