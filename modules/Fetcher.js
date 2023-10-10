export class Fetcher {
    logURL;

    isPolling = false;
    pollMillis = 1000;
    basePollMillis = 1000; //Will be moved to config
    failedPolls = 0;
    backoffStart = 5; //Will be moved to config
    backoffMax = 5; //Will be moved to config

    listener = null;

    lastReceivedByte = 0;
    bufferedLine = "";
    outputReady = "";

    ignoreResponseFirstByte = false;

    constructor() {
        this.logURL = new URL(window.location.href);
        this.logURL.pathname = this.logURL.pathname + "/raw";
    }

    startPolling() {
        this.isPolling = true;
        this.poll();
    }

    stopPolling() {
        this.isPolling = false;
    }

    async poll() {
        while (this.isPolling) {
            this.fetch();
            await new Promise(r => setTimeout(r, this.pollMillis));
        }
    }

    fetch() {
        let request = new XMLHttpRequest();
        request.open('GET', this.logURL);
        request.withCredentials = true;
        request.setRequestHeader("Range", `bytes=${this.lastReceivedByte}-`);

        request.onloadend = () => { this.handleLoadEnd(request) };

        request.send();
    }

    handleLoadEnd(request) {
        switch (request.status) {
            case 206:
                this.onReceived(request);
                break;
            case 416:
                this.onFailed();
                break;
            default:
                this.onFailed();
                break;
        }
    }

    onReceived(request) {
        this.pollMillis = this.basePollMillis;
        this.failedPolls = 0;

        let contentRange = this.#parseContentRange(request.getResponseHeader("Content-Range"));

        // if there are no new bytes
        if (this.lastReceivedByte == contentRange[1]) {
            return;
        }

        this.lastReceivedByte = contentRange[1];

        let response = request.response;
        // For some reason XMLHttpRequest returns the response with an additional newline appended when
        // the responseType is 'text'. Since the literal HTTP response is needed, it will be stripped.
        response = response.substring(0, response.length - 1);
        // We have to ignore the first byte of the response after the first poll, because it has already been fetched.
        if (this.ignoreResponseFirstByte) {
            response = response.substring(1);
        }

        let combinedBuffer = this.outputReady + this.bufferedLine + response;

        // We start the lineBuffer at the next character after the last newline
        let lineBufferStart = combinedBuffer.lastIndexOf("\n") + 1;

        if (lineBufferStart == -1) { // If there is no newline
            this.outputReady = "";
            this.bufferedLine = combinedBuffer;
        } else if (lineBufferStart > combinedBuffer.length - 1) { // If newline is the last character
            this.outputReady = combinedBuffer;
            this.bufferedLine = "";
        } else {
            this.outputReady = combinedBuffer.substring(0, lineBufferStart);
            this.bufferedLine = combinedBuffer.substring(lineBufferStart);
        }

        this.ignoreResponseFirstByte = true;
        this.notify();
    }

    onFailed() {
        this.failedPolls += 1;
        console.log(`[ci-timeline-visualizer] Encountered job fetching network error. ` +
                    `This is the ${this.failedPolls}. failed poll since a success.`);
        let exponentialBackoffMultiplier = 2 ** Math.min(Math.max(0, this.failedPolls - this.backoffStart), this.backoffMax)
        this.pollMillis = this.basePollMillis * exponentialBackoffMultiplier;
    }

    setListener(listener) {
        this.listener = listener
    }

    clearListener() {
        this.listener = null;
    }

    notify() {
        if (this.listener == null) {
            return;
        }
        this.listener(this.getData());
    }

    getData() {
        let result = this.outputReady;
        this.outputReady = "";
        return result;
    }

    #parseContentRange(contentRange) {
        if (contentRange == null) {
            return [0, 0, 0];
        }

        //example: bytes 0-1023/2048
        let data = contentRange.split(" ")[1];
        let rangeAndMax = data.split("/");
        let startAndEnd = rangeAndMax[0].split("-")

        let start = startAndEnd[0];
        let end = startAndEnd[1];
        let max = rangeAndMax[1];

        return [parseInt(start), parseInt(end), parseInt(max)];
    }
}