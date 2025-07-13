import { test, expect, request } from "@playwright/test";
import { MyBoardPage } from "../pages/myBoardPage";
import { Author, Module } from "../fixtures/tags";
import logger from "../utils/logger";
import { ListsApi } from "../API/listsApi";
import { boardDetails } from "../fixtures/data";

test.describe("Board Game", () => {
    let boardPage: MyBoardPage;

    test.beforeEach(async ({ page }) => {
        logger.info("############## New Test Begin ##############");
        boardPage = new MyBoardPage(page);
        await page.goto("/");
    });

    test.afterEach(async () => {
        logger.info("############## Test End ##############\n");
    });

    test(
        "TC-001: Input a Board name, press enter. Verify Board created successfully.",
        {
            tag: [Author.NITOL, Module.CREATE_BOARD],
        },
        async ({ page }) => {
            logger.info(
                "**** TC-001: Input a Board name, press enter. Verify Board created successfully. ****"
            );

            await test.step("1. Input a Board name and press enter", async () => {
                await boardPage.inputBoardName(boardDetails.boardName);
                logger.info("Board name inputted successfully!");
            });

            await test.step("2. Verify newly created board", async () => {
                await boardPage.verifyBoardName(boardDetails.boardName);
                logger.info("Board name verified successfully!");
            });

            await test.step("3. Add two lists and verify their creation", async () => {
                await boardPage.addList(boardDetails.listName1);
                await boardPage.addList(boardDetails.listName2);
                logger.info("Two lists added successfully!");

                for (let i = 0; i < 2; i++) {
                    await boardPage.verifyListName(boardDetails[`listName${i + 1}`], i);
                    logger.info(`List ${i + 1} verified successfully!`);
                }
            });

            await test.step("4. Delete the first list and verify deletion", async () => {
                await boardPage.deleteFirstList();
                logger.info("First list deleted successfully!");

                await page.waitForTimeout(1000);

                const listCount = await boardPage.listName.count();
                const actualNames: string[] = [];

                for (let i = 0; i < listCount; i++) {
                    const name = await boardPage.listName.nth(i).inputValue();
                    actualNames.push(name.trim());
                }

                logger.info(
                    `List names found after deletion: [${actualNames.join(", ")}]`
                );
                expect(actualNames).not.toContain(boardDetails.listName1);
            });
        }
    );

    test(
        "TC-002: API Automation - Add two lists, Delete one, Verify remaining",
        {
            tag: [Author.NITOL, Module.API],
        },
        async ({ page, request }) => {
            let boardNumber: string | null = null;
            let createdListId1: number | undefined;
            let createdListId2: number | undefined;

            logger.info("**** TC-002: API Automation - Add two lists, Delete one, Verify remaining. ****");

            await test.step("1. Input a Board name and press enter", async () => {
                await boardPage.inputBoardName(boardDetails.boardName);
                logger.info("Board name inputted successfully!");
            });

            await test.step("2. Verify newly created board and get board number from URL", async () => {
                await boardPage.verifyBoardName(boardDetails.boardName);
                logger.info("Board name verified successfully!");
                boardNumber = boardPage.getBoardIdFromUrl()?.toString() || null;
                logger.info("Board number extracted from URL: " + boardNumber);
                expect(boardNumber).not.toBeNull();
            });

            await test.step("3. API: Add two lists to the created board", async () => {
                const listsApi = new ListsApi(request);
                const response1 = await listsApi.createList(Number(boardNumber), boardDetails.APIListName1, 0);
                expect(response1.ok()).toBeTruthy();
                createdListId1 = (await response1.json()).id;
                logger.info(boardDetails.APIListName1 + " created via API with id: " + createdListId1);
                const response2 = await listsApi.createList(Number(boardNumber), boardDetails.APIListName2, 1);
                expect(response2.ok()).toBeTruthy();
                createdListId2 = (await response2.json()).id;
                logger.info(boardDetails.APIListName2 + " created via API with id: " + createdListId2); 

                await page.reload();
                await page.waitForLoadState("networkidle");
            });

            await test.step("4. API: Delete the first created list", async () => {
                expect(createdListId1).toBeDefined();
                const listsApi = new ListsApi(request);
                const deleteResponse = await listsApi.deleteList(createdListId1!);
                expect([200, 204]).toContain(deleteResponse.status());
                logger.info(boardDetails.APIListName1 + " deleted via API with id: " + createdListId1);

                await page.reload();
                await page.waitForLoadState("networkidle");
            });

            await test.step("5. Verify only the remaining list is present", async () => {
                const listCount = await boardPage.listName.count();
                const actualNames: string[] = [];
                for (let i = 0; i < listCount; i++) {
                    const name = await boardPage.listName.nth(i).inputValue();
                    actualNames.push(name.trim());
                }
                logger.info(`List names found after deletion: [${actualNames.join(", ")}]`);
                expect(actualNames).not.toContain(boardDetails.APIListName1);
                expect(actualNames).toContain(boardDetails.APIListName2);
            });
        }
    );
});
