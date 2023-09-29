import { UISection } from "./UISection.js";
import { ColorGenerator } from "./ColorGenerator.js";
import { State } from "./global-state.js";

export class GUI {
    minimumWidth = 2;

    parentElement;
    uiSections = [];
    existingColors = [];

    pollMillis = 1000;
    isPolling = false;

    constructor(parentElement, minimumWidth) {
        this.parentElement = parentElement;
        this.minimumWidth = minimumWidth;
        this.uiSections = [];
        this.existingColors = [];
        this.isPolling = false;
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
        this.update(State.instance().sections);

        await new Promise(r => setTimeout(r, this.pollMillis));

        this.poll();
    }

    update(sections) {
        this.#minimumWidthCheck(sections.length);

        let percentages = this.#calculatePercentages(sections);

        for (const i in sections) {
            if (this.uiSections[i] != null) {
                this.uiSections[i].update(
                    sections[i].sectionName,
                    sections[i].duration,
                    percentages[i],
                    this.minimumWidth);
            } else {
                this.addNewUISection(
                    sections[i].sectionName,
                    sections[i].duration,
                    percentages[i],
                    this.minimumWidth);
            }
        }


    }

    reset(sections) {
        while (this.parentElement.firstChild) {
            this.parentElement.removeChild(this.parentElement.lastChild);
        }
        this.uiSections = [];
        this.initialize(sections);
    }

    addNewUISection(name, duration, truePercent, uiPercent) {
        let newUISection = new UISection();
        if (this.uiSections[0] == null) {
            newUISection.setLeftmost();
        } else {
            let lastSectionPosition = this.uiSections.length - 1;
            if (lastSectionPosition != 0)
                this.uiSections[lastSectionPosition].setMiddle();
            newUISection.setRightmost();
        }
        let newColor = ColorGenerator.getSectionColor(name, this.existingColors);
        newUISection.update(name, duration, truePercent, uiPercent);
        newUISection.setColor(newColor);
        this.existingColors.push(newColor);
        this.uiSections.push(newUISection);
        this.parentElement.appendChild(newUISection.sectionDiv);
    }

    #minimumWidthCheck(sectionsAmount) {
        if (this.minimumWidth > (100 / sectionsAmount)) {
            console.log("[ci-timeline-visualizer] Minimum width is too large for this many sections; changing it to 0");
            this.minimumWidth = 0;
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

            if(percent > this.minimumWidth) {
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