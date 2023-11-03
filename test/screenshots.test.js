import { afterAll, afterEach, beforeAll, beforeEach, describe, test } from "vitest";
import { createServer } from "vite";
import { Builder, By, until } from "selenium-webdriver";
import { Options as FirefoxOptions } from "selenium-webdriver/firefox"
import { Options as ChromeOptions } from "selenium-webdriver/chrome";
import { writeFileSync, accessSync, constants, mkdirSync } from "fs";

describe('Screenshots', async () => {
    const screenshotDir = "test/screenshots/";
    const logBaseLocation = 'test/sample-logs/';
    const supportedBrowsers = [
        'chrome',
        'firefox'
    ];

    class LogCase {
        logName;
        waitForSections;
        tooltipToScreenshot;

        constructor(logName, waitForSections, tooltipToScreenshot) {
            this.logName = logName;
            this.waitForSections = waitForSections;
            if (tooltipToScreenshot != null && tooltipToScreenshot > waitForSections + 1)
                throw new Error("Tooltip to screenshot's index should be lower than the LogCase's wait for section amount!");
            this.tooltipToScreenshot = tooltipToScreenshot;
        }
    }

    const logCases = [
        new LogCase('log1.txt', 4, 4),
        new LogCase('log2.txt', 5, 5),
        new LogCase('log3.txt', 5, 5)
    ];

    async function getChrome() {
        let options = new ChromeOptions();
        options.addArguments('--headless');
        options.addArguments('--disable-gpu');
        options.addArguments('--no-sandbox');
        let builder = await new Builder().forBrowser('chrome');
        builder.setChromeOptions(options);
        return await builder.build();
    }

    async function getFirefox() {
        let options = new FirefoxOptions();
        options.addArguments('--headless');
        options.addArguments('--disable-gpu');
        let builder = await new Builder().forBrowser('firefox');
        builder.setFirefoxOptions(options);
        return await builder.build();
    }

    async function getBrowser(browser) {
        let outputBrowser;
        switch (browser) {
            case 'chrome':
                outputBrowser = await getChrome();
                break;
            case 'firefox':
                outputBrowser = await getFirefox();
                break;
            default:
                throw new Error(browser + "is not a handled browser.");
        }
        await outputBrowser.manage().window().setRect({ width: 1920, height: 1080 });
        return outputBrowser;
    }

    async function waitForSection(browser, amount) {
        await browser.wait(async (d) => {
            let elements = await browser.findElements(By.css('.section'));
            return elements.length >= amount;
        });
    }

    async function saveScreenshot(filename, screenshot) {
        try {
            await accessSync(screenshotDir, constants.F_OK);
        } catch (e) {
            await mkdirSync(screenshotDir);
        }
        await writeFileSync(filename, screenshot, 'base64');
    }

    async function screenshotBar(server, browser, filename) {
        let visualizerBar = await browser.findElement(By.id("ci-timeline-visualizer"));
        let screenshot = await visualizerBar.takeScreenshot();
        await saveScreenshot(filename, screenshot);
    }

    async function screenshotTooltip(server, browser, sectionIndex, filename) {
        let sections = await browser.findElements(By.css('#ci-timeline-visualizer .section'));
        let actions = browser.actions({ async: true });
        await actions.move({ origin: sections[sectionIndex] }).perform();
        let tooltip = sections[sectionIndex].findElement(By.css('.tooltip.show'));
        // Selenium doesn't have the ability to wait for css animations to finish
        await new Promise(r => setTimeout(r, 750));
        let screenshot = await tooltip.takeScreenshot();
        await saveScreenshot(filename, screenshot, 'base64');
    }


    describe.each(logCases)('$logName', async (logCase) => {
        let server;

        beforeAll(async () => {
            process.env["VITE_TEST_LOG_LOCATION"] = logBaseLocation + logCase.logName;
            server = await createServer({
                server: {
                    host: "localhost"
                }
            });
            await server.listen();
        });

        test.each(supportedBrowsers)('%s', async (browserName) => {
            let browser = await getBrowser(browserName);
            await browser.get(`http://${server.config.server.host}:${server.config.server.port}`);
            await waitForSection(browser, logCase.waitForSections);

            let logNameNoExtension = logCase.logName.split('.')[0];
            let logName = logNameNoExtension.split('/').pop();

            let screenshotTestStamp = logName + "_" + logCases.indexOf(logCase) + "-" + browserName;
            await screenshotBar(
                server,
                browser,
                screenshotDir + "bar-" + screenshotTestStamp + ".png"
            );
            if (logCase.tooltipToScreenshot != null) {
                await screenshotTooltip(
                    server,
                    browser,
                    logCase.tooltipToScreenshot,
                    screenshotDir + "tooltip-" + screenshotTestStamp + ".png"
                );
            }

            await browser.quit();
        }, 20000);

        afterAll(async () => {
            server.close();
        });
    });
});