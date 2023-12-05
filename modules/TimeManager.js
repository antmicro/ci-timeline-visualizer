import { ConfigManager } from "./ConfigManager.js";
import { GitlabAPI } from "./GitlabAPI.js";

export class TimeManager {
    static runnerTimeOffset;
    static jobData;
    static firstSection;
    static sectionManager;

    static get currentEpoch() {
        if(ConfigManager.config["distrustRunnerTime"])
            return TimeManager.runnerEpoch();
        else
            return TimeManager.localEpoch();
    }

    static localEpoch() {
        return Math.floor(Date.now() / 1000);
    }

    static runnerEpoch() {
        let timeOffset = TimeManager.getTimeOffset();
        return TimeManager.localEpoch() + timeOffset;
    }

    static async setup(sectionManager) {
        TimeManager.sectionManager = sectionManager;
        let firstSection = TimeManager.firstSectionCheck(sectionManager.sections);
        if(TimeManager.firstSection == null) {
            sectionManager.listeners.push(TimeManager.firstSectionCheck);
        }
        let api = new GitlabAPI(window.location.href)

        TimeManager.jobData = await new Promise(resolve => {
            api.getJobData((response) => resolve(response));
        });
    }

    static getTimeOffset() {
        if(!ConfigManager.config["distrustRunnerTime"])
            return 0;

        if(TimeManager.runnerTimeOffset == null) {
            if(TimeManager.firstSection == null) {
                console.log("[ci-timeline-visualizer] You want to get a runner time offset while there is no 'prepare_executor' section while in 'distrustRunnerTime' mode. \n" +
                "Switching back to local epoch (setting 'distrustRunnerTime' to false)");
                ConfigManager.config["distrustRunnerTime"] = false;
                return 0;
            }

            TimeManager.runnerTimeOffset = 
                TimeManager.firstSection.startTimestamp -
                Math.floor(new Date(TimeManager.jobData["started_at"]).getTime() / 1000);
            console.log("[ci-timeline-visualizer] Runner time offset: " + TimeManager.runnerTimeOffset);
        }

        return TimeManager.runnerTimeOffset;
    }

    static firstSectionCheck(sections) {
        for (const section of sections) {
            if(section.sectionName === "prepare_executor") {
                TimeManager.firstSection = section;
                TimeManager.sectionManager.listeners = TimeManager.sectionManager.listeners.filter(
                    listener => listener !== TimeManager.firstSectionCheck);
                return;
            }
        }
    }
}