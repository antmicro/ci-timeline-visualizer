export function visualize(parentElement, sections) {
    // as in minimum width %
    let minimumWidth = 2;
    if (minimumWidth > 100 / sections.length) {
        console.log("[ci-timeline-visualizer] Minimum width is too large for this many sections; changing it to 0");
        minimumWidth = 0;
    }


    let overallTimeSum = 0;
    for (const section of sections) {
        if (section.isOpen) {
            section.timeTaken = Math.floor(Date.now() / 1000) - section.startTimestamp;
        }
        overallTimeSum += section.timeTaken;
    }


    // Get true percentages of time taken and create a table of [Section, truePercent] tuples, and
    // determine the surplus of percentages
    let surplus = 0;
    let nonMinimumWidths = 0;
    let percentTable = [];
    for (const section of sections) {
        let truePercent;
        if (section.timeTaken == 0) {
            truePercent = 0;
        } else {
            truePercent = (section.timeTaken / overallTimeSum).toPrecision(2) * 100;
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

        parentElement.appendChild(createSectionDiv(percentTuple[0], uiPercent));
    }


}

export function createSectionDiv(section, percent) {
    let newDiv = document.createElement("div");
    newDiv.setAttribute("class", "section");
    newDiv.setAttribute("style", "width: " + percent + "%")
    //newDiv.onmouseover = (event) => {}; // create tooltip!
    //newDiv.onmouseleave = (event) => {};

    return newDiv;
}