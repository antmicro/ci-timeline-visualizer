export class State {
    static #instance;

    static instance() {
        if (State.#instance == null) {
            State.#instance = new State();
        }
        return State.#instance;
    }
    static reset() {
        State.#instance = new State();
    }

    sections = []

    constructor() {
        this.sections = [];
    }
}