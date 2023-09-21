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
        for (const i in sections) {
            let newUISection = new UISection();
            newUISection.update(sections[i].sectionName, sections[i].duration, percentTable[i][0], percentTable[i][1]);
            this.uiSections.push(newUISection);
        }

        // Connect UISections to parent element
        for (const uiSection of this.uiSections) {
            this.parentElement.appendChild(uiSection.sectionDiv);
        }

    }
}

export class UISection {
    sectionDiv;

    tooltip;

    constructor() {
        this.sectionDiv = document.createElement("div");
        this.sectionDiv.setAttribute("class", "section");

        this.tooltip = new Tooltip();
        this.sectionDiv.appendChild(this.tooltip.tooltipDiv);
    }

    update(name, duration, truePercent, uiPercent) {
        this.sectionDiv.setAttribute("style", "width: " + uiPercent + "%");
        this.tooltip.update(name, duration, truePercent);
    }
}

export class Tooltip {
    tooltipDiv;
    triangle;
    innerTooltip;

    sectionName;
    sectionTime;
    sectionShare;

    constructor() {
        this.tooltipDiv = document.createElement("div");
        this.tooltipDiv.setAttribute("class", "tooltip");

        this.triangle = document.createElement("div");
        this.triangle.setAttribute("class", "triangle");

        this.innerTooltip = document.createElement("div");
        this.innerTooltip.setAttribute("class", "inner-tooltip");

        this.sectionName = document.createElement("span");
        this.sectionName.setAttribute("class", "section-name");

        this.sectionTime = document.createElement("span");
        this.sectionTime.setAttribute("class", "section-time");

        this.sectionShare = document.createElement("span");
        this.sectionShare.setAttribute("class", "section-share");

        this.innerTooltip.appendChild(this.sectionName);
        this.innerTooltip.appendChild(document.createElement("br"));
        this.innerTooltip.appendChild(this.sectionTime);
        this.innerTooltip.appendChild(document.createElement("br"));
        this.innerTooltip.appendChild(this.sectionShare);

        this.tooltipDiv.appendChild(this.triangle);
        this.tooltipDiv.appendChild(this.innerTooltip);
    }
    
    update(name, duration, share) {
        this.sectionName.innerText = name;

        let times = [0, 0, 0]; // [hours, minutes, seconds]
        times[0] = Math.floor(duration/3600);
        times[1] = Math.floor((duration - times[0]*3600)/60);
        times[2] = duration - times[0]*3600 - times[1]*60;
        times = times.map((time) => String(time).padStart(2, '0'));
        this.sectionTime.innerText = times.join(":");

        this.sectionShare.innerText = Number(share).toFixed(2) + "%";
    }
}