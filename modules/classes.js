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