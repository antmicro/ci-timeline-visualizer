import { ConfigManager } from "./ConfigManager.js";
import { Fetcher } from "./Fetcher.js";
import { Parser } from "./Parser.js";
import { SectionManager } from "./SectionManager.js";
import { GUI } from "./GUI.js";

export class Loader {
    config = ConfigManager.config.Loader;

    visualizerDiv;

    requiredElements = {
        "buildPage": ".build-page",
        "buildTraceContainer": ".build-page .build-trace-container"
    }

    foundElements = {}

    async load() {
        await this.#ensureAllElements();

        this.visualizerDiv = document.getElementById(this.config.visualizerDivId);
        if (this.visualizerDiv == null) {
            this.visualizerDiv = document.createElement("div");
            this.visualizerDiv.id = this.config.visualizerDivId;
            this.foundElements["buildPage"].insertBefore(this.visualizerDiv, this.foundElements["buildTraceContainer"]);
        }

        let fetcher = new Fetcher();
        let parser = new Parser();
        let sectionManager = new SectionManager();
        let gui = new GUI(this.visualizerDiv, sectionManager);

        return [fetcher, parser, sectionManager, gui];
    }

    async #ensureAllElements() {
        for (let elem of Object.keys(this.requiredElements)) {
            await this.#ensureElement(this.requiredElements[elem]).then((found) => {
                this.foundElements[elem] = found;
            })
        }
    }

    #ensureElement(selector) {
        return new Promise(resolve => {
            if(document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const mutObserver = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    mutObserver.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            mutObserver.observe(document, {subtree: true, childList: true});
        })
    }
}