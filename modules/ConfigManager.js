import {config as customConfig} from '../custom-config.js';

const defaultConfig = {
    "distrustRunnerTime": true,
    "URLs": {
        "rootResolveMode": "auto",
        "rootGuesses": ["git", "gitlab-instance"],
        "gitlabRoot": "/",
        "currentJobURL": window.location.href
    },
    "Loader": {
        "visualizerDivId": "ci-timeline-visualizer",
        "requiredElements": "detect",
        "defaultRequiredElements": "post-14.4"
    },
    "Fetcher": {
        "basePollMillis": 1000,
        "backoffBase": 2,
        "backoffStart": 5,
        "backoffMax": 5
    },
    "GUI": {
        "minWidth": 2,
        "pollMillis": 1000,
        "scrollBehavior": "auto"
    },
    "colorGenerator": {
        "colorParameters": {
            "minSaturation": 60,
            "maxSaturation": 100,
            "minLightness": 40,
            "maxLightness": 80,
            "minDistance": 0.2,
            "distanceWeights": [1, 0.3, 0.3],
            "maxNonCollidingAttempts": 1000
        },
        "presetColors": {
            "prepare_executor": [276, 10, 20],
            "build_script": [191, 46, 82],
            "download_artifacts": [4, 76, 56]
        }
    }
}

export class ConfigManager {
    static #savedConfig

    constructor() {}

    static get config() {
        if (ConfigManager.#savedConfig == null) {
            ConfigManager.#savedConfig = {};
            Object.assign(ConfigManager.#savedConfig, defaultConfig);
            ConfigManager.#mergeConfig(ConfigManager.#savedConfig, customConfig);
        }
        return ConfigManager.#savedConfig;
    }

    static set config(newConfig) {
        ConfigManager.#savedConfig = newConfig;
    }

    // This is a deep merge of configurations
    // It is needed because the configuration is structured, and
    // Object.assign() is a shallow merge
    static #mergeConfig(target, ...sources) {
        if (sources.length == 0)
            return target;

        const source = sources.shift();

        if (ConfigManager.#isObject(target) && ConfigManager.#isObject(source)) {
            for (const key in source) {
                if (ConfigManager.#isObject(source[key])) {
                    if (target[key] == null)
                        Object.assign(target, {[key]: {}});
                    ConfigManager.#mergeConfig(target[key], source[key]);
                } else {
                    Object.assign(target, {[key]: source[key]});
                }
            }
        }

        return ConfigManager.#mergeConfig(target, ...sources);
    }

    static #isObject(item) {
        if (typeof item === "object" && !Array.isArray(item))
            return true;
        return false;
    }
}
