import { norm } from "./point.js";
import { penrose } from "./penrose.js";

/**
 * !!!
 * The cookie has string ties to the controls.
 * It stores some of the control settings statically.
 * Move it to a new module, but not before coming up with a
 * consistant interface, for example, a this.cookie method.
 * or a cookie interface.
 *
 * Suggestion. Make a convention that the cookie name has to match the html
 * element id. But that the value encode and decode must be in the control's
 * class
 *
 */
class Cookie {
    constructor() {}

    get(type, dflt) {
        const cookie = getCookie(type);
        if (cookie) {
            return cookie;
        }
        return dflt;
    }
    set(type, value) {
        setCookie(type, value, { "max-age": 3600 });
    }

    delete(type) {
        deleteCookie(type);
    }
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
// The cookie interface !!! We already found this to be dangerous.
const cookie = new Cookie();

/**********************************************************************
 * Shape colors control for the DOM.
 * Contains a mapping of id to entry,
 * entry: {ele, color, defaultColor}
 */
export class ShapeColors {
    defaultColors = {
        "pe5-color": penrose.Pe5.defaultColor,
        "pe3-color": penrose.Pe3.defaultColor,
        "pe1-color": penrose.Pe1.defaultColor,
        "star-color": penrose.St5.defaultColor,
        "boat-color": penrose.St3.defaultColor,
        "diamond-color": penrose.St1.defaultColor,
    };
    constructor(app) {
        this.app = app;
        this.shapeColorEles = document.querySelectorAll(".shape-color");
        this.reset();

        for (const ele of this.shapeColorEles) {
            const entry = this.shapeColors[ele.id];
            if (entry) {
                ele.addEventListener(
                    "input",
                    this.onShapeColorsInput.bind(this),
                    false
                );
                ele.addEventListener(
                    "change",
                    this.onShapeColorsChange.bind(this),
                    false
                );
            } else {
                console.log(`unsupported id: ${ele.id} in shape-color class`);
            }
        }

        this.reset_ele = document.querySelector("#color-reset");
        if (this.reset_ele)
            this.reset_ele.addEventListener(
                "click",
                this.onColorReset.bind(this),
                false
            );
        this.refresh();
    }

    /**
     * Set the elements to their defaults
     */
    reset() {
        this.shapeColors = { ...this.defaultColors };
        const json_cookie = cookie.get(ShapeColors.name, this.toString());
        this.fromString(json_cookie);
    }

    /**
     * Set the elements to the last value received
     */
    refresh() {
        for (const ele of this.shapeColorEles) {
            const color = this.shapeColors[ele.id];
            if (color) {
                ele.value = color;
            }
        }
        cookie.set(ShapeColors.name, this.toString());
    }

    toString() {
        return JSON.stringify(this.shapeColors);
    }
    fromString(jsonString) {
        ({
            "pe5-color": this.shapeColors["pe5-color"],
            "pe3-color": this.shapeColors["pe3-color"],
            "pe1-color": this.shapeColors["pe1-color"],
            "star-color": this.shapeColors["star-color"],
            "boat-color": this.shapeColors["boat-color"],
            "diamond-color": this.shapeColors["diamond-color"],
        } = JSON.parse(jsonString));
    }

    onShapeColorsInput(event) {
        this.shapeColors[event.target.id] = event.target.value;
        this.refresh();
        this.app(ShapeColors.name);
    }

    onShapeColorsChange(event) {
        this.shapeColors[event.target.id] = event.target.value;
        this.refresh();
        this.app(ShapeColors.name);
    }
    // The reset button was clicked.
    onColorReset() {
        cookie.delete(ShapeColors.name);
        const deletedCookie = cookie.get(ShapeColors.name);
        this.reset();
        this.refresh();
        this.app(ShapeColors.name);
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

        this.eleType = document.querySelector("#type");
        this.eleIsDown = document.querySelector("#isDown");

        if (this.eleType)
            this.eleType.addEventListener(
                "click",
                this.clickType.bind(this),
                false
            );

        if (this.eleIsDown)
            this.eleIsDown.addEventListener(
                "click",
                this.clickIsDown.bind(this),
                false
            );
        //else console.log(`no eleDown!`);

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
        this.app(Controls.name);
    }

    clickType() {
        this.bumpType();
        this.eleType.innerHTML = this.typeName;
        this.app(Controls.name);
    }

    clickIsDown() {
        this.toggleDirection();
        this.eleIsDown.innerHTML = this.direction;
        this.app(Controls.name);
    }
}

/**
 * Shape-Mode:
 *   "mosaic"
 *      Mosaic tiles
 *   "quadrille"
 *      Filled outlines like on graph paper
 *   "real"
 *      True five fold real symmetry todo
 */
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
    /**
     * Changing the shape mode also changes the globals that penta, star and
     * deca use.
     * Todo: penta star and deca also have some crud, for example drawing the
     * figures.
     */
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
        this.app(ShapeMode.name);
    }
}

