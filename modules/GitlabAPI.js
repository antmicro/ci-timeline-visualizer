export class GitlabAPI {
    gitlabURL;
    projectPath;
    jobId;

    constructor(gitlabRoot, jobPageURL) {
        this.gitlabURL = new URL(gitlabRoot, jobPageURL);
        this.relocateJob(jobPageURL);
    }

    relocateJob(jobPageURL) {
        [this.projectPath, this.jobId] = this.#parseJobURL(jobPageURL);
    }

    getJobData(callback) {
        let requestURL = new URL(`${this.gitlabURL.pathname}/api/v4/projects/${this.projectPath}/jobs/${this.jobId}`, this.gitlabURL);
        let xhr = new XMLHttpRequest();
        xhr.open('GET', requestURL);
        xhr.withCredentials = true;
        xhr.responseType = "json";

        xhr.onload = () => {callback(xhr.response)};
        xhr.send();
    }

    #parseJobURL(jobPageURL) {
        let startIndex = this.gitlabURL.toString().length;
        let gitlabResource = jobPageURL.substring(startIndex);

        // /?(project-path-capture-group)/-/jobs/(job-id-capture-group)/?.*
        let extractorRegex = /\/?(.*)\/-\/jobs\/(\d*)\/?.*/;
        let regexResult = extractorRegex.exec(gitlabResource);

        let projectPath = encodeURIComponent(regexResult[1])
        let jobId = regexResult[2];

        return [projectPath, jobId];
    }
}