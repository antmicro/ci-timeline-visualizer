import { Tooltip } from "./Tooltip.js";
import { HSL } from "./ColorGenerator.js";

export class UISection {
    sectionDiv;

    color;
    borderColor;
    tooltip;

    constructor() {
        this.sectionDiv = document.createElement("div");
        this.sectionDiv.setAttribute("class", "section");

        this.tooltip = new Tooltip();
        this.sectionDiv.appendChild(this.tooltip.tooltipDiv);

        this.sectionDiv.addEventListener("mouseover", (e) => { this.tooltip.show(e) });
        this.sectionDiv.addEventListener("mouseout", (e) => { this.tooltip.hide(e) });
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

    setMiddle() {
        this.sectionDiv.classList.remove("leftmost");
        this.sectionDiv.classList.remove("rightmost");
    }

    setColor(color) {
        this.color = color;
        this.sectionDiv.style["background-color"] = this.color.toCSS();
        this.borderColor = new HSL(color.hue, color.saturation, color.lightness);

        this.borderColor.saturation = Math.max(this.borderColor.saturation - 10, 0);
        this.borderColor.lightness = Math.max(this.borderColor.lightness - 5, 0);
        
        this.sectionDiv.style["border-color"] = this.borderColor.toCSS();
    }
}