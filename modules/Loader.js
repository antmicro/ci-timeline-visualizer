import { ConfigManager } from "./ConfigManager.js";
import { Fetcher } from "./Fetcher.js";
import { Parser } from "./Parser.js";
import { SectionManager } from "./SectionManager.js";
import { GUI } from "./GUI.js";
import { GitlabAPI } from "./GitlabAPI.js";

export class Loader {
    config = ConfigManager.config.Loader;
    URLConfig = ConfigManager.config.URLs;

    visualizerDiv;

    requiredElementsByVersion = {
        'pre-14.4': {
            "inside": ".build-page",
            "before": ".build-page .build-trace-container"
        },
        'post-14.4': {
            "inside": ".build-page",
            "before": ".build-page .build-log-container"
        },
    }

    requiredElements;

    foundElements = {}

    async load() {
        await this.#setElementsToEnsure(this.config["requiredElements"]);
        await this.#ensureAllElements();

        this.visualizerDiv = document.getElementById(this.config.visualizerDivId);
        if (this.visualizerDiv == null) {
            this.visualizerDiv = document.createElement("div");
            this.visualizerDiv.id = this.config.visualizerDivId;
            this.foundElements["inside"].insertBefore(this.visualizerDiv, this.foundElements["before"]);
        }

        let fetcher = new Fetcher();
        let parser = new Parser();
        let sectionManager = new SectionManager();
        let gui = new GUI(this.visualizerDiv, sectionManager);

        return [fetcher, parser, sectionManager, gui];
    }

    async #setElementsToEnsure(elements) {
        if (typeof elements === 'object' &&
            !Array.isArray(elements) &&
            elements !== null) {
            this.requiredElements = elements;
            return;
        }

        let version = elements;
        if(elements === 'detect') {
            version = await this.#detectVersion();
        }

        this.requiredElements = this.requiredElementsByVersion[version];
        if (this.requiredElements == null) {
            this.#setElementsToEnsure(this.config['defaultRequiredElements']);
        }
    }

    async #detectVersion() {
        let api = new GitlabAPI(this.URLConfig['currentJobURL']);
        let promise = new Promise(resolve => {
            api.getVersionData((data) => resolve(data))
        });
        let versionData = await promise;

        if(versionData == null || versionData.version == null)
            return null;

        let versionString = versionData.version;
        let [majorVer, minorVer] = versionString.split(".");
        [majorVer, minorVer] = [Number(majorVer), Number(minorVer)];

        let version;
        if(majorVer < 14) {
            version = 'pre-14.4';
        } else if (majorVer === 14) {
            if(minorVer < 4)
                version = 'pre-14.4';
            else
                version = 'post-14.4';
        } else {
            version = 'post-14.4';
        }

        return version;
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