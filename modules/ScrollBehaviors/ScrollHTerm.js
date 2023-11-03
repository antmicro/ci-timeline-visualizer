import { ScrollBehavior } from "./ScrollBehavior.js";

export class ScrollHTerm extends ScrollBehavior {
    htermScreen = null;

    constructor() {
        super();
    }

    scrollTo(lineNumber) {
        if (this.htermScreen == null) {
            this.htermScreen = document.getElementById("hterm")
                            .getElementsByTagName("iframe")[0]
                            .contentWindow.document
                            .getElementsByTagName("x-screen")[0];
        }

        // Grab the line-height style using the first x-row's style as an example
        let rowStyle = getComputedStyle(this.htermScreen.getElementsByTagName("x-row")[0]);
        let lineHeight = rowStyle.getPropertyValue("line-height");
        lineHeight = parseInt(lineHeight);
        // Scroll the top of the target line to the top
        // This automatically clamps the value in case you try to scroll further down or up than you should
        this.htermScreen.scrollTop = (lineNumber - 1) * lineHeight;
    }
}