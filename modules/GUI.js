import { UISection } from "./UISection.js";
import { HSL, ColorGenerator } from "./ColorGenerator.js";

export class GUI {
    minimumWidth = 2;
    overallDuration = 0;

    parentElement;
    uiSections = [];

    constructor(parentElement, minimumWidth) {
        this.parentElement = parentElement;
        this.minimumWidth = minimumWidth;
        this.uiSections = [];
    }

    initialize(sections) {
        // Initial checks
        if (this.minimumWidth > (100 / sections.length)) {
            console.log("[ci-timeline-visualizer] Minimum width is too large for this many sections; changing it to 0");
            minimumWidth = 0;
        }

        // Aggregate data
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
                tuple.push((100/sections.length).toPrecision(2));
            }
            return;
        }

        // Subtract the surplus equally from all non-minimum times, and
        // create the UI
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

        // Create UISections matching the data
        let existingColors = [];
        for (const i in sections) {
            let newUISection = new UISection();
            if (i==0) {
                newUISection.setLeftmost();
            } else if (i==sections.length-1) {
                newUISection.setRightmost();
            }
            newUISection.update(sections[i].sectionName,
                                sections[i].duration,
                                percentTable[i][0],
                                percentTable[i][1]);
            let newColor = ColorGenerator.getSectionColor(sections[i].sectionName, existingColors);
            newUISection.setColor(newColor);
            existingColors.push(newColor);
            this.uiSections.push(newUISection);
        }

        // Connect UISections to parent element
        for (const uiSection of this.uiSections) {
            this.parentElement.appendChild(uiSection.sectionDiv);
        }
    }

    reset(sections) {
        while(this.parentElement.firstChild) {
            this.parentElement.removeChild(this.parentElement.lastChild);
        }
        this.uiSections = [];
        this.initialize(sections);
    }
}