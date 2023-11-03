import { ScrollHTerm } from "./ScrollHTerm.js";

export class ScrollBehaviorFactory {

    static fromString(scrollBehaviorName) {
        switch(scrollBehaviorName) {
            case "auto":
                return ScrollBehaviorFactory.detectScrollBehavior()
                break;
            case "hterm":
                return new ScrollHTerm();
                break;
            case "none":
            default:
                return null;
                break;
        }
    }

    static detectScrollBehavior() {
        if(document.getElementById("hterm") != null)
            return ScrollBehaviorFactory.fromString("hterm")
        
        return ScrollBehaviorFactory.fromString("none")
    }

}