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

    update(name, duration, percent, minWidth) {
        this.sectionDiv.style["min-width"] = minWidth + "%";
        this.sectionDiv.style["width"] = percent + "%";
        this.tooltip.update(name, duration, percent);
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

        this.borderColor = new HSL(color.hue, color.saturation, color.lightness);
        this.borderColor.saturation = Math.max(this.borderColor.saturation - 10, 0);
        this.borderColor.lightness = Math.max(this.borderColor.lightness - 5, 0);
        
        this.sectionDiv.style["background-color"] = this.color.toCSS();
        this.sectionDiv.style["border-color"] = this.borderColor.toCSS();
    }

    setOnclick(onclick) {
        this.sectionDiv.onclick = onclick;
        if (onclick == null) {
            this.sectionDiv.style["cursor"] = "auto";
        } else {
            this.sectionDiv.style["cursor"] = "pointer";
        }
    }
}