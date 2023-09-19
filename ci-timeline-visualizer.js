import {getLogFromFile, getLogFromAPI} from "./modules/fetch-log.js"
import {removeAnsi, parseJobLog, convertToSections} from "./modules/parse.js";
import {visualize, createSectionDiv} from "./modules/visualize.js";


let jobLog = getLogFromFile("test/sample-logs/log1.txt");
console.log(jobLog);
let jobLogClean = removeAnsi(jobLog);
console.log(jobLogClean);
let sectionTags = parseJobLog(jobLogClean);
console.log(sectionTags)
let sections = convertToSections(sectionTags);
console.log(sections);

visualize(document.getElementById("ci-timeline-visualizer"), sections);