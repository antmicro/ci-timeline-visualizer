//Every log fetch should be async in the future!
export function getLogFromFile(filename) { //reads from file
    let logSource = new XMLHttpRequest();
    logSource.open('GET', filename, false);

    // logSource.onreadystatechange = () => {
    //     if (logSource.readyState === XMLHttpRequest.DONE) {
    //         alert(logSource.responseText);
    //     }
    // }
    logSource.send();
    return logSource.responseText;
}

export function getLogFromAPI(personal_access_token, project_id, job_id) {
    let baseURL = new URL("/", window.location.href);
    let apiCallURL = new URL(`/api/v4/projects/${project_id}/jobs/${job_id}/trace`, baseURL);

    let apiCall = new XMLHttpRequest();
    apiCall.open('GET', apiCallURL, false);
    apiCall.setRequestHeader("PRIVATE-TOKEN", personal_access_token);
    apiCall.send();
    return apiCall.responseText;
}