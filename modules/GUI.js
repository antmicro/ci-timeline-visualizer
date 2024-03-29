import { ConfigManager } from "./ConfigManager.js"
import { UISection } from "./UISection.js";
import { ColorGenerator } from "./ColorGenerator.js";
import { ScrollBehaviorFactory } from "./ScrollBehaviors/ScrollBehaviorFactory.js";

export class GUI {
    config;

    parentElement;
    uiSections = [];
    #minWidth;

    sectionManager;
    pollMillis = 1000;
    isPolling = false;

    scrollBehavior;

    constructor(parentElement, sectionManager) {
        this.config = ConfigManager.config.GUI;
        this.parentElement = parentElement;
        this.sectionManager = sectionManager;
        this.uiSections = [];
        this.existingColors = [];
        this.isPolling = false;
        this.scrollBehavior = ScrollBehaviorFactory.fromString(this.config['scrollBehavior']);
    }

    startPolling() {
        this.isPolling = true;
        this.poll();
    }

    stopPolling() {
        this.isPolling = false;
    }

    async poll() {
        if(!this.isPolling)
            return;
        this.update(this.sectionManager.sections);

        await new Promise(r => setTimeout(r, this.config.pollMillis));

        this.poll();
    }

    update(sections) {
        this.#minWidth = this.config.minWidth;
        this.#minimumWidthCheck(sections.length);

        let percentages = this.#calculatePercentages(sections);

        let existingColors = [];
        for (const i in sections) {
            let newColor = ColorGenerator.getSectionColor(sections[i].sectionName, existingColors);
            existingColors.push(newColor);

            let updatedSection = this.uiSections[i];
            if (updatedSection == null) {
                updatedSection = this.#addNewUISection();
            }
            updatedSection.update(
                    sections[i].sectionName,
                    newColor,
                    sections[i].duration,
                    percentages[i],
                    this.#minWidth);
            if(sections[i].startLine < 1 || this.scrollBehavior == null)
                updatedSection.setOnclick(null);
            else
                updatedSection.setOnclick(() => {this.scrollBehavior.scrollTo(sections[i].startLine)});
        }
    }

    reset(sections) {
        while (this.parentElement.firstChild) {
            this.parentElement.removeChild(this.parentElement.lastChild);
        }
        this.uiSections = [];
        this.initialize(sections);
    }

    #addNewUISection() {
        let newUISection = new UISection();
        if (this.uiSections[0] == null) {
            newUISection.setLeftmost();
        } else {
            let lastSectionPosition = this.uiSections.length - 1;
            if (lastSectionPosition != 0)
                this.uiSections[lastSectionPosition].setMiddle();
            newUISection.setRightmost();
        }
        this.uiSections.push(newUISection);
        this.parentElement.appendChild(newUISection.sectionDiv);
        return newUISection;
    }

    #minimumWidthCheck(sectionsAmount) {
        if (this.#minWidth > (100 / sectionsAmount)) {
            console.log("[ci-timeline-visualizer] Minimum width is too large for this many sections; changing it to 0");
            this.#minWidth = 0;
        }
    }

    #calculatePercentages(sections) {
        let overallDuration = 0;
        for (const section of sections) {
            overallDuration += section.duration;
        }

        let nonMinimumWidths = 0;
        let percentages = [];

        for (const section of sections) {
            let percent;
            if (section.duration == 0) {
                percent = 0;
            } else {
                percent = (section.duration / overallDuration).toPrecision(2) * 100;
            }

            if(percent > this.#minWidth) {
                nonMinimumWidths += 1;
            }

            percentages.push(percent);
        }

        // If everything is below minimum, divide equally
        if (nonMinimumWidths == 0) {
            for (const i in percentages) {
                percentages[i] = (100 / sections.length).toPrecision(2);
            }
        }
        return percentages;
    }
}