import { Tooltip } from "./Tooltip.js";
import { ColorGenerator } from "./ColorGenerator.js";

export class UISection {
    sectionDiv;

    color;
    tooltip;

    constructor() {
        this.sectionDiv = document.createElement("div");
        this.sectionDiv.setAttribute("class", "section");

        this.tooltip = new Tooltip();
        this.sectionDiv.appendChild(this.tooltip.tooltipDiv);

        this.sectionDiv.addEventListener("mouseover", (e) => {this.tooltip.show(e)});
        this.sectionDiv.addEventListener("mouseout", (e) => {this.tooltip.hide(e)});
    }

    update(name, duration, truePercent, uiPercent) {
        this.sectionDiv.style["width"] = uiPercent + "%";
        this.tooltip.update(name, duration, truePercent);
    }

    setLeftmost() {
        this.sectionDiv.classList.add("leftmost");
    }

    setRightmost() {
        this.sectionDiv.classList.add("rightmost");
    }

    setColor(color) {
        this.color = color;
        this.sectionDiv.style["background-color"] = this.color.toCSS();
    }
}