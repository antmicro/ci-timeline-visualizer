// Your config here!
// You can find defaults in the modules/ConfigManager.js file.
// Simply override the defaults by providing the new value in the same location in the structure.

export const config = {

}

/*
Configuration values guide:
URLs:
    - gitlabRoot
        string
        Determines the root of the GitLab instance in the URL. By default it is '/'.
        Your instance might be located somewhere else, for example if your instance is on http://example.com/git/, then
        gitlabRoot value should be '/git/'.
Loader:
    - visualizerDivId
        string
        Determines the HTML id of the visualizer. If there is no element with this id present, it will create
        a new element in the DOM in the .build-page element just before .build-trace-container
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