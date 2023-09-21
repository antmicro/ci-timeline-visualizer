import {getLogFromFile, getLogFromAPI} from "./modules/fetch-log.js"
import {removeAnsi, parseJobLog, updateSections} from "./modules/parse.js";
import { GUI } from "./modules/GUI.js";
import { State } from "./modules/global-state.js";


let jobLog = getLogFromFile("test/sample-logs/log1.txt");
console.log(jobLog);
let jobLogClean = removeAnsi(jobLog);
console.log(jobLogClean);
let sectionTags = parseJobLog(jobLogClean);
console.log(sectionTags)
updateSections(sectionTags);
console.log(State.instance().sections);

let gui = new GUI(document.getElementById("ci-timeline-visualizer"), 2);
gui.initialize(State.instance().sections);
