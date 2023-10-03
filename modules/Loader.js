import { Fetcher } from "./Fetcher.js";
import { Parser } from "./Parser.js";
import { GUI } from "./GUI.js";

const visualizerDivId = "ci-timeline-visualizer"; //Will be moved to ConfigManager

export class Loader {

    visualizerDiv;

    minimumWidth = 2; //Will be moved to ConfigManager

    requiredElements = {
        "buildPage": ".build-page",
        "buildTraceContainer": ".build-page .build-trace-container"
    }

    foundElements = {}

    async load() {
        await this.#ensureAllElements();

        this.visualizerDiv = document.getElementById(visualizerDivId);
        if (this.visualizerDiv == null) {
            this.visualizerDiv = document.createElement("div");
            this.visualizerDiv.id = visualizerDivId;
            this.foundElements["buildPage"].insertBefore(this.visualizerDiv, this.foundElements["buildTraceContainer"]);
        }

        let fetcher = new Fetcher();
        let parser = new Parser();
        let gui = new GUI(this.visualizerDiv, this.minimumWidth);

        return [fetcher, parser, gui];
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