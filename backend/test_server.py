#!/usr/bin/env python3
"""
Test script to verify that the FastAPI server can start without database.
This script helps debug import issues and database connection problems.
"""

try:
    print("Testing imports...")
    
    # Test basic imports
    import os
    print("✓ os imported")
    
    from dotenv import load_dotenv
    print("✓ dotenv imported")
    
    load_dotenv()
    print("✓ .env loaded")
    
    # Test FastAPI imports
    from fastapi import FastAPI
    print("✓ FastAPI imported")
    
    # Test database imports
    try:
        from database import get_db, database_available
        print(f"✓ database imported, available: {database_available}")
    except Exception as e:
        print(f"✗ database import failed: {e}")
        # Create a dummy function
        def get_db():
            yield None
    
    # Test main imports
    try:
        from main import app
        print("✓ main app imported")
        print("✓ All imports successful!")
        
        # Try to start the server
        import uvicorn
        print("Starting server on http://localhost:8000...")
        print("Open your browser and go to http://localhost:8000/")
        print("API documentation will be available at http://localhost:8000/docs")
        print("Press Ctrl+C to stop the server")
        
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
        
    except Exception as e:
        print(f"✗ main import failed: {e}")
        import traceback
        traceback.print_exc()
        
except Exception as e:
    print(f"✗ Import error: {e}")
    import traceback
    traceback.print_exc() 