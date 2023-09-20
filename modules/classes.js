export class SectionTag {
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

export class Section {
    sectionName = "";

    startTimestamp = -1;
    endTimestamp = -1;

    startLine = -1;
    endLine = -1;

    #duration = undefined;
    isOpen = true;

    constructor(sectionName, startTimestamp, endTimestamp, startLine, endLine) {
        this.sectionName = sectionName;
        this.startTimestamp = startTimestamp;
        this.endTimestamp = endTimestamp;
        this.startLine = startLine;
        this.endLine = endLine;

        this.#duration = endTimestamp - startTimestamp;
        this.isOpen = false;
    }

    static fromSectionTags(startTag, endTag) {
        return new Section(startTag.sectionName,
                           startTag.unixTimestamp,
                           endTag.unixTimestamp,
                           startTag.lineNumber,
                           endTag.lineNumber);
    }

    static openNewSection(openingTag) {
        if(openingTag.tagType != SectionTag.START)
            throw new Error("Trying to open a section with a closing tag!");

        let newSection = new Section();

        newSection.sectionName = openingTag.sectionName;
        newSection.startTimestamp = openingTag.unixTimestamp;
        newSection.startLine = openingTag.lineNumber;
        newSection.isOpen = true;

        return newSection;
    }

    closeSection(closingTag) {
        if(closingTag.tagType != SectionTag.STOP)
            throw new Error("Trying to close a section with an opening tag!");

        this.endTimestamp = closingTag.unixTimestamp;
        this.endLine = closingTag.lineNumber;

        this.#duration = this.endTimestamp - this.startTimestamp;
        this.isOpen = false;
    }

    get duration() {
        if(this.isOpen)
            return Math.floor(Date.now() / 1000) - this.startTimestamp;
        return this.#duration;
    }
}