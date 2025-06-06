#!/usr/bin/env python3
"""
Simple server startup script that avoids multiprocessing issues.
"""

import os
import sys

def main():
    print("=" * 50)
    print("SmartLighting Backend Server")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print("Error: main.py not found. Make sure you're in the backend directory.")
        return 1
    
    # Check if .env exists
    if not os.path.exists(".env"):
        print("Warning: .env file not found. Using default environment variables.")
    
    try:
        print("Loading environment variables...")
        from dotenv import load_dotenv
        load_dotenv()
        print("✓ Environment loaded")
        
        print("Importing main application...")
        from main import app
        print("✓ Application imported successfully")
        
        print("Starting server...")
        print("Server URL: http://localhost:8000")
        print("API Docs: http://localhost:8000/docs")
        print("Health Check: http://localhost:8000/health")
        print("-" * 50)
        print("Press Ctrl+C to stop the server")
        print("=" * 50)
        
        import uvicorn
        # Start server without reload to avoid multiprocessing issues
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8000, 
            reload=False,
            access_log=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n" + "=" * 50)
        print("Server stopped by user")
        print("=" * 50)
        return 0
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main()) 