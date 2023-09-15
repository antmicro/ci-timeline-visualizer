class SectionTag {
    static START = 0;
    static STOP = 1;

    tagType = SectionTag.START;
    unixTimestamp = 0;
    sectionName = "";

    constructor(tagType, unixTimestamp, sectionName) {
        this.tagType = tagType;
        this.unixTimestamp = unixTimestamp;
        this.sectionName = sectionName;
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

function cleanupJobLog(rawJobLog) {
    let ansiRegex = /\u001b\[[\d;]*[mK]/g; // does not match all ANSI codes!
    let ansiless = rawJobLog.replace(ansiRegex, "");

    let lineSeparated = ansiless.replaceAll('\r', '\n');
    return lineSeparated;
}

function parseJobLog(cleanJobLog) {
    // Pick out section tags
    let lines = cleanJobLog.split('\n');
    let sectionRegex = /^section_(start|end):\d+:/i;
    let stringSections = [];
    for(const line of lines) {
        if(sectionRegex.test(line)) {
            stringSections.push(line);
        }
    }

    // Put them in SectionTags
    let sectionTags = [];
    for(const section of stringSections) {
        let splitSection = section.split(':');

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

        sectionTags.push(new SectionTag(newTagType, newUnixTimestamp, newSectionName));
    }
    return sectionTags;
}

function calculateTimes(sectionTags) {
    // A simple section times data structure;
    // array of tuples (section_name, time_in_seconds)

    let sectionTimes = [];
    // For now we'll trust that a section ends before another one starts
    let tagOpenedFlag = false;
    for(const tag of sectionTags) {
        if(tagOpenedFlag) {
            let newTime = tag.unixTimestamp - startTagTime;
            sectionTimes.push([tag.sectionName, newTime]);
            tagOpenedFlag = false;
        } else {
            var startTagTime = tag.unixTimestamp;
            tagOpenedFlag = true;
        }
    }
    
    // In the future, this could be ran while the CI still runs. Might want to add 'not finished yet' to a section
    return sectionTimes;
}

function visualize(parentElement, sectionTimes) {
    // as in minimum width%
    // inputting a value > 100/sectionTimes.length is a bad idea
    let minimumWidth = 5; 


    let overallTimeSum = 0;
    for(const section of sectionTimes) {
        overallTimeSum += section[1];
    }


    // Get true percentages of time taken and attach them to sectionTimes, and
    // determine the surplus of percentages
    let surplus = 0;
    let nonMinimumTimes = 0;
    for(const section of sectionTimes) {
        let truePercent;
        if(section[1] == 0) {
            truePercent = 0;
        } else {
            truePercent = (section[1] / overallTimeSum).toPrecision(2) * 100;
        }

        if(truePercent < minimumWidth) {
            surplus += minimumWidth - truePercent;
        } else if (truePercent > minimumWidth) {
            nonMinimumTimes += 1;
        }

        section.push(truePercent);
    }

    // Subtract the surplus equally from all non-minimum times, and
    // create the UI
    let equalizationValue = (surplus / nonMinimumTimes).toPrecision(2);
    for(const section of sectionTimes) {
        let uiPercent = section[2];
        if(uiPercent <= minimumWidth) {
            uiPercent = minimumWidth;
        } else {
            uiPercent -= equalizationValue;
        }

        parentElement.appendChild(createSectionDiv(section[0], uiPercent));
    }


}

function createSectionDiv(name, percent) {
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

export {getJobLog, getJobLogFromAPI, cleanupJobLog, parseJobLog, calculateTimes, visualize}