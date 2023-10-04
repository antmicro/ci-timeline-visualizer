import { getLogFromFile, getLogFromAPI } from "./modules/fetch-log.js"
import { Parser } from "./modules/Parser.js";
import { GUI } from "./modules/GUI.js";
import { State } from "./modules/global-state.js";

// Find an existing or create a new ci-timeline-visualizer div
const visualizerDivId = "ci-timeline-visualizer";
let visualizerDiv = document.getElementById(visualizerDivId);
if(visualizerDiv == null) {
    let buildPage = document.getElementsByClassName("build-page")[0];
    let buildTraceContainer = buildPage.getElementsByClassName("build-trace-container")[0];

    visualizerDiv = document.createElement("div");
    visualizerDiv.id = visualizerDivId;

    buildPage.insertBefore(visualizerDiv, buildTraceContainer);
}
