export class GitlabAPI {
    gitlabURL;
    projectPath;
    jobId;

    static commonInstanceRoots = [
        'git',
        'gitlab-instance'
    ]

    constructor(jobPageURL) {
        this.gitlabURL = new URL('/', jobPageURL);
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
        let pathname = new URL(jobPageURL).pathname;

        // /?(project-path-capture-group)/-/jobs/(job-id-capture-group)/?.*
        let extractorRegex = /\/?(.*)\/-\/jobs\/(\d*)\/?.*/;
        let regexResult = extractorRegex.exec(pathname);

        let splitURLPath = regexResult[1].split('/');
        let projectPath = [];
        while(splitURLPath.length > 0) {
            let considered = splitURLPath.pop();
            if(GitlabAPI.commonInstanceRoots.includes(considered)) {
                splitURLPath.push(considered);
                this.gitlabURL = new URL(splitURLPath.join('/'), this.gitlabURL)
                break;
            }
            projectPath.unshift(considered);
        }

        projectPath = encodeURIComponent(projectPath.join('/'));
        let jobId = regexResult[2];

        return [projectPath, jobId];
    }
}