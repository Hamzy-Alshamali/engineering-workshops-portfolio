@echo off
cd /d "%~dp0"
set "DIGIT_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%DIGIT_NODE%" goto run
set "DIGIT_NODE=node"
where node >nul 2>nul
if not errorlevel 1 goto run
echo Install Node.js from https://nodejs.org then try again.
pause
exit /b 1
:run
echo Keep this window open while using Digit Lens.
"%DIGIT_NODE%" serve.cjs --open
pause
