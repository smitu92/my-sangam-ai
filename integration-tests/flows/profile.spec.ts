import { test, expect } from '@playwright/test';

test.describe('Profile Verification', () => {
    // Unique user for this test run
    const randomId = Math.floor(Math.random() * 1000000);
    const testEmail = `profile-${randomId}@example.com`;
    const testName = `Profile User ${randomId}`;
    const testPassword = 'Password123!';

    test.beforeEach(async ({ page }) => {
        // Register a user with specific details
        await page.goto('/register');
        await page.locator('#reg-name').fill(testName);
        await page.locator('#reg-email').fill(testEmail);
        await page.locator('#reg-password').fill(testPassword);
        await page.locator('button:has-text("Next")').first().click({ force: true });
        await expect(page.getByText(/Step 2/i)).toBeVisible({ timeout: 5000 });
        
        await page.locator('#reg-age').fill('35');
        await page.locator('#reg-gender').selectOption('Male');
        await page.locator('#reg-state').fill('Gujarat');
        await page.locator('#reg-district').fill('Ahmedabad');
        await page.locator('#reg-caste').selectOption('SC');
        await page.locator('#reg-income').fill('150000');
        await page.locator('button:has-text("Next")').first().click({ force: true });
        await expect(page.getByText(/Step 3/i)).toBeVisible({ timeout: 5000 });

        await page.locator('#reg-occupation').selectOption('JobSeeker');
        await expect(page.locator('#reg-occupation')).toHaveValue('JobSeeker');

        await page.locator('#reg-job-edu').selectOption('Graduate');
        await page.locator('#reg-job-exp').fill('2');
        
        await page.getByRole('button', { name: 'Create Account' }).click({ force: true });
        await expect(page).toHaveURL(/.*profile/, { timeout: 15000 });
    });

    test('Profile page displays correct user information', async ({ page }) => {
        await page.goto('/profile');
        
        // Check top-level info
        await expect(page.getByText(testName).first()).toBeVisible();
        await expect(page.getByText(testEmail).first()).toBeVisible();
        
        // Check specific profile fields (assuming they are rendered in cards)
        await expect(page.getByText('35')).toBeVisible(); // Age
        await expect(page.getByText('Male')).toBeVisible(); // Gender
        await expect(page.getByText('SC')).toBeVisible(); // Caste
        await expect(page.getByText('Job Seeker')).toBeVisible(); // Occupation (humanized)
        await expect(page.getByText('Graduate')).toBeVisible(); // Education
    });
});
