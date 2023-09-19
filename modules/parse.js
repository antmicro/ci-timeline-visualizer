import { SectionTag, Section } from "./classes.js";

export function removeAnsi(rawJobLog) {
    let ansiRegex = /\u001b\[[\d;]*[mK]/g; // does not match all ANSI codes!
    let ansiless = rawJobLog.replace(ansiRegex, "");

    return ansiless;
}

export function parseJobLog(cleanJobLog) {
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

export function convertToSections(sectionTags) {
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