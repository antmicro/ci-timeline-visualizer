export class ScrollBehavior {
    constructor() {
        if (this.constructor == ScrollBehavior)
            throw new Error("ScrollBehavior is an abstract class - cannot be instantiated.");
    }

    scrollTo(lineNumber) {
        throw new Error("scroll(lineNumber) must be implemented.");
    }
}