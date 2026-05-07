"""Verify the modern lightbox renders with the new toolbar after clicking an image."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = context.new_page()

    page.goto('http://localhost:3003/actor-photos', wait_until='domcontentloaded', timeout=120000)
    page.wait_for_load_state('networkidle', timeout=120000)
    page.screenshot(path='/tmp/lb_grid.png', full_page=False)

    # Click the first gallery image (button labelled "View image …")
    first = page.locator('button[aria-label^="View image"]').first
    first.scroll_into_view_if_needed()
    first.click()

    # Wait for lightbox dialog to appear
    page.wait_for_selector('[role="dialog"][aria-label="Image viewer"]', timeout=5000)
    page.wait_for_timeout(500)
    page.screenshot(path='/tmp/lb_open.png')

    # Check the toolbar buttons are present
    expected_labels = [
        'Play slideshow', 'Zoom in', 'Share', 'Thumbnails',
        'Image info', 'Enter fullscreen', 'Close',
    ]
    print('--- Toolbar buttons present ---')
    for label in expected_labels:
        n = page.locator(f'button[aria-label="{label}"]').count()
        print(f'  {label}: {n}')

    # Counter
    counter_text = page.locator('[role="dialog"][aria-label="Image viewer"]').inner_text()
    print('Dialog text snippet (first 80):', counter_text[:80].replace('\n', ' | '))

    # Click the Image info toggle
    page.locator('button[aria-label="Image info"]').click()
    page.wait_for_timeout(300)
    page.screenshot(path='/tmp/lb_info.png')

    info_visible = page.locator('aside button:has-text("Info")').count()
    effects_tab = page.locator('aside button:has-text("Effects")').count()
    download_tab = page.locator('aside button:has-text("Download")').count()
    print('Info panel tabs:', 'info', info_visible, 'effects', effects_tab, 'download', download_tab)

    # Toggle Thumbnails
    page.locator('button[aria-label="Image info"]').click()  # close info
    page.wait_for_timeout(150)
    page.locator('button[aria-label="Thumbnails"]').click()
    page.wait_for_timeout(2000)  # let thumbnails load
    page.screenshot(path='/tmp/lb_thumbs.png')
    thumbs = page.locator('button[aria-label^="Show image"]').count()
    print('Thumbnail tiles:', thumbs)

    # Toggle Zoom
    page.locator('button[aria-label="Thumbnails"]').click()  # close thumbs
    page.wait_for_timeout(150)
    page.locator('button[aria-label="Zoom in"]').click()
    page.wait_for_timeout(300)
    page.screenshot(path='/tmp/lb_zoom.png')
    print('Zoom out button now present:', page.locator('button[aria-label="Zoom out"]').count())

    # Close
    page.locator('button[aria-label="Close"]').click()
    page.wait_for_timeout(300)
    closed = page.locator('[role="dialog"][aria-label="Image viewer"]').count()
    print('Dialog after close (should be 0):', closed)

    browser.close()
print('OK')
