import { UISection } from "./UISection.js";
import { HSL, ColorGenerator } from "./ColorGenerator.js";

export class GUI {
    minimumWidth = 2;

    parentElement;
    uiSections = [];
    existingColors = [];

    constructor(parentElement, minimumWidth) {
        this.parentElement = parentElement;
        this.minimumWidth = minimumWidth;
        this.uiSections = [];
    }

    update(sections) {
        this.#minimumWidthCheck(sections.length);

        let percentages = this.#calculatePercentages(sections);

        for (const i in sections) {
            if (this.uiSections[i] != null) {
                this.uiSections[i].update(
                    sections[i].sectionName,
                    sections[i].duration,
                    percentages[i][0],
                    percentages[i][1]);
            } else {
                this.addNewUISection(
                    sections[i].sectionName,
                    sections[i].duration,
                    percentages[i][0],
                    percentages[i][1]);
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


        let surplus = 0;
        let nonMinimumWidths = 0;
        let percentTable = []; // array of tuples [truePercent, uiPercent]
        // Get true percentages, surplus and amnt of non-minimum widths
        for (const section of sections) {
            let truePercent;
            if (section.duration == 0) {
                truePercent = 0;
            } else {
                truePercent = (section.duration / overallDuration).toPrecision(2) * 100;
            }

            if (truePercent < this.minimumWidth) {
                surplus += this.minimumWidth - truePercent;
            } else if (truePercent > this.minimumWidth) {
                nonMinimumWidths += 1;
            }

            percentTable.push([truePercent]);
        }

        if (nonMinimumWidths == 0) {
            for (const tuple of percentTable) {
                tuple.push((100 / sections.length).toPrecision(2));
            }
            return;
        }

        // Subtract the surplus equally from all non-minimum times
        let equalizationValue = (surplus / nonMinimumWidths).toPrecision(2);
        for (const tuple of percentTable) {
            let uiPercent = tuple[0];
            if (uiPercent <= this.minimumWidth) {
                uiPercent = this.minimumWidth;
            } else {
                uiPercent -= equalizationValue;
            }
            tuple.push(uiPercent);
        }

        return percentTable;
    }
}