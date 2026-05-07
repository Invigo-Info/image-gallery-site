"""Verify the tag pill row renders, filters, and clears.

Tests both the user's live category (which has no tags — pill row should be
absent) and a demo-driven category where tags are seeded.
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = context.new_page()

    # Live actor-photos has no tags — pill row should be hidden, page should
    # render without errors.
    page.goto('http://localhost:3001/actor-photos', wait_until='domcontentloaded', timeout=120000)
    page.wait_for_load_state('networkidle', timeout=60000)
    page.screenshot(path='/tmp/tag_actor.png')
    pill_group_actor = page.locator('div[role="group"][aria-label="Filter by tag"]').count()
    print('Live /actor-photos pill row count (expected 0):', pill_group_actor)

    # Demo-driven category — visit via the demo dev server on 3004 (started below).
    page.goto('http://localhost:3004/mountains-photos', wait_until='domcontentloaded', timeout=120000)
    page.wait_for_load_state('networkidle', timeout=60000)
    page.screenshot(path='/tmp/tag_demo_initial.png', full_page=False)

    pill_group = page.locator('div[role="group"][aria-label="Filter by tag"]')
    print('Demo /mountains-photos pill row count (expected 1):', pill_group.count())
    pills = pill_group.locator('button').all_inner_texts()
    print('Pills:', pills)

    # Click the "Black and White" pill — only photos tagged with that should remain
    bw = pill_group.locator('button:has-text("Black and White")')
    print('"Black and White" pill present:', bw.count())
    if bw.count() > 0:
        bw.click()
        page.wait_for_timeout(400)
        page.screenshot(path='/tmp/tag_demo_filtered.png', full_page=False)
        # Count visible image buttons
        n_after = page.locator('button[aria-label^="View image"]').count()
        print('Images after clicking "Black and White":', n_after)

    # Click "All" to clear
    all_btn = pill_group.locator('button:has-text("All")').first
    all_btn.click()
    page.wait_for_timeout(300)
    n_all = page.locator('button[aria-label^="View image"]').count()
    print('Images after clicking "All":', n_all)

    browser.close()
print('OK')
