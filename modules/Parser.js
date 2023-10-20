import { SectionTag } from "./classes.js";

export class Parser {
    lastLineParsed = 0;

    listener = null;
    #bufferedSectionTags = [];

    notify() {
        if (this.listener == null)
            return;
        this.listener(this.getSectionTags());
    }

    getSectionTags() {
        let returned = this.#bufferedSectionTags;
        this.#bufferedSectionTags = [];
        return returned;
    }

    parse(rawJobLog) {
        let cleanJobLog = this.removeAnsi(rawJobLog);
        let newSectionTags = this.parseJobLog(cleanJobLog);
        this.#bufferedSectionTags = this.#bufferedSectionTags.concat(newSectionTags);
        this.notify();
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
}