import { test, expect } from '@playwright/test';

test.describe('Chatbot Journey', () => {
    // Unique user for each run
    const randomId = Math.floor(Math.random() * 1000000);
    const testEmail = `chat-${randomId}@example.com`;
    const testName = `Chat User ${randomId}`;
    const testPassword = 'Password123!';

    test.beforeEach(async ({ page }) => {
        // 1. Create a fresh user for the chatbot test
        await page.goto('/register');
        await page.locator('#reg-name').fill(testName);
        await page.locator('#reg-email').fill(testEmail);
        await page.locator('#reg-password').fill(testPassword);
        await page.locator('button:has-text("Next")').first().click({ force: true });
        await expect(page.getByText(/Step 2/i)).toBeVisible({ timeout: 5000 });
        
        await page.locator('#reg-age').fill('25');
        await page.locator('#reg-gender').selectOption('Female');
        await page.locator('#reg-state').fill('Gujarat');
        await page.locator('#reg-district').fill('Rajkot');
        await page.locator('#reg-caste').selectOption('OBC');
        await page.locator('#reg-income').fill('200000');
        await page.locator('button:has-text("Next")').first().click({ force: true });
        await expect(page.getByText(/Step 3/i)).toBeVisible({ timeout: 5000 });

        const occSelect = page.locator('#reg-occupation');
        await occSelect.selectOption('Farmer');
        await occSelect.dispatchEvent('change');

        // Wait for React re-render
        await page.waitForTimeout(500);

        await page.locator('#reg-land-size').fill('5');
        await page.locator('#reg-crop-type').fill('Cotton');
        
        await page.getByRole('button', { name: 'Create Account' }).click({ force: true });
        await expect(page).toHaveURL(/.*profile/, { timeout: 15000 });
    });

    test('User can send a message and receive an AI response', async ({ page }) => {
        await page.goto('/chatbot');
        
        // Verify welcome screen
        await expect(page.getByText('Sangam AI Assistant')).toBeVisible();
        
        // Type a query
        const query = 'What schemes are available for a cotton farmer in Gujarat?';
        const textArea = page.getByPlaceholder('Ask Sangam AI about eligibility or scheme details...');
        await textArea.fill(query);
        
        // Send message
        await page.locator('button[type="submit"]').click();

        // Wait for AI response to appear (timeout increased for LLM generation)
        const assistantResponse = page.locator('.chat-assistant-message, .chatMsg').last();
        await expect(assistantResponse).toContainText(/schemes|farmer|Gujarat|Cotton/i, { timeout: 60000 });

        // Verify that a new session was created in the sidebar
        const sidebar = page.locator('aside');
        await expect(sidebar).toContainText('What schemes are available', { timeout: 10000 });
    });

    test('Chat history persists across reloads', async ({ page }) => {
        await page.goto('/chatbot');
        
        const query = 'Tell me about PM Kisan scheme benefits';
        const textArea = page.getByPlaceholder('Ask Sangam AI about eligibility or scheme details...');
        await textArea.fill(query);
        await page.locator('button[type="submit"]').click();
        
        // Wait for first response
        await expect(page.locator('.chatMsg').last()).toContainText(/Kisan/i, { timeout: 60000 });

        // Reload the page
        await page.reload();
        
        // Wait for sessions to load and click the one corresponding to our query
        const sessionItem = page.locator('aside button').filter({ hasText: query.substring(0, 10) });
        await expect(sessionItem).toBeVisible({ timeout: 10000 });
        await sessionItem.click();
        
        // Verify that the message history is restored
        await expect(page.locator('.chatMsg').first()).toContainText(query);
        await expect(page.locator('.chatMsg').last()).toContainText(/Kisan/i);
    });
});
