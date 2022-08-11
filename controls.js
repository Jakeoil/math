import { norm } from "./point.js";
import { penrose } from "./penrose.js";

class Cookie {
    constructor() {}
    getShapeMode(sm) {
        const cookie = getCookie("shape-mode");
        if (cookie) {
            return cookie;
        }
        return sm;
    }
    setShapeMode(sm) {
        setCookie("shape-mode", sm, { "max-age": 3600 });
    }

    getActiveButtonIndex(index) {
        const cookie = getCookie("active-button-index");
        if (cookie) {
            return cookie;
        }
        return index;
    }
    setActiveButtonIndex(index) {
        setCookie("active-button-index", index, { "max-age": 3600 });
    }

    getFifths(fifths) {
        return fifths;
    }
    getIsDown(isDown) {
        return isDown;
    }
    getTypeIndex(index) {
        return index;
    }
    setFifths(fifths) {}
    setIsDown(isDown) {}
    setTypeIndex(index) {}
}
// The cookie interface
export const cookie = new Cookie();

/**********************************************************************
 * Shape colors control for the DOM.
 * Contains a mapping of id to entry,
 * entry: {ele, color, defaultColor}
 * Todo: Move this to a module.
 * But first try to put the onClice and listener logic
 *
 */
export class ShapeColors {
    constructor(app) {
        this.app = app;
        this.idList = {
            "p5-color": { defaultColor: penrose.Pe5.defaultColor },
            "p3-color": { defaultColor: penrose.Pe3.defaultColor },
            "p1-color": { defaultColor: penrose.Pe1.defaultColor },
            "star-color": { defaultColor: penrose.St5.defaultColor },
            "boat-color": { defaultColor: penrose.St3.defaultColor },
            "diamond-color": { defaultColor: penrose.St1.defaultColor },
        };
        const shapeColorEles = document.querySelectorAll(".shape-color");
        for (const ele of shapeColorEles) {
            const entry = this.idList[ele.id];
            if (entry) {
                entry.ele = ele;
                entry.ele.addEventListener(
                    "input",
                    this.onShapeColorsInput.bind(this),
                    false
                );
                entry.ele.addEventListener(
                    "change",
                    this.onShapeColorsChange.bind(this),
                    false
                );
            } else {
                console.log(`Undefined id: ${ele.id} in html`);
            }
        }
        const reset_ele = document.querySelector("#color-reset");

        if (reset_ele)
            reset_ele.addEventListener(
                "click",
                this.onColorReset.bind(this),
                false
            );
        this.reset();
    }

    /**
     * Set the elements to the last value received
     */
    refresh() {
        for (const entry of Object.values(this.idList)) {
            if (entry.ele) entry.ele.value = entry.color;
        }
    }

    /**
     * Set the elements to their defaults
     */
    reset() {
        for (const entry of Object.values(this.idList)) {
            entry.color = entry.defaultColor;
        }
    }

    onShapeColorsInput(event) {
        console.log(
            `input: id: ${event.target.id}, color: ${event.target.value}`
        );
        this.idList[event.target.id].color = event.target.value;
        this.refresh();
        this.app();
    }

    onShapeColorsChange(event) {
        console.log(
            `change: id: ${event.target.id}, color: ${event.target.value}`
        );
        this.idList[event.target.id].color = event.target.value;
        this.refresh();
        this.app();
    }
    // The reset button was clicked.
    onColorReset() {
        this.reset();
        this.refresh();
        this.app();
    }
}

/**
 * A clustered set of globals
 * Cannot say whether it was a good idea to cluster them
 * Added cookie handling
 */
