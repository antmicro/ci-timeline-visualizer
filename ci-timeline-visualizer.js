import {getLogFromFile, getLogFromAPI} from "./modules/fetch-log.js"
import {removeAnsi, parseJobLog, updateSections} from "./modules/parse.js";
import {visualize, createSectionDiv} from "./modules/visualize.js";
import { State } from "./modules/global-state.js";


let jobLog = getLogFromFile("test/sample-logs/log1.txt");
console.log(jobLog);
let jobLogClean = removeAnsi(jobLog);
console.log(jobLogClean);
let sectionTags = parseJobLog(jobLogClean);
console.log(sectionTags)
updateSections(sectionTags);
console.log(State.instance().sections);

visualize(document.getElementById("ci-timeline-visualizer"), State.instance().sections);