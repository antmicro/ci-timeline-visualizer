# ci-timeline-visualizer

ci-timeline-visualizer is an extension for GitLab's job logs to visualize the elapsed time of execution for each of their stages.

## Running

`ci-timeline-visualizer.js` is a ES6 module, but the repository includes an `index.html` for demonstrational purposes.

Modules only work via HTTP, so you should use a local web server, such as:
* Live Server, a VSCode extension
* Node static server (not tested)
* Node live server (not tested)

If you try to run it locally (`file://`), you will be met with a CORS policy error.

Currently the module loads a job log from the `joblogoutput.txt` file for demonstrational purposes.