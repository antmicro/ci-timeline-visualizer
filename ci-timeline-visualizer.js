import {getLogFromFile, getLogFromAPI} from "./modules/fetch-log.js"
import {Parser} from "./modules/Parser.js";
import { GUI } from "./modules/GUI.js";
import { State } from "./modules/global-state.js";


let parser = new Parser();

let unfinishedJobLog = getLogFromFile("test/sample-logs/unfinished-log1.txt");
//console.log(unfinishedJobLog);
parser.parse(unfinishedJobLog);
console.log(State.instance().sections);


let gui = new GUI(document.getElementById("ci-timeline-visualizer"), 2);
gui.update(State.instance().sections);

await new Promise(r => setTimeout(r, 3000));

let jobLog = getLogFromFile("test/sample-logs/unfinished-log1-rest.txt");
//console.log(jobLog);
parser.parse(jobLog);
console.log(State.instance().sections);



gui.update(State.instance().sections);