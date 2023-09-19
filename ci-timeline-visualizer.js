class SectionTag {
    static START = 0;
    static STOP = 1;

    tagType = SectionTag.START;
    unixTimestamp = 0;
    sectionName = "";
    lineNumber = 0;

    constructor(tagType, unixTimestamp, sectionName, lineNumber) {
        this.tagType = tagType;
        this.unixTimestamp = unixTimestamp;
        this.sectionName = sectionName;
        this.lineNumber = lineNumber;
    }
}

class Section {
    sectionName = "";

    startTimestamp = 0;
    endTimestamp = 0;

    startLine = 0;
    endLine = 0;

    timeTaken = 0;


    constructor(sectionName, startTimestamp, endTimestamp, startLine, endLine) {
        this.sectionName = sectionName;
        this.startTimestamp = startTimestamp;
        this.endTimestamp = endTimestamp;
        this.startLine = startLine;
        this.endLine = endLine;

        this.timeTaken = endTimestamp - startTimestamp;
    }

    static fromSectionTags(startSection, endSection) {

        return new Section(startSection.sectionName,
                           startSection.unixTimestamp,
                           endSection.unixTimestamp,
                           startSection.lineNumber,
                           endSection.lineNumber);
    }
}

function getJobLog() { //reads from file
    let logSource = new XMLHttpRequest();
    logSource.open('GET', './joblogoutput.txt', false);

    // logSource.onreadystatechange = () => {
    //     if (logSource.readyState === XMLHttpRequest.DONE) {
    //         alert(logSource.responseText);
    //     }
    // }
    logSource.send();
    return logSource.responseText;
}

function getJobLogFromAPI(personal_access_token, project_id, job_id) {
    let baseURL = new URL("/", window.location.href);
    let apiCallURL = new URL(`/api/v4/projects/${project_id}/jobs/${job_id}/trace`, baseURL);
    
    let apiCall = new XMLHttpRequest();
    apiCall.open('GET', apiCallURL, false);
    apiCall.setRequestHeader("PRIVATE-TOKEN", personal_access_token);
    apiCall.send();
    return apiCall.responseText;
}

function removeAnsi(rawJobLog) {
    let ansiRegex = /\u001b\[[\d;]*[mK]/g; // does not match all ANSI codes!
    let ansiless = rawJobLog.replace(ansiRegex, "");

    return ansiless;
}

function parseJobLog(cleanJobLog) {
    // Pick out section tags
    let lines = cleanJobLog.split('\n');
    let sectionRegex = /^section_(start|end):\d+:/i;
    let stringSections = [];
    for(const i in lines) {
        if(sectionRegex.test(lines[i])) {
            let separateSections = lines[i].split('\r');
            for(const section of separateSections) {
                if(sectionRegex.test(section))
                    stringSections.push([section, i]);
            }
        }
    }

    // Put them in SectionTags
    let sectionTags = [];
    for(const section of stringSections) {
        let splitSection = section[0].split(':');

        let newTagType;
        switch(splitSection[0]) {
            case 'section_start':
                newTagType = SectionTag.START;
                break;
            case 'section_end':
                newTagType = SectionTag.STOP;
                break;
        }

        let newUnixTimestamp = Number(splitSection[1])

        let newSectionName = splitSection[2];

        sectionTags.push(new SectionTag(newTagType, newUnixTimestamp, newSectionName, section[1]));
    }
    return sectionTags;
}

function convertToSections(sectionTags) {

    let sections = [];
    // For now we'll trust that a section ends before another one starts
    let tagOpenedFlag = false;
    let startTag;
    for(const tag of sectionTags) {
        if(!tagOpenedFlag) {
            startTag = tag;
            tagOpenedFlag = true;
        } else {
            sections.push(Section.fromSectionTags(startTag, tag));
            tagOpenedFlag = false;
        }
    }
    
    // In the future, this could be ran while the CI still runs. Might want to add 'not finished yet' to a section
    return sections;
}

function visualize(parentElement, sections) {
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

function createSectionDiv(section, percent) {
    let newDiv = document.createElement("div");
    newDiv.setAttribute("class", "section");
    newDiv.setAttribute("style", "width: " + percent + "%")
    //newDiv.onmouseover = (event) => {}; // create tooltip!
    //newDiv.onmouseleave = (event) => {};

    return newDiv;
}

let testTimes1 = [
    ["a", 2],
    ["b", 28],
    ["c", 4],
    ["d", 66]
];

let testTimes2 = [
    ["a", 5],
    ["b", 5],
    ["c", 5],
    ["d", 85]
];

export {getJobLog, getJobLogFromAPI, removeAnsi, parseJobLog, convertToSections, visualize}