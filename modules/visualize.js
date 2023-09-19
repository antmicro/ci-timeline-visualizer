export function visualize(parentElement, sections) {
    // as in minimum width%
    // inputting a value > 100/sections.length is a bad idea
    let minimumWidth = 5; 


    let overallTimeSum = 0;
    for(const section of sections) {
        overallTimeSum += section.timeTaken;
    }


    // Get true percentages of time taken and create a table of [Section, truePercent] tuples, and
    // determine the surplus of percentages
    let surplus = 0;
    let nonMinimumTimes = 0;
    let percentTable = [];
    for(const section of sections) {
        let truePercent;
        if(section.timeTaken == 0) {
            truePercent = 0;
        } else {
            truePercent = (section.timeTaken / overallTimeSum).toPrecision(2) * 100;
        }

        if(truePercent < minimumWidth) {
            surplus += minimumWidth - truePercent;
        } else if (truePercent > minimumWidth) {
            nonMinimumTimes += 1;
        }

        percentTable.push([section, truePercent]);
    }

    // Subtract the surplus equally from all non-minimum times, and
    // create the UI
    let equalizationValue = (surplus / nonMinimumTimes).toPrecision(2);
    for(const percentTuple of percentTable) {
        let uiPercent = percentTuple[1];
        if(uiPercent <= minimumWidth) {
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