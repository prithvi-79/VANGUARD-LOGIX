<#
.SYNOPSIS
    VANGUARD-LOGIX — Unified Development & Demonstration Launcher
.DESCRIPTION
    Launches the FastAPI backend (port 8000) and Vite frontend (port 5173)
    concurrently for Smart India Hackathon jury evaluations.
#>

$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "     VANGUARD-LOGIX — Indian Army Predictive Logistics Engine   " -ForegroundColor Yellow
Write-Host "     Northern Command XIV Corps — SIH 2026 Problem Statement 26251" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot
if (-not $ProjectRoot) { $ProjectRoot = Get-Location }

# 1. Pre-flight Checks
Write-Host "[1/4] Running pre-flight system checks..." -ForegroundColor Green

# Check Python
try {
    $pythonVer = python --version 2>&1
    Write-Host "  -> Python detected: $pythonVer" -ForegroundColor Gray
} catch {
    Write-Error "Python is not found in PATH. Please install Python 3.12+."
    exit 1
}

# Check Node
try {
    $nodeVer = node --version 2>&1
    Write-Host "  -> Node.js detected: $nodeVer" -ForegroundColor Gray
} catch {
    Write-Error "Node.js is not found in PATH. Please install Node.js v20+."
    exit 1
}

# Check DB
$dbPath = Join-Path $ProjectRoot "vanguard.db"
if (Test-Path $dbPath) {
    Write-Host "  -> Local SQLite database detected: vanguard.db" -ForegroundColor Gray
} else {
    Write-Host "  -> Initializing SQLite database from deterministic seed (seed=26251)..." -ForegroundColor Yellow
}

# 2. Start Backend in separate process
Write-Host ""
Write-Host "[2/4] Starting FastAPI backend on http://localhost:8000..." -ForegroundColor Green
$backendCmd = "Set-Location '$ProjectRoot'; python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -PassThru
Write-Host "  -> Backend process started (PID: $($backendProcess.Id))" -ForegroundColor Gray

# 3. Start Frontend in separate process
Write-Host ""
Write-Host "[3/4] Starting Vite tactical frontend on http://localhost:5173..." -ForegroundColor Green
$frontendCmd = "Set-Location '$ProjectRoot\frontend'; npm run dev -- --host"
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -PassThru
Write-Host "  -> Frontend process started (PID: $($frontendProcess.Id))" -ForegroundColor Gray

# 4. Ready State & Launch Browser
Write-Host ""
Write-Host "[4/4] System Operational! Opening Command Center in browser..." -ForegroundColor Green
Start-Sleep -Seconds 3

try {
    Start-Process "http://localhost:5173"
} catch {
    Write-Host "  -> Open http://localhost:5173 manually in your browser." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  COMMAND CENTER READY:" -ForegroundColor Yellow
Write-Host "  Frontend Dashboard : http://localhost:5173" -ForegroundColor White
Write-Host "  Offline Field PWA  : http://localhost:5173/#field (or Field tab)" -ForegroundColor White
Write-Host "  Swagger API Docs   : http://localhost:8000/docs" -ForegroundColor White
Write-Host "  System Health Check: http://localhost:8000/api/health" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C in the launched PowerShell windows to stop servers." -ForegroundColor Gray
Write-Host ""
