from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:3000/products")
    page.wait_for_selector('.product-card')
    page.click('.product-card')
    page.wait_for_selector('h1')
    page.screenshot(path="jules-scratch/verification/product-details.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
