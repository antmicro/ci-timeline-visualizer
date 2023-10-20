# ci-timeline-visualizer

ci-timeline-visualizer is an extension for GitLab's job logs to visualize the elapsed time of execution for each of their stages.

## Usage

### Dependencies

Run `npm install`

### Configuring

If you need or want to configure the visualizer, you should do that in the
`custom-config.js` file located in the root of the project. It's an ES6 module with a single exported JavaScript object - this way the config will be embedded in the built files, keeping their amount to a minimum.

The file contains documentation explaining what each of the configurable values do. If you are unsure on how the config structure should look like, take a peek into the `modules/ConfigManager.js` file.

Configurable values you might want to take a look at first:
* `URLs.gitlabRoot` - if your GitLab instance isn't on the root path of the host,

### Building

Run `npm run build`

### Using as a library

Your HTML should include:
* A CSS stylesheet <br>
  `<link rel="stylesheet" type="text/css" href="ci-timeline-visualizer.css">`
* A JavaScript module <br>
  `<script type="module" src="ci-timeline-visualizer.js"></script>`

### Developing

#### Local web server
Modules only work via HTTP, so you should use a local web server.
If you try to run it locally (`file://`), you will be met with a CORS policy error.

`ci-timeline-visualizer.js` is an ES6 module, but the repository includes an `index.html` for local execution purposes.

By default, you should run your server using vite. <br>
This is done by running `npm run dev`.
If you want to test the vite's bundled (already built!) output, run `npm run preview`.

You can use alternatives to vite for the web server, such as:
* Live Server, a VSCode extension
* Node static server (not tested)
* Node live server (not tested)

The injection step assumes that the server is accessible at `http://localhost:5500/`.
If you want or need to change it, you need to:
* Pass additional arguments to the dev or preview server `npm run dev -- --port <new-port>`
* Change the URLs in the injection script below

#### Injection
Make sure you are on the job log page!

The URL should look similar to `example.com/<project-path>/-/jobs/<job-id>`

If you modify the loaded HTML file, the module code won't execute. Because of this, you need to insert the element into the DOM by the DevTools js console. The module additionally uses some CSS of its own that needs to be injected. Just paste the following into the console:
```js
let cssLink = document.createElement("link");
cssLink.href = "http://localhost:5500/ci-timeline-visualizer.css";
cssLink.type = "text/css";
cssLink.rel = "stylesheet";
document.getElementsByTagName("head")[0].appendChild(cssLink);

let scripttag = document.createElement("script");
scripttag.setAttribute("type", "module");
scripttag.setAttribute("src", "http://localhost:5500/ci-timeline-visualizer.js");
document.getElementsByTagName("html")[0].appendChild(scripttag);
```

You might be able to inject the above using an userscript agent (Tampermonkey for example) so that it happens automatically on page refresh. This has not been tested, however.

## GitLab's job log syntax

GitLab uses ANSI escape sequences to format and hide certain text.

Notable ANSI escapes:
```
^[[0K - Erase in Line (EL) - erases from cursor to the end of the line
^[[x;y;m - Select Graphic Rendition (SGR) - sets colors and style of characters following this sequence
^[[0;m - (SGR 0) sets style to none
^[M - Carriage return
```

Notable job log messages:
- Section tag - marks the start or end of a section along with its name and UNIX timestamp <br>
  Syntax: <br>
  `section_{start|end}:{unix_timestamp}:{section_name}^M^[[0K`
- Runner messages - messages such as human-readable section names, ran commands or runner's data: <br>
  Syntax: <br>
  `[EL]{SGR}printed-text{SGR 0}` <br>
  Note: the EL is optional; it doesn't appear on ran command messages (e.g. `^[[32;1m$ sleep 5^[[0;m`)
- Command output - standard output of ran commands - they are printed without modifications.

For some reason GitLab puts an additional SGR 0 sequence at the end of section-tag chains.

Example raw job log output:
```
^[[0KRunning with gitlab-runner 16.3.0 (8ec04662)^[[0;m
^[[0K  on example-runner zbF4zAjwx, system ID: s_18faf34db374^[[0;m
section_start:1694763179:prepare_executor^M^[[0K^[[0K^[[36;1mPreparing the "shell" executor^[[0;m^[[0;m
^[[0KUsing Shell (bash) executor...^[[0;m
section_end:1694763179:prepare_executor^M^[[0Ksection_start:1694763179:prepare_script^M^[[0K^[[0K^[[36;1mPreparing environment^[[0;m^[[0;m
Running on example-runner...
section_end:1694763179:prepare_script^M^[[0Ksection_start:1694763179:get_sources^M^[[0K^[[0K^[[36;1mGetting source from Git repository^[[0;m^[[0;m
^[[32;1mFetching changes with git depth set to 20...^[[0;m
Reinitialized existing Git repository in /home/gitlab-runner/builds/zbF4zAjwx/0/root/test-project/.git/
^[[32;1mChecking out 9aefa86e as detached HEAD (ref is main)...^[[0;m
^[[32;1mSkipping Git submodules setup^[[0;m
section_end:1694763179:get_sources^M^[[0Ksection_start:1694763179:step_script^M^[[0K^[[0K^[[36;1mExecuting "step_script" stage of the job script^[[0;m^[[0;m
^[[32;1m$ echo "before_script1"^[[0;m
before_script1
^[[32;1m$ sleep 5^[[0;m
^[[32;1m$ echo "before_script2"^[[0;m
before_script2
^[[32;1m$ echo "script1"^[[0;m
script1
^[[32;1m$ sleep 2^[[0;m
^[[32;1m$ echo "script2"^[[0;m
script2
section_end:1694763186:step_script^M^[[0Ksection_start:1694763186:after_script^M^[[0K^[[0K^[[36;1mRunning after_script^[[0;m^[[0;m
^[[32;1mRunning after script...^[[0;m
^[[32;1m$ echo "after_script1"^[[0;m
after_script1
^[[32;1m$ sleep 6^[[0;m
^[[32;1m$ echo "after_script2"^[[0;m
after_script2
section_end:1694763192:after_script^M^[[0K^[[32;1mJob succeeded^[[0;m
```
