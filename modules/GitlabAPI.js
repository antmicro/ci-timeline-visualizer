import { ConfigManager } from "./ConfigManager.js";

export class GitlabAPI {
    gitlabURL;
    projectPath;
    jobId;


    constructor(jobPageURL) {
        this.gitlabURL = new URL('/', jobPageURL);
        this.relocateJob(jobPageURL);
    }

    relocateJob(jobPageURL) {
        [this.projectPath, this.jobId] = this.#parseJobURL(jobPageURL);
    }

    getJobData(callback) {
        let requestURL = new URL(`${this.gitlabURL.pathname}api/v4/projects/${this.projectPath}/jobs/${this.jobId}`, this.gitlabURL.origin);
        let xhr = new XMLHttpRequest();
        xhr.open('GET', requestURL);
        xhr.withCredentials = true;
        xhr.responseType = "json";

        xhr.onload = () => {
            switch(xhr.status) {
                case 200:
                    break;
                case 401:
                    console.log('[ci-timeline-visualizer] You need to be authorized to get job data');
                    callback(null);
                    return;
                case 404:
                    this.#handleNotFound(requestURL);
                default:
                    callback(null);
                    return;
            }
            callback(xhr.response)
        };
        xhr.send();
    }

    getVersionData(callback) {
        let requestURL = new URL(`${this.gitlabURL.pathname}api/v4/version`, this.gitlabURL);
        let xhr = new XMLHttpRequest();
        xhr.open('GET', requestURL);
        xhr.withCredentials = true;
        xhr.responseType = "json";

        xhr.onload = () => {
            switch(xhr.status) {
                case 200:
                    break;
                case 401:
                    console.log('[ci-timeline-visualizer] You need to be authorized to get GitLab version data');
                    callback(null);
                    return;
                case 404:
                    this.#handleNotFound(requestURL);
                    callback(null);
                    return;
                default:
                    callback(null);
                    return;
            }
            callback(xhr.response);
        };
        xhr.send();
    }

    #handleNotFound(requestURL) {
        console.log(`[ci-timeline-visualizer] ${requestURL.toString()} returned 404. Are you sure your URLs.gitlabRoot config is set correctly?`);
    }

    #parseJobURL(jobPageURL) {
        let pathname = new URL(jobPageURL).pathname;

        // /?(project-path-capture-group)/-/jobs/(job-id-capture-group)/?.*
        let extractorRegex = /\/?(.*)\/-\/jobs\/(\d*)\/?.*/;
        let regexResult = extractorRegex.exec(pathname);

        let rootResolveMode = ConfigManager.config.URLs["rootResolveMode"];
        let projectPath;
        let jobId;

        if(rootResolveMode === "auto" || rootResolveMode !== "manual") {
            let splitURLPath = regexResult[1].split('/');
            projectPath = [];

            let rootGuesses = ConfigManager.config.URLs["rootGuesses"];
            while(splitURLPath.length > 0) {
                let considered = splitURLPath.pop();
                if(rootGuesses.includes(considered)) {
                    splitURLPath.push(considered);
                    this.gitlabURL = new URL(splitURLPath.join('/') + '/', this.gitlabURL)
                    break;
                }
                projectPath.unshift(considered);
            }

            projectPath = encodeURIComponent(projectPath.join('/'));

        } else if (rootResolveMode === "manual") {
            this.gitlabURL = new URL(ConfigManager.config.URLs["gitlabRoot"], jobPageURL);

            let startIndex = this.gitlabURL.toString().length;
            let stopIndex = jobPageURL.indexOf("/-/");

            let rawProjectPath = jobPageURL.substring(startIndex, stopIndex);

            projectPath = encodeURIComponent(rawProjectPath);
        }

        jobId = regexResult[2];

        return [projectPath, jobId];
    }
}