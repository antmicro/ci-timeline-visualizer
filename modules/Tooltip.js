export class Tooltip {
    tooltipDiv;
    triangle;
    innerTooltip;

    sectionName;
    sectionTime;
    sectionShare;

    constructor() {
        this.tooltipDiv = document.createElement("div");
        this.tooltipDiv.setAttribute("class", "tooltip");

        this.triangle = document.createElement("div");
        this.triangle.setAttribute("class", "triangle");

        this.innerTooltip = document.createElement("div");
        this.innerTooltip.setAttribute("class", "inner-tooltip");

        this.sectionName = document.createElement("span");
        this.sectionName.setAttribute("class", "section-name");

        this.sectionTime = document.createElement("span");
        this.sectionTime.setAttribute("class", "section-time");

        this.sectionShare = document.createElement("span");
        this.sectionShare.setAttribute("class", "section-share");

        this.innerTooltip.appendChild(this.sectionName);
        this.innerTooltip.appendChild(document.createElement("br"));
        this.innerTooltip.appendChild(this.sectionTime);
        this.innerTooltip.appendChild(document.createElement("br"));
        this.innerTooltip.appendChild(this.sectionShare);

        this.tooltipDiv.appendChild(this.triangle);
        this.tooltipDiv.appendChild(this.innerTooltip);
    }
    
    update(name, duration, share) {
        this.sectionName.innerText = name;

        let times = [0, 0, 0]; // [hours, minutes, seconds]
        times[0] = Math.floor(duration/3600);
        times[1] = Math.floor((duration - times[0]*3600)/60);
        times[2] = duration - times[0]*3600 - times[1]*60;
        times = times.map((time) => String(time).padStart(2, '0'));
        this.sectionTime.innerText = times.join(":");

        this.sectionShare.innerText = Number(share).toFixed(2) + "%";
    }
}