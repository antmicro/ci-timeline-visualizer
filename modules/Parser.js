import { SectionTag, Section } from "./classes.js";
import { State } from "./global-state.js";

export class Parser {
    lastLineParsed = 0;

    parse(rawJobLog) {
        let cleanJobLog = this.removeAnsi(rawJobLog);
        let sectionTags = this.parseJobLog(cleanJobLog);
        this.updateSections(sectionTags);
    }

    removeAnsi(rawJobLog) {
        let ansiRegex = /\u001b\[[\d;]*[mK]/g; // does not match all ANSI codes!
        let ansiless = rawJobLog.replace(ansiRegex, "");

        return ansiless;
    }

    parseJobLog(cleanJobLog) {
        // Pick out section tags
        let lines = cleanJobLog.split('\n');
        let sectionRegex = /^section_(start|end):\d+:/i;
        let stringSections = [];
        for (const i in lines) {
            if (sectionRegex.test(lines[i])) {
                let separateSections = lines[i].split('\r');
                for (const section of separateSections) {
                    if (sectionRegex.test(section))
                        stringSections.push([section, Number(i) + 1]);
                }
            }
        }

        // Put them in SectionTags
        let sectionTags = [];
        for (const section of stringSections) {
            let splitSection = section[0].split(':');

            let newTagType;
            switch (splitSection[0]) {
                case 'section_start':
                    newTagType = SectionTag.START;
                    break;
                case 'section_end':
                    newTagType = SectionTag.STOP;
                    break;
            }

            let newUnixTimestamp = Number(splitSection[1])

            let newSectionName = splitSection[2];

            sectionTags.push(new SectionTag(newTagType, newUnixTimestamp, newSectionName, section[1] + this.lastLineParsed));
        }

        this.lastLineParsed = lines.length;
        return sectionTags;
    }

    updateSections(newTags) {
        let sections = State.instance().sections;
        let lastSection = sections[sections.length - 1];

        let isOpen = false;
        if (lastSection != null)
            isOpen = lastSection.isOpen;
        // If there is a tag after the opening tag, it should be a closing tag.
        // This might not be the case if subsections were to be implemented.
        for (const tag of newTags) {
            if (isOpen) {
                lastSection.closeSection(tag);
                isOpen = false;
            } else {
                let newSection = Section.openNewSection(tag);

                sections.push(newSection);
                lastSection = newSection;
                isOpen = true;
            }
        }
        //TODO: update visualization on any updates
    }
}