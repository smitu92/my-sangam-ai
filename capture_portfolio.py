import os
import time
from playwright.sync_api import sync_playwright

# Configuration
BASE_URL = "http://localhost:3000"
OUTPUT_DIR = "sangam.fever"

# List of routes identified in your app
routes = [
    {"name": "home", "path": "/"},
    {"name": "chatbot", "path": "/chatbot"},
    {"name": "schemes", "path": "/schemes"},
    {"name": "loans", "path": "/loans"},
    {"name": "news", "path": "/news"},
    {"name": "profile", "path": "/profile"},
    {"name": "login", "path": "/login"},
    {"name": "register", "path": "/register"},
    {"name": "admin", "path": "/admin"},
]

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

print(f"🚀 Starting Portfolio Capture Studio...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Use a standard desktop viewport
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    
    # 🔑 AUTOMATED LOGIN FIRST
    print("🔑 Logging in as Arjun (Student)...")
    try:
        page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        # Using specific IDs to ensure validation triggers correctly
        page.locator("#login-email").fill("student99@test.com")
        page.locator("#login-password").fill("Password123!")
        
        # Give the form a moment to enable the button
        time.sleep(1)
        
        # Click the Sign In button directly
        page.locator("button[type='submit']").first.click()
        
        # Wait for navigation to complete (e.g., redirect to home or dashboard)
        page.wait_for_url(f"{BASE_URL}/", timeout=10000)
        print("✅ Login successful! Starting capture series...")
    except Exception as e:
        print(f"⚠️ Login failed: {str(e)}. Attempting to capture anyway...")

    for route in routes:
        url = f"{BASE_URL}{route['path']}"
        name = route['name']
        output_path = os.path.join(OUTPUT_DIR, f"{name}.png")
        
        print(f"📸 Capturing {name} ({url})...")
        try:
            page.goto(url, wait_until="networkidle")
            
            # Special interaction for schemes search
            if name == "schemes":
                print("🔍 Simulating search for 'Farmer'...")
                # Assuming there's an input field for search
                search_input = page.get_by_placeholder("Search") or page.locator("input[type='text']")
                if search_input.count() > 0:
                    search_input.first.fill("Farmer")
                    page.keyboard.press("Enter")
                    time.sleep(3) # Wait for results
                    name = "schemes_search_results"
                    output_path = os.path.join(OUTPUT_DIR, f"{name}.png")

            # Extra wait for animations/dynamic content
            time.sleep(2) 
            page.screenshot(path=output_path, full_page=True)
            print(f"✅ Saved to {output_path}")
        except Exception as e:
            print(f"❌ Failed to capture {name}: {str(e)}")
    
    browser.close()
    print("\n✨ Done! Your portfolio screenshots are ready in 'sangam.fever' folder.")
