const { test, expect, _electron: electron } = require('@playwright/test');

test('End-to-end user workflow', async () => {
    // Launch the Electron app
    const appEnv = { ...process.env };
    // This variable makes Electron run as Node instead of opening the app.
    delete appEnv.ELECTRON_RUN_AS_NODE;
    const electronApp = await electron.launch({ args: ['.'], env: appEnv });
    try {
        const window = await electronApp.firstWindow();
        const taskText = 'My new E2E test task';

        // Add a todo item.
        await window.locator('#todo-input').fill(taskText);
        await window.locator('#add-todo-btn').click();

        // Find and verify the newly added item.
        const todoItem = window.locator('.todo-item').filter({ hasText: taskText });
        await expect(todoItem).toHaveCount(1);
        await expect(todoItem.locator('.todo-text')).toHaveText(taskText);

        // Mark it as complete and verify the completed style.
        await todoItem.locator('input[type="checkbox"]').check();
        await expect(todoItem).toHaveClass(/completed/);

        // Delete it and verify it is removed from the list.
        await todoItem.locator('.delete-btn').click();
        await expect(todoItem).toHaveCount(0);
    } finally {
        // Always close Electron, including when an assertion fails.
        await electronApp.close();
    }
});
