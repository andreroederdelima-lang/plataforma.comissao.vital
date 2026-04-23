import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Navegação Básica', () => {
  test('deve carregar página inicial', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Vital/i);
  });

  test('deve navegar por todos os links principais', async ({ page }) => {
    await page.goto('/');
    
    const links = await page.locator('a[href^="/"]').all();
    
    for (const link of links.slice(0, 5)) { // Testa primeiros 5 links
      const href = await link.getAttribute('href');
      if (href && !href.includes('#')) {
        await link.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(new RegExp(href));
        await page.goBack();
      }
    }
  });

  test('deve testar formulários básicos', async ({ page }) => {
    await page.goto('/');
    
    const forms = await page.locator('form').all();
    
    for (const form of forms) {
      const inputs = await form.locator('input:not([type="submit"]):not([type="button"])').all();
      
      for (const input of inputs) {
        const type = await input.getAttribute('type');
        if (type === 'email') {
          await input.fill('test@example.com');
        } else if (type === 'password') {
          await input.fill('Test123!@#');
        } else {
          await input.fill('Teste');
        }
      }
      
      // Screenshot antes de submit
      await page.screenshot({ 
        path: `tests/screenshots/form-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });
});
