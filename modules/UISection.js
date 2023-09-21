import { Tooltip } from "./Tooltip.js";

export class UISection {
    sectionDiv;

    tooltip;

    constructor() {
        this.sectionDiv = document.createElement("div");
        this.sectionDiv.setAttribute("class", "section");

        this.tooltip = new Tooltip();
        this.sectionDiv.appendChild(this.tooltip.tooltipDiv);
    }

    update(name, duration, truePercent, uiPercent) {
        this.sectionDiv.setAttribute("style", "width: " + uiPercent + "%");
        this.tooltip.update(name, duration, truePercent);
    }
}