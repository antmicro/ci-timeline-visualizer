#!/usr/bin/env python3
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.action_chains import ActionChains
import argparse
import time

def waitForSectionAmount(browser, amount):
    wait = WebDriverWait(browser, timeout=200)
    def isAmountIn(d):
        elements = browser.find_elements_by_css_selector('#ci-timeline-visualizer .section')
        return len(elements) >= amount
    
    wait.until(isAmountIn)

def getTooltipScreenshot(browser, sectionIndex, filename):
    sections = browser.find_elements_by_css_selector('#ci-timeline-visualizer .section')
    hover = ActionChains(browser).move_to_element(sections[sectionIndex])
    hover.perform()
    time.sleep(0.75) # Selenium doesn't have the ability to wait for css animations to finish
    sections[sectionIndex].find_element_by_css_selector('.tooltip.show').screenshot(filename)

handledBrowsers = [
    'chrome',
    'firefox'
]

def getBrowser(browser):
    match browser:
        case 'chrome':
            opts = webdriver.chrome.options.Options()
            opts.add_argument("--headless")
            return webdriver.Chrome(options=opts)
        case 'firefox':
            opts = webdriver.FirefoxOptions()
            opts.add_argument("--headless")
            return webdriver.Firefox(options=opts)

def main():
    parser = argparse.ArgumentParser(
        prog="ss_gen.py",
        description="Screenshot generator for the ci-timeline-visualizer"
    )

    parser.add_argument(
        '-b',
        '--browser',
        required=True,
        choices=handledBrowsers
    )

    parser.add_argument(
        '-w',
        '--wait',
        required=True,
        type=int,
        help=f"Wait for this many sections to appear."
    )

    defaultAddress = "http://localhost:5500"
    parser.add_argument(
        '-a',
        '--address',
        default=defaultAddress,
        help=f"Make selenium go to this page; default: {defaultAddress}"
    )

    parser.add_argument(
        '-t',
        '--tooltip',
        type=int,
        help=f"Provide an index of a section. Wait for this section to appear in the visualizer, " +
        "then make a screenshot of its tooltip. If this is not specified, no tooltip screenshot will be made."
    )

    parser.add_argument(
        '-o:v',
        '--output:visualizer',
        dest='ovis',
        metavar='FILENAME.png',
        default="visualizer.png",
        help="Visualizer screenshot filename."
    )

    parser.add_argument(
        '-o:t',
        '--output:tooltip',
        dest='ottip',
        metavar='FILENAME.png',
        default="tooltip.png",
        help="Tooltip screenshot filename."
    )

    args = parser.parse_args()

    if args.ovis[-4:] != '.png':
        print(f"Output visualizer filename must end in .png. Passed filename: {args.ovis}")
        return 1

    if args.ottip[-4:] != '.png':
        print(f"Output tooltip filename must end in .png. Passed filename: {args.ottip}")

    browser = getBrowser(args.browser)
    browser.get(args.address)

    visualizer = browser.find_element_by_id("ci-timeline-visualizer")

    waitForSectionAmount(browser, max(args.wait, args.tooltip) if args.tooltip else args.wait)
    if args.tooltip:
        getTooltipScreenshot(browser, args.tooltip, args.ottip)

    visualizer.screenshot(args.ovis)

    browser.quit()

if __name__ == '__main__':
    main()