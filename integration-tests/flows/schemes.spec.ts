import { test, expect } from '@playwright/test';

test.describe('Schemes Discovery Journey', () => {
    const randomId = Math.floor(Math.random() * 1000000);
    const testEmail = `scheme-${randomId}@example.com`;
    const testName = `Scheme User ${randomId}`;
    const testPassword = 'Password123!';

    test.beforeEach(async ({ page }) => {
        // 1. Register a user to access protected /schemes route
        await page.goto('/register');
        await page.locator('#reg-name').fill(testName);
        await page.locator('#reg-email').fill(testEmail);
        await page.locator('#reg-password').fill(testPassword);
        await page.locator('button:has-text("Next")').first().click({ force: true });
        
        await expect(page.getByText(/Step 2/i)).toBeVisible({ timeout: 5000 });
        
        await page.locator('#reg-age').fill('30');
        await page.locator('#reg-gender').selectOption('Male');
        await page.locator('#reg-state').fill('Gujarat');
        await page.locator('#reg-district').fill('Ahmedabad');
        await page.locator('#reg-caste').selectOption('General');
        await page.locator('#reg-income').fill('500000');
        await page.locator('button:has-text("Next")').first().click({ force: true });

        await expect(page.getByText(/Step 3/i)).toBeVisible({ timeout: 5000 });
        const occSelect = page.locator('#reg-occupation');
        await occSelect.selectOption('Other');
        await occSelect.dispatchEvent('change');

        // Wait for React re-render
        await page.waitForTimeout(500);

        await page.getByRole('button', { name: 'Create Account' }).click({ force: true });
        await expect(page).toHaveURL(/.*profile/, { timeout: 15000 });
    });

    test('User can search and filter schemes', async ({ page }) => {
        await page.goto('/schemes');
        
        // 1. Verify page title/header
        await expect(page.getByText(/Find the Best|Schemes/i)).toBeVisible();
        
        // ... rest unchanged but I'll update selectors if needed
        const searchInput = page.getByPlaceholder('Search schemes by name or keywords...');
        await searchInput.fill('Farmer');
        await page.getByRole('button', { name: 'Search' }).click();
        
        await expect(page.getByText(/Found \d+ schemes/i)).toBeVisible();
        
        // State Filter
        await page.locator('select').first().selectOption('Gujarat');
        
        // Category Filter
        // Note: The categories are dynamic, Agriculture is a safe bet for 'Farmer' search
        await page.locator('select').nth(1).selectOption({ label: 'Agriculture' });
        
        const firstSchemeCard = page.locator('.group.bg-white').first();
        await firstSchemeCard.getByRole('button', { name: 'View Details' }).click();
        
        await expect(page).toHaveURL(/\/schemes\/.+/);
        await expect(page.getByText('About this Scheme')).toBeVisible();
    });
});
