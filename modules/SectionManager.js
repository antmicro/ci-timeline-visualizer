import { Section } from "./classes.js"
import { ConfigManager } from "./ConfigManager.js";
import { GitlabAPI } from "./GitlabAPI.js";

export class SectionManager {
    sections = [];

    listeners = [];

    notify() {
        for (const listener of this.listeners) {
            listener(this.sections);
        }
    }

    createPendingSection() {
        let URLs = ConfigManager.config.URLs;
        let api = new GitlabAPI(URLs["gitlabRoot"], window.location.href);

        api.getJobData((jobData) => {
            if (jobData["queued_duration"] == null)
                return;
            let sectionName = "pending";
            let endTimestamp = parseInt((new Date(jobData["started_at"]).getTime() / 1000).toFixed(0));
            let startTimestamp = endTimestamp - jobData["queued_duration"].toFixed(0);

            let newSection = new Section(sectionName, startTimestamp, endTimestamp, -1, -1);
            this.sections.splice(0, 0, newSection); // insert as first element
            this.notify();
        });
    }

    addSectionsFromTags(newTags) {
        let lastSection = this.sections[this.sections.length - 1];

        let isOpen = false;
        if (lastSection != null)
            isOpen = lastSection.isOpen;
        // If there is a tag after the opening tag, it should be a closing tag.
        // This might not be the case if subsections were to be implemented.
        for (const tag of newTags) {
            if (isOpen) {
                lastSection.closeSection(tag);
                isOpen = false;
            } else {
                let newSection = Section.openNewSection(tag);

                this.sections.push(newSection);
                lastSection = newSection;
                isOpen = true;
            }
        }
        this.notify();
    }
}