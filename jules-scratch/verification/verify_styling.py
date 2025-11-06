from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Capture console logs
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    # Verify Product List Page
    page.goto("http://localhost:3000/products")
    try:
        page.wait_for_selector(".product-grid > *", timeout=10000)
    except:
        print("Could not find product grid")
    page.screenshot(path="jules-scratch/verification/product-list.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
