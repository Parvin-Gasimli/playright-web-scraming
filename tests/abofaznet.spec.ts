import { test, expect, Page } from "@playwright/test";
import fs from "node:fs";
const authFile = "playwright/.auth/user.json";
test.use({ storageState: authFile });

// test("Login", async ({ page }) => {
//   test.setTimeout(60_000 * 60 * 60 * 2);

//   await page.goto("https://abo.faz.net/login");

//   await page.locator("#login-form-email").fill("fidan.mamedova1999@mail.ru");
//   await page.locator("#login-form-password").fill("FM042940nn");
//   await page.getByRole("button", { name: "Anmelden" }).click();

//   await page.waitForURL("https://abo.faz.net/?registration=false");

//   await page.context().storageState({ path: authFile });
// });

async function crawlPage(page:Page, pageNumber:number) {
    await test.step(`Page: ${pageNumber}`, async () => {
        const result: any = []
        await page.goto(`https://www.faz.net/aktuell/politik/ukraine/s${pageNumber}.html`);
        const posts = await page.locator(".listed-items--wrapper a");
        const links: string[] = []
        for (let post of (await posts.all())) {
            links.push(await post.getAttribute("href") as string)
        }

          for (let link of links) {
            await page.goto(link)
            const title = await page.locator(".header-title").textContent()
            const url = await page.url()
            const time = await page.locator(".header-detail__info-line").textContent()

            console.log("[SALAM]", title, url, time)

            const content: string[] = [] 

            for (let elem of (await page.locator(".body-elements").all())) {
                content.push(await elem.textContent() as string)
            }
            result.push({
              url,
              title,
              time,
              content
            }) 
          }
      
        fs.writeFile(`./crawled-german-page-data-${pageNumber}.json`, JSON.stringify(result, null, 4), (err) => {
            if (err) {  console.error(err);  return; };
            console.log("File has been created");
        });
    })
}

test("German site", async ({ page }) => {
  test.setTimeout(60_000 * 60 * 60 * 2);

  await page.goto("https://www.faz.net/aktuell/politik/ukraine/");
  await page.frameLocator('iframe[title="SP Consent Message"]').getByLabel('Einverstanden').click({
    timeout: 60_000
  });

  let pageNumber = 1;
  await crawlPage(page, pageNumber)
  pageNumber++;
  
  while (pageNumber < 21) {
    await crawlPage(page, pageNumber)
    pageNumber++;
  }

  await page.waitForTimeout(5_000)
});
