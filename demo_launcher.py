"""
VANGUARD-LOGIX — Python Demo Launcher & Verification Utility
Smart India Hackathon 2026 — Problem Statement 26251
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent

def print_banner():
    print("=" * 68)
    print("      VANGUARD-LOGIX — Indian Army Predictive Logistics Engine")
    print("      Northern Command XIV Corps — SIH 2026 Problem Statement 26251")
    print("=" * 68)
    print()

def run_tests():
    """Runs the automated pytest suite and reports test results."""
    print("[*] Running full automated verification suite (67 tests)...")
    res = subprocess.run([sys.executable, "-m", "pytest", "backend/tests", "-v"], cwd=PROJECT_ROOT)
    if res.returncode == 0:
        print("\n[+] ALL 67 TESTS PASSED SUCCESSFULLY (100% PASS RATE)")
    else:
        print("\n[-] Verification tests failed with return code:", res.returncode)
    return res.returncode

def start_services():
    """Starts backend and frontend servers in separate processes."""
    print("[1/3] Starting FastAPI backend on http://localhost:8000...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=PROJECT_ROOT,
    )

    print("[2/3] Starting Vite tactical frontend on http://localhost:5173...")
    frontend_dir = PROJECT_ROOT / "frontend"
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev", "--", "--host"],
        cwd=frontend_dir,
    )

    print("[3/3] Waiting for servers to initialize...")
    time.sleep(3)

    print("\n[*] Opening Tactical Command Center in browser: http://localhost:5173")
    try:
        webbrowser.open("http://localhost:5173")
    except Exception:
        pass

    print("\n" + "=" * 68)
    print("  SERVICES RUNNING:")
    print("  Tactical Frontend : http://localhost:5173")
    print("  Offline Field PWA : http://localhost:5173/#field")
    print("  Swagger API Docs  : http://localhost:8000/docs")
    print("=" * 68)
    print("  Press Ctrl+C to terminate all services.\n")

    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\n[*] Shutting down VANGUARD-LOGIX services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("[+] All services stopped.")

def main():
    print_banner()
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        sys.exit(run_tests())
    start_services()

if __name__ == "__main__":
    main()
