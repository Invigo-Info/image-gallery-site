"""Verify the actor-photos page loads without the Cloudinary cloud-name error
and that images render correctly."""
from playwright.sync_api import sync_playwright

errors: list[str] = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = context.new_page()

    page.on('pageerror', lambda exc: errors.append(f'PAGE: {exc}'))
    page.on('console', lambda msg: errors.append(f'CONSOLE-{msg.type}: {msg.text}') if msg.type == 'error' else None)

    page.goto('http://localhost:3005/actor-photos', wait_until='domcontentloaded', timeout=120000)
    page.wait_for_load_state('networkidle', timeout=60000)
    page.screenshot(path='/tmp/cld_actor.png', full_page=False)

    img_count = page.locator('button[aria-label^="View image"]').count()
    print('Image cards rendered:', img_count)

    # Check images actually have a src and dimensions > 0
    bad_imgs = page.evaluate("""() => {
      const imgs = Array.from(document.querySelectorAll('button[aria-label^="View image"] img'));
      return imgs.filter(i => !i.complete || i.naturalWidth === 0).length;
    }""")
    print('Failed-to-load image count:', bad_imgs)
    print('Page errors collected:', len(errors))
    for e in errors[:5]:
        print('  -', e[:200])

    browser.close()
print('OK')