export class Controls {
    constructor(app, fifths, typeIndex, isDown) {
        this.app = app;
        this.eleFifths = document.querySelector("#fifths");
        if (this.eleFifths)
            this.eleFifths.addEventListener(
                "click",
                this.clickFifths.bind(this),
                false
            );
        else console.log(`no eleFifths!`);

        this.eleType = document.querySelector("#type");
        this.eleIsDown = document.querySelector("#isDown");

        if (this.eleType)
            this.eleType.addEventListener(
                "click",
                this.clickType.bind(this),
                false
            );
        else console.log(`no eleType!`);

        if (this.eleIsDown)
            this.eleIsDown.addEventListener(
                "click",
                this.clickIsDown.bind(this),
                false
            );
        else console.log(`no eleDown!`);

        this.fifths = fifths;
        this.typeIndex = typeIndex;
        this.isDown = isDown;
        this.fifths = cookie.getFifths(fifths);
        this.typeIndex = cookie.getTypeIndex(typeIndex);
        this.isDown = cookie.getIsDown(isDown);
    }
    bumpFifths() {
        this.fifths = norm(this.fifths + 1);
        cookie.setFifths(this.fifths);
    }

    get typeName() {
        return this.typeList[this.typeIndex].name;
    }
    bumpType() {
        this.typeIndex = (this.typeIndex + 1) % this.typeList.length;
        cookie.setTypeIndex(this.typeIndex);
    }
    get direction() {
        return this.isDown ? "Down" : "Up";
    }
    toggleDirection() {
        this.isDown = !this.isDown;
        cookie.setIsDown(this.isDown);
    }

    // eww, should add the decagon?
    typeList = [
        penrose.Pe1,
        penrose.Pe3,
        penrose.Pe5,
        penrose.St1,
        penrose.St3,
        penrose.St5,
    ];
    reset() {}
    refresh() {
        if (this.eleFifths) this.eleFifths.innerHTML = `fifths: ${this.fifths}`;
        if (this.eleType) this.eleType.innerHTML = this.typeName;
        if (this.eleIsDown) this.eleIsDown.innerHTML = this.direction;
    }
    /**
     * Initialization and
     * Events for the three buttons
     */
    clickFifths() {
        this.bumpFifths();
        this.eleFifths.innerHTML = `fifths: ${this.fifths}`;
        this.app();
    }

    clickType() {
        this.bumpType();
        this.eleType.innerHTML = this.typeName;
        this.app();
    }

    clickIsDown() {
        this.toggleDirection();
        this.eleIsDown.innerHTML = this.direction;
        this.app();
    }
}

const MODE_MOSAIC = "mosaic";
const MODE_QUADRILLE = "quadrille";
export const MODE_REAL = "real";
const MODE_LIST = [MODE_MOSAIC, MODE_QUADRILLE, MODE_REAL];

export class ShapeMode {
    constructor(app) {
        this.app = app;
        this.eleMode = document.querySelector("#shape-mode");
        this.reset();
        if (this.eleMode)
            this.eleMode.addEventListener(
                "click",
                this.clickMode.bind(this),
                false
            );
    }
    refresh() {
        if (this.eleMode) this.eleMode.innerHTML = this.shapeMode;
    }
    reset() {
        this.shapeMode = cookie.getShapeMode(MODE_MOSAIC);
    }
    clickMode() {
        let new_idx =
            (MODE_LIST.indexOf(this.shapeMode) + 1) % MODE_LIST.length;
        this.shapeMode = MODE_LIST[new_idx];
        cookie.setShapeMode(this.shapeMode);
        this.refresh();
        this.app();
    }
}
/**
 * cookie logic from  https://javascript.info/cookie
 * @param {*} name
 * @returns
 */
// returns the cookie with the given name,
// or undefined if not found
function getCookie(name) {
    let matches = document.cookie.match(
        new RegExp(
            "(?:^|; )" +
                name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
                "=([^;]*)"
        )
    );
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Good option is {"max-age": 3600}  // one hour
function setCookie(name, value, options = {}) {
    options = {
        path: "/",
        SameSite: "strict",
        // add other defaults here if necessary
        ...options,
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie =
        encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }

    document.cookie = updatedCookie;
}
function deleteCookie(name) {
    setCookie(name, "", {
        "max-age": -1,
    });
}
