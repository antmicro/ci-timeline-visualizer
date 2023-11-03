// Your config here!
// You can find defaults in the modules/ConfigManager.js file.
// Simply override the defaults by providing the new value in the same location in the structure.

export const config = {

}

/*
Configuration values guide:
distrustRunnerTime:
    bool
    TL;DR - turn it on if your runners aren't synchronized to real time.
    Determines how the client get its time for the currently executing section.
    If the runner provides an inaccurate time and GitLab provides an accurate time,
    it is possible to calculate what is the time offset of the runner.
    Next, we can get the time by calculating the difference
    between the first section's start time and GitLab's job API output.
URLs:
    - rootResolveMode
        {'auto' | 'manual'}
        Selects the mode of determining the root of the GitLab instance in the URL. By default it is 'auto'.
        'auto' checks for keywords (specified in the rootGuesses config) in the URL path from the end.
        When it finds a keyword it stops and sets the root to the found position.
        'manual' sets the root to the one specified in the gitlabRoot config
    - rootGuesses
        [<array of guessed root path elements>]
        Auto rootResolveMode grabs values to guess from this array.
        By default it is ["git", "gitlab-instance"].
    - gitlabRoot
        string
        Determines the root of the GitLab instance in the URL. By default it is '/'.
        Your instance might be located somewhere else, for example if your instance is on http://example.com/git/, then
        gitlabRoot value should be '/git/'.
    - currentJobURL
        string
        Determines the complete URL for the job of interest. Most probably it is the current site you're on, therefore
        the default value is the output of 'window.location.href'.
Loader:
    - visualizerDivId
        string
        Determines the HTML id of the visualizer. If there is no element with this id present, it will create
        a new element in the DOM in the 'inside' element and just before the 'before' element.
        Those elements should be defined in requiredElements if you don't place an element with this id.
    - requiredElements
        {'detect' | 'pre-14.4' | 'post-14.4' | <a custom JS object> }
        Makes the Loader wait for elements defined here before starting loading the visualizer.
        Available values: 
            - 'detect':
              Uses the GitLab API to detect the version and set the requiredElements accordingly.
              It only checks if GitLab is pre-14.4 or post-14.4.
            - 'pre-14.4'
              Sets the requiredElements to the CSS class names present before GitLab 14.4.0.
            - 'post-14.4'
              Sets the requiredElements to the CSS class names present after and including GitLab 14.4.0.
            - <a custom JS object>
              Sets the requiredElements to whatever is defined here. Structure of this object should be <string, string>,
              where the second string is a CSS selector. The Loader will wait until ALL of the elements
              are present in the DOM.
              Also make sure that you either define 'inside' and 'before', or have an element in the DOM with the visualizerDivId.
    - defualtRequiredElements
        {'pre-14.4' | 'post-14.4' | <a custom JS object> }
        If the value defined in requiredElements wasn't found (internally, NOT in the dom), this will act as a fallback.
        Make sure to set this to a safe value, otherwise the visualizer might infinitely loop.
Fetcher:
    - basePollMillis
        int
        Determines how often (in milliseconds) the Fetcher polls GitLab's API for any new job log data.
    - backoffBase
        int
        Determines the base value of the exponentiation in the exponential backoff mechanism.
    - backoffStart
        int
        Determines the amount of fetching failures before the exponential backoff mechanism begins.
    - backoffMax
        int
        Determines the maximum value of the exponent in the exponential backoff mechanism.
GUI:
    - minWidth
        0-100%
        Determines the minimum visual width of a section.
        If it is under the minimum, the width is set to this number.
        Defaults to 0 if the number of sections times the minWidth exceeds 100.
    - pollMillis
        int
        Determines how often (in milliseconds) the GUI polls for section data.
        Its default value of 1000 is recommended as when a section is unfinished
        the UI may refresh every second making the timer look natural.
    - scrollBehavior
        {'auto' | 'hterm' | 'none'}
        Determines how the visualizer scrolls to the desired line in the job log, as it is dependent on the log display method.
        If the scrollBehavior is 'auto', then it will attempt to detect hterm. If it can't, it'll default to 'none'.
        If the scrollBehavior is 'hterm', then if the site has an hterm, the hterm will be scrolled.
        If the scrollBehavior is 'none', then scrolling is turned off.
colorGenerator:
    colorParameters:
        - minSaturation
            0-100%
            Determines the minimum value of saturation for randomized colors.
        - maxSaturation
            0-100%
            Determines the maximum value of saturation for randomized colors.
        - minLightness
            0-100%
            Determines the minimum value of lightness for randomized colors.
        - maxLightness
            0-100%
            Determines the maximum value of lightness for randomized colors.
        - minDistance
            0-1
            Determines the minimum distance between the found color and each of already existing colors.
        - distanceWeights
            [0-1, 0-1, 0-1]
            Hue, Saturation, Lightness
            Determines the weight of each component distance in the resulting distance between two colors.
            Essentially it says how important it is for each of the HSL values to be different.
            The larger the weight is, the more important it is for the values to be distant.
        - maxNonCollidingAttempts
            int
            If the randomized color is too close to any of the other colors, the color is rerolled.
            This value determines how many attempts should the color generator take before giving up
            and choosing the current randomized color.
    presetColors:
        This object should contain keys with the name of a section that should have a preset color.
        - {section_name}
            [0-360, 0-100, 0-100]
            Hue, Saturation, Lightness
            The preset color of the section is defined by a 3-tuple value.
*/