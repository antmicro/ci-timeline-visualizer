export function visualize(parentElement, sections) {
    // as in minimum width %
    let minimumWidth = 2;
    if (minimumWidth > 100 / sections.length) {
        console.log("[ci-timeline-visualizer] Minimum width is too large for this many sections; changing it to 0");
        minimumWidth = 0;
    }


    let overallTimeSum = 0;
    for (const section of sections) {
        overallTimeSum += section.duration;
    }


    // Get true percentages of time taken and create a table of [Section, truePercent] tuples, and
    // determine the surplus of percentages
    let surplus = 0;
    let nonMinimumWidths = 0;
    let percentTable = [];
    for (const section of sections) {
        let truePercent;
        if (section.duration == 0) {
            truePercent = 0;
        } else {
            truePercent = (section.duration / overallTimeSum).toPrecision(2) * 100;
        }

        if (truePercent < minimumWidth) {
            surplus += minimumWidth - truePercent;
        } else if (truePercent > minimumWidth) {
            nonMinimumWidths += 1;
        }

        percentTable.push([section, truePercent]);
    }

    // If there are only minimum times (everything took 0 seconds) then draw all sections equally
    if (nonMinimumWidths == 0) {
        for (const section of sections) {
            parentElement.appendChild(createSectionDiv(section, (100 / sections.length).toPrecision(2)));
        }
        return;
    }

    // Subtract the surplus equally from all non-minimum times, and
    // create the UI
    let equalizationValue = (surplus / nonMinimumWidths).toPrecision(2);
    for (const percentTuple of percentTable) {
        let uiPercent = percentTuple[1];
        if (uiPercent <= minimumWidth) {
            uiPercent = minimumWidth;
        } else {
            uiPercent -= equalizationValue;
        }

        parentElement.appendChild(createSectionDiv(percentTuple[0], uiPercent, percentTuple[1]));
    }


}

export function createSectionDiv(section, percent, truePercent) {
    let newDiv = document.createElement("div");
    newDiv.setAttribute("class", "section");
    newDiv.setAttribute("style", "width: " + percent + "%")
    createTooltip(newDiv, section, truePercent);
    //newDiv.onmouseover = (event) => {}; // create tooltip!
    //newDiv.onmouseleave = (event) => {};

    return newDiv;
}

function createTooltip(parent, section, truePercent) {
    let tooltip = document.createElement("div");
    tooltip.setAttribute("class", "tooltip");

    let triangle = document.createElement("div");
    triangle.setAttribute("class", "triangle");

    let innerTooltip = document.createElement("div");
    innerTooltip.setAttribute("class", "inner-tooltip");

    let sectionName = document.createElement("span");
    sectionName.setAttribute("class", "section-name");
    sectionName.innerText = section.sectionName;

    let sectionTime = document.createElement("span");
    sectionTime.setAttribute("class", "section-time");
    let times = [0, 0, 0]; // [hours, minutes, seconds]
    let duration = section.duration;
    times[0] = Math.floor(duration/3600);
    times[1] = Math.floor((duration - times[0]*3600)/60);
    times[2] = duration - times[0]*3600 - times[1]*60;
    times = times.map((time) => String(time).padStart(2, '0'));
    sectionTime.innerText = times.join(":");

    let sectionShare = document.createElement("span");
    sectionShare.setAttribute("class", "section-share");
    sectionShare.innerText = truePercent.toFixed(2) + "%";

    innerTooltip.appendChild(sectionName);
    innerTooltip.appendChild(document.createElement("br"));
    innerTooltip.appendChild(sectionTime);
    innerTooltip.appendChild(document.createElement("br"));
    innerTooltip.appendChild(sectionShare);

    tooltip.appendChild(triangle);
    tooltip.appendChild(innerTooltip);

    parent.appendChild(tooltip);

}

function showTooltip(sectionDiv, section) {
    let tooltip = sectionDiv.find

}