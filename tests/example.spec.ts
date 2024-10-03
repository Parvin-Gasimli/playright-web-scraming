import { test, expect, Page } from '@playwright/test';
import fs from "node:fs"

/**
 * url
 * title
 * date
 * content
 */

async function reloadIfError(page: Page) {
  await test.step("Checking if page is down", async () => {
    while(await page.getByRole('heading', { name: 'Service Temporarily Unavailable' }).isVisible()) {
      await page.reload()
    }
  })
}

test('Azertac', async ({ page }) => {
  test.setTimeout(60_000 * 60 * 60 * 2);
  const result: any = []
  let pageNumber = 1
  await page.goto(`https://azertag.az/axtarish?cat%5B%5D=politics&tarixden=2022%2F02%2F22&tarixe=2024%2F10%2F03&search=Ukrayna&mod=2&page=${pageNumber}`);
  const totalItems = await page.locator("p").filter({hasText: "Yekun nəticələr:"}).locator("span b").textContent() as unknown as number
  let totalPage = Math.ceil(totalItems / 50);
  const posts = await page.locator(".latest-news-post");
    for (let post of (await posts.all())) {
      const link = await post.locator("a").first();
      await link.click();
      await reloadIfError(page)
      const postContent = await page.locator(".sa-post.app-post")
      const title = await postContent.locator(".entry-title").first().textContent()
      const url = await page.url()
      const time = await postContent.locator(".global-list li:first-child").textContent()
      const content = await postContent.locator(".news-body").innerText()
      result.push({
        url,
        title,
        time,
        content
      })
      await page.goBack()
      await reloadIfError(page)
    }

  fs.writeFile(`./crawled-data-page-${pageNumber}.json`, JSON.stringify(result, null, 4), (err) => {
      if (err) {  console.error(err);  return; };
      console.log("File has been created");
  });
});

// npx playwright test --ui=none tests/example.spec.ts