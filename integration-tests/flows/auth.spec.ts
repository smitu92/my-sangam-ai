import { test, expect } from '@playwright/test';

test.describe('Authentication Journey', () => {
    // Generate a unique identifier for each test run to avoid conflicts
    const testPassword = 'Password123!';

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => {
            if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
            else console.log(`BROWSER LOG: ${msg.text()}`);
        });
    });

    test('Full Registration Flow (Steps 1-3)', async ({ page }) => {
        const testId = Math.floor(Math.random() * 1000000);
        const email = `reg-${testId}@example.com`;
        const uniqueName = `Reg User ${testId}`;
        
        await page.goto('/register');
        
        // --- Step 1: Account ---
        await page.locator('#reg-name').fill(uniqueName);
        await page.locator('#reg-email').fill(email);
        await page.locator('#reg-password').fill(testPassword);
        await page.locator('button:has-text("Next")').first().click({ force: true });
        await expect(page.getByText(/Step 2/i)).toBeVisible({ timeout: 5000 });

        // --- Step 2: Personal Info ---
        await page.locator('#reg-age').fill('28');
        await page.locator('#reg-gender').selectOption('Male');
        await page.locator('#reg-state').fill('Maharashtra');
        await page.locator('#reg-district').fill('Mumbai');
        
        await page.locator('#reg-caste').selectOption('General');
        await page.locator('#reg-income').fill('450000');
        await page.locator('button:has-text("Next")').first().click({ force: true });
        await expect(page.getByText(/Step 3/i)).toBeVisible({ timeout: 5000 });

        // --- Step 3: Occupation ---
        const occSelect = page.locator('#reg-occupation');
        await occSelect.selectOption('Student');
        await occSelect.dispatchEvent('change');
        
        // Give React time to render conditional fields
        await page.waitForTimeout(500);
        
        // Wait for conditional fields (Standardized IDs)
        const eduLevel = page.locator('#reg-edu-level');
        await expect(eduLevel).toBeVisible({ timeout: 5000 });
        await eduLevel.selectOption('Graduate');
        await eduLevel.dispatchEvent('change');
        
        const instType = page.locator('#reg-inst-type');
        await expect(instType).toBeVisible({ timeout: 5000 });
        await instType.selectOption('Government');
        await instType.dispatchEvent('change');

        await page.locator('#reg-course').fill('Playwright Engineering');
        await page.locator('#reg-year').fill('4');

        // --- Final Submission ---
        await page.getByRole('button', { name: 'Create Account' }).click({ force: true });

        // --- Verification ---
        await expect(page).toHaveURL(/.*profile/, { timeout: 15000 });
        
        // Wait for the actual name heading to populate (contains "Reg User")
        const nameHeading = page.getByRole('heading', { level: 1 });
        await expect(nameHeading).toContainText("Reg User", { timeout: 10000 });
        await expect(nameHeading).toContainText(uniqueName);
        await expect(page.getByText(email).first()).toBeVisible({ timeout: 5000 });
    });

    test('Login Flow', async ({ page }) => {
        const testId = Math.floor(Math.random() * 1000000);
        const email = `login-${testId}@example.com`;
        const uniqueName = `Login User ${testId}`;

        // 1. Pre-create user via API
        console.log(`Pre-creating user for login test: ${email}`);
        await page.request.post('/api/auth/register', {
            data: {
                name: uniqueName,
                email: email,
                password: testPassword,
                occupation: 'Other',
                age: 25,
                gender: 'Male',
                state: 'Gujarat',
                district: 'Ahmedabad',
                caste: 'General',
                annualIncome: 300000,
                disability: false,
                rationCard: 'None'
            }
        });

        // 2. Perform Login
        await page.goto('/login');
        const emailInput = page.locator('#login-email');
        const passInput = page.locator('#login-password');
        
        await emailInput.fill(email);
        await passInput.fill(testPassword);
        
        console.log(`Filling login for ${email} / ${testPassword}`);
        const typedEmail = await emailInput.inputValue();
        const typedPass = await passInput.inputValue();
        console.log(`Typed values: ${typedEmail} / ${typedPass}`);

        await page.getByRole('button', { name: 'Login' }).click({ force: true });

        // 3. Verification
        await expect(page).toHaveURL(/.*profile/, { timeout: 15000 });
        await expect(page.getByText(uniqueName).first()).toBeVisible();
    });
});
