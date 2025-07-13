import { Page, Locator, expect } from "@playwright/test";

export class MyBoardPage {
    readonly page: Page;
    readonly boardTitle: Locator;
    readonly createBoardHeading: Locator;
    readonly boardNameInput: Locator;
    readonly boardName: Locator;
    readonly listInput: Locator;
    readonly listName: Locator;
    readonly listOptions: Locator;
    readonly deleteListButton: Locator;
    readonly firstBoardInput: Locator;
    readonly emptyStateText: Locator;

    constructor(page: Page) {
        this.page = page;
        this.boardTitle = page.getByRole('heading', { name: 'My Boards' });
        this.createBoardHeading = page.getByRole('heading', { name: 'Create new board' });
        this.boardNameInput = page.locator('[data-cy="new-board-input"]');
        this.boardName = page.locator('[data-cy="board-title"]');
        this.listInput = page.locator('[data-cy="add-list-input"]');
        this.listName = page.locator('[data-cy="list-name"]');
        this.listOptions = page.locator('[data-cy="list-options"]');
        this.deleteListButton = page.locator('[data-cy="delete-list"]');
        this.firstBoardInput = page.locator('[data-cy="first-board"]');
        this.emptyStateText = page.locator('text=Go ahead and create your first board!');
    }

    async verifyBoardTitle(expectedTitle: string): Promise<void> {
        await expect(this.boardTitle).toHaveText(expectedTitle);
    }

    async inputBoardName(name: string): Promise<void> {
        if (await this.emptyStateText.isVisible()) {
            await this.firstBoardInput.fill(name);
            await this.firstBoardInput.press('Enter');
        } else {
            await this.createBoardHeading.click();
            await this.boardNameInput.fill(name);
            await this.boardNameInput.press('Enter');
        }
    }

    async verifyBoardName(expectedName: string): Promise<void> {
        await expect(this.boardName).toHaveValue(expectedName);
    }

    async addList(name: string): Promise<void> {
        await this.listInput.fill(name);
        await this.listInput.press('Enter');
    }

    async verifyListName(expectedName: string, position = 0): Promise<void> {
        await expect(this.listName.nth(position)).toHaveValue(expectedName);
    }

    async deleteFirstList(): Promise<void> {
        await this.listOptions.first().click();
        await this.deleteListButton.click();
    }

    getBoardIdFromUrl(): number | null {
        const url = this.page.url();
        const match = url.match(/\/board\/(\d+)/);
        return match ? Number(match[1]) : null;
    }
}
