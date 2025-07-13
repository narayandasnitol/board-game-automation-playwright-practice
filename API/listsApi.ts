import { APIRequestContext, APIResponse } from '@playwright/test';

export class ListsApi {
    private readonly apiContext: APIRequestContext;
    private readonly baseUrl: string;

    constructor(apiContext: APIRequestContext, baseUrl: string = "/api") {
        this.apiContext = apiContext;
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    }

    // Create a new list for a board
    async createList(boardId: number, name: string, order: number = 0): Promise<APIResponse> {
        return this.apiContext.post(`${this.baseUrl}/lists`, {
            data: { boardId, name, order },
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Delete a list by ID
    async deleteList(listId: number): Promise<APIResponse> {
        return this.apiContext.delete(`${this.baseUrl}/lists/${listId}`);
    }

    // Get all lists
    async getLists(): Promise<APIResponse> {
        return this.apiContext.get(`${this.baseUrl}/lists`);
    }
}