/**
 * These are a bunch of flags that penroseScreen routines use to paint the
 * tiles.  Todo add the small and large options for rhombs
 */
export class Overlays {
    constructor(app) {
        this.app = app;
        this.elePenta = document.querySelector("#penta-ovl");
        this.eleRhomb = document.querySelector("#rhomb-ovl");

        this.radioButtons = document.querySelectorAll("input[name='rhomb']");
        this.eleLargeRhomb = document.querySelector("large-rhomb");
        this.eleSmallRhomb = document.querySelector("small-rhomb");
        /**in progress */

        if (this.elePenta) {
            this.elePenta.addEventListener(
                "click",
                this.pentaClicked.bind(this),
                false
            );
        }
        if (this.eleRhomb) {
            this.eleRhomb.addEventListener(
                "click",
                this.rhombClicked.bind(this),
                false
            );
        }

        for (let button of this.radioButtons) {
            button.addEventListener(
                "click",
                this.rhombSizeClicked.bind(this),
                false
            );
        }

        this.reset();
        this.refresh();
    }
    reset() {
        this.pentaSelected = true;
        this.rhombSelected = false;
        this.smallRhomb = false;

        const dflt = this.toString();
        const cookieJson = cookie.get(Overlays.name, dflt);
        this.fromString(cookieJson);
    }
    refresh() {
        if (this.elePenta) {
            this.elePenta.checked = this.pentaSelected;
        }

        if (this.eleRhomb) {
            this.eleRhomb.checked = this.rhombSelected;
        }

        // If not rhombSelected, grey out the button.
        const ele = document.querySelector("#rhomb-size");
        if (this.rhombSelected) {
            if (ele) ele.style.display = "block";
            if (this.eleLargeRhomb && this.eleSmallRhomb) {
                if (this.smallRhomb) {
                    this.eleSmallRhomb.checked = true;
                } else {
                    this.eleLargeRhomb.checked = true;
                }
            }
        } else {
            if (ele) ele.style.display = "none";
        }
        cookie.set(Overlays.name, this.toString());
    }
    toString() {
        return JSON.stringify({
            pentaSelected: this.pentaSelected,
            rhombSelected: this.rhombSelected,
            smallRhomb: this.smallRhomb,
        });
    }

    fromString(jsonString) {
        ({
            pentaSelected: this.pentaSelected,
            rhombSelected: this.rhombSelected,
            smallRhomb: this.smallRhomb,
        } = JSON.parse(jsonString));
    }
    pentaClicked() {
        this.pentaSelected = !this.pentaSelected;
        this.refresh();
        this.app(Overlays.name);
    }
    rhombClicked() {
        this.rhombSelected = !this.rhombSelected;
        this.refresh();
        this.app(Overlays.name);
    }
    rhombSizeClicked() {
        for (let button of this.radioButtons) {
            if (button.checked) {
                this.smallRhomb = button.id == "small-rhomb";
                this.refresh();
            }
        }
        this.app(Overlays.name);
    }
}

/***
 *  Page Navigation defaults.
 */
export class PageNavigation {
    constructor(app) {
        this.app = app;
        this.navButtons = document.querySelectorAll(".pageButton");
        this.pages = document.querySelectorAll(".page");
        this.activePage = null; // loaded on self click
        //const ids = ["rwork", "inf1", "inf2", "gwork", "g012", "g3"];
        const eles = document.querySelectorAll(".pageButton");
        for (const ele of eles) {
            //const page = ids.shift();
            // future
            const page = ele.getAttribute("data-id");
            //console.log(`page: ${page}, futurePage: ${futurePage}`);
            const funct = () => this.pageClicked(page, ele);
            ele.addEventListener("click", funct, false);
        }
        this.reset(); // sets active button index.
        if (this.navButtons && this.navButtons[this.activeButtonIndex]) {
            this.navButtons[this.activeButtonIndex].click();
        }
    }

    reset() {
        this.activeButtonIndex = cookie.getActiveButtonIndex(0);
    }

    refresh() {
        cookie.setActiveButtonIndex(this.activeButtonIndex);
    }

    pageClicked(pageId, button) {
        for (let page of this.pages) {
            page.style.display = "none";
        }
        let active_page = document.querySelector(`#${pageId}`);
        active_page.style.display = "block";

        for (let index = 0; index < this.navButtons.length; index++) {
            let navButton = this.navButtons[index];
            if (navButton === button) {
                this.activeButtonIndex = index;
                navButton.style.background = "white";
                navButton.style.color = "black";
            } else {
                navButton.style.background = "black";
                navButton.style.color = "white";
            }
        }
        this.activePage = active_page;
        this.refresh();
        this.app("PageNavigation");
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
