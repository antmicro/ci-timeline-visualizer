
// This is a section_name: HSL() map.

export class HSL {
    hue = 0;
    saturation = 0;
    lightness = 0;
    alpha = 1;

    constructor(hue, saturation, lightness) {
        this.hue = hue;
        this.saturation = saturation;
        this.lightness = lightness;
    }

    set hue(value) {
        this.hue = value % 360;
    }

    toCSS() {
        return `hsl(${this.hue}deg ${this.saturation}% ${this.lightness}% / ${this.alpha})`
    }
}

const knownColors = new Map();
knownColors.set("prepare_executor", new HSL(276, 10, 20));
knownColors.set("build_script", new HSL(191, 46, 82));
knownColors.set("download_artifacts", new HSL(4, 76, 56));

export class ColorGenerator {

    static colorParameters = {
        minSaturation: 60,
        maxSaturation: 100,
        minLightness: 40,
        maxLightness: 80,
        minDistance: 0.2,
        maxNonCollidingAttempts: 1000
    }

    static getSectionColor(sectionName, colorList) {
        let newColor = knownColors.get(sectionName);

        if (newColor == null) {
            newColor = ColorGenerator.getSeededDistantRandomColor(sectionName, colorList);
        }
        return newColor;
    }

    // Find a random color recognizable by humans and
    // seeded so that the same section name yields the same color
    static getSeededDistantRandomColor(sectionName, colorList) {
        let seed = 0;
        for (const char of sectionName) {
            seed += char.charCodeAt(0);
        }

        let newHSL;
        let attempts = 0;
        do {
            let newHue = ColorGenerator.mulberry32(seed) * 360;
            let newSaturation = ColorGenerator.lerp(ColorGenerator.mulberry32(seed+1),
                                                    ColorGenerator.colorParameters.minSaturation,
                                                    ColorGenerator.colorParameters.maxSaturation);
            let newLightness = ColorGenerator.lerp(ColorGenerator.mulberry32(seed+2),
                                                ColorGenerator.colorParameters.minLightness,
                                                ColorGenerator.colorParameters.maxLightness);


            newHSL = new HSL(newHue, newSaturation, newLightness);
            seed += 1;
            attempts += 1;
        } while (this.colorCollisionCheck(newHSL, colorList) && attempts < this.colorParameters.maxNonCollidingAttempts)

        return newHSL;
    }

    static colorCollisionCheck(color, colorList) {
        for (const existingColor of colorList) {
            if (this.getColorDistance(color, existingColor) < ColorGenerator.colorParameters.minDistance)
                return true;
        }
        return false;
    }

    static getColorDistance(color1, color2) {
        let componentDistances = [0, 0, 0]; // [angleDistance, saturationDistance, lightnessDistance]

        // Find the shortest distance between azimuth one and azimuth two
        componentDistances[0] = Math.min(Math.abs(color1.hue - color2.hue), (Math.abs(color1.hue - (360 + color2.hue)) % 360));
        componentDistances[1] = Math.abs(color1.saturation - color2.saturation);
        componentDistances[2] = Math.abs(color1.lightness - color2.lightness);

        componentDistances[0] = this.normalizeValue(componentDistances[0], 0, 180);
        componentDistances[1] = this.normalizeValue(componentDistances[1], 0, 100);
        componentDistances[2] = this.normalizeValue(componentDistances[2], 0, 100);

        let weights = [1, 0.3, 0.3];

        let resultDistance = 0;
        for (const i in componentDistances) {
            resultDistance += componentDistances[i] * weights[i];
        }
        return resultDistance;
    }

    static normalizeValue(val, min, max) {
        return (val - min) / (max - min);
    }

    static lerp(val, min, max) {
        return val * (max - min) + min;
    }

    // This is a simple pseudo-random number generator.
    // Used to generate a seeded random number.
    static mulberry32(seed) {
        var t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}