#!/usr/bin/env python3
"""
Quick test to check if the server is responding
"""

import requests
import time
import sys

def test_server():
    base_url = "http://localhost:8000"
    
    print("Testing SmartLighting API...")
    print(f"Base URL: {base_url}")
    print("-" * 40)
    
    # Test endpoints
    endpoints = [
        "/",
        "/health",
        "/docs"
    ]
    
    for endpoint in endpoints:
        url = base_url + endpoint
        print(f"Testing: {url}")
        
        try:
            response = requests.get(url, timeout=5)
            print(f"  Status: {response.status_code}")
            
            if endpoint in ["/", "/health"]:
                try:
                    data = response.json()
                    print(f"  Response: {data}")
                except:
                    print(f"  Response: {response.text[:200]}...")
            else:
                print(f"  Content-Length: {len(response.content)} bytes")
                
            print("  ✓ SUCCESS")
            
        except requests.exceptions.ConnectionError:
            print("  ✗ Connection failed - Server not running?")
        except requests.exceptions.Timeout:
            print("  ✗ Timeout - Server not responding")
        except Exception as e:
            print(f"  ✗ Error: {e}")
        
        print()
    
    print("-" * 40)
    print("Test completed.")

if __name__ == "__main__":
    test_server() 