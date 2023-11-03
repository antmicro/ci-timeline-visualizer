import { ConfigManager } from "./ConfigManager.js";
import { GitlabAPI } from "./GitlabAPI.js";
import { Loader } from "./Loader.js";
import { TimeManager } from "./TimeManager.js";

export class Orchestrator {
    stopCheckPollMillis = 10000;
    isPolling = false;

    api;
    initialJobData;

    fetcher;
    parser;
    sectionManager;
    gui;

    startPolling() {
        this.isPolling = true;
        this.stopCheckPoll();
    }

    stopPolling() {
        this.isPolling = false;
    }

    async stopCheckPoll() {
        do {
            this.stopCheck();
            await new Promise(r => setTimeout(r, this.stopCheckPollMillis));
        } while (this.isPolling);
    }

    async start() {
        let loader = new Loader();
        [this.fetcher, this.parser, this.sectionManager, this.gui] = await loader.load();
        await TimeManager.setup(this.sectionManager);

        this.api = new GitlabAPI(ConfigManager.config.URLs["currentJobURL"]);

        this.initialJobData = await new Promise(resolve => {
            this.api.getJobData((response) => resolve(response));
        });
        let jobStatus = this.initialJobData["status"];

        switch (jobStatus) {
            case "canceled":
            case "failed":
            case "success":
                this.runOnce();
                break;
            case "running":
            default:
                this.runContinuous();
                this.startPolling();
                break;
        }

        return;
    }

    runContinuous() {
        this.fetcher.setListener((data) => {this.parser.parse(data)});
        this.parser.listener = (data) => {this.sectionManager.addSectionsFromTags(data)};
        this.sectionManager.listeners.push((data) => {this.gui.update(data)});

        this.fetcher.startPolling();
        this.sectionManager.createPendingSection();
        this.gui.startPolling();
    }

    runOnce() {
        this.fetcher.setListener((data) => {this.parser.parse(data)});

        if (this.initialJobData["status"] === "canceled") {
            this.parser.listener = (data) => {
                this.sectionManager.addSectionsFromTags(data)
                this.sectionManager.closeLastSection(
                    Math.floor(new Date(this.initialJobData["finished_at"]) / 1000) + TimeManager.getTimeOffset(),
                    this.parser.lastLineParsed);
            };
        } else {
            this.parser.listener = (data) => {this.sectionManager.addSectionsFromTags(data)};
        }

        this.sectionManager.listeners.push((data) => {this.gui.update(data)});

        this.fetcher.poll();
        this.sectionManager.createPendingSection();
    }

    async stopCheck() {
        let jobData = await new Promise(resolve => {
            this.api.getJobData((response) => resolve(response));
        });

        let jobStatus = jobData["status"];

        switch (jobStatus) {
            case "canceled":
                this.sectionManager.closeLastSection(
                    Math.floor(new Date(this.initialJobData["finished_at"]) / 1000) + TimeManager.getTimeOffset(),
                    this.parser.lastLineParsed);
                this.stop();
                break;
            case "failed":
            case "success":
                this.stop()
                break;
        }
    }

    stop() {
        this.fetcher.stopPolling();
        this.gui.stopPolling();
        this.stopPolling();

        // Poll one last time to ensure no new content has appeared
        // after the last fetcher poll and before stopCheck poll
        this.fetcher.poll();
    }
}