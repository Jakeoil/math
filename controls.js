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
        console.log(`but cookie say: ${this.fifths}`);
        this.typeIndex = cookie.getTypeIndex(typeIndex);
        this.isDown = cookie.getIsDown(isDown);
    }
    bumpFifths() {
        this.fifths = norm(this.fifths + 1);
        console.log(`bump fifths to ${this.fifths}`);
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
    toString() {
        return JSON.stringify({
            fifths: this.fifths,
            type: this.typeName,
            isDown: this.isDown,
        });
    }
    /**
     * Initialization and
     * Events for the three buttons
     */
    clickFifths() {
        console.log(`click fifths`);
        this.bumpFifths();
        console.log(`new value ${this.fifths}`);
        this.eleFifths.innerHTML = `fifths: ${this.fifths}`;
        this.app(Controls.name);
    }

    clickType() {
        console.log(`click type`);
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
        this.refresh();
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
        this.shapeMode = cookie.getShapeMode(MODE_REAL);
    }
    toString() {
        return JSON.stringify({
            shapeMode: this.shapeMode,
        });
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
 * tiles.
 * P1 based
 * Pentagons and stars
 * Tree
 *
 * P3 based
 * Rhombs
 * Ammann bars
 * large and small
 */
export class Overlays {
    constructor(app) {
        this.app = app;
        this.elePenta = document.querySelector("#penta-ovl");
        this.eleTree = document.querySelector("#tree-penta");
        this.eleRhomb = document.querySelector("#rhomb-ovl");
        this.eleAmmann = document.querySelector("#ammann");
        // This controls the size of both Rhomb and Ammann
        this.eleRhombSizeField = document.querySelector("#rhomb-size");
        this.radioButtons = document.querySelectorAll("input[name='rhomb']");
        this.eleLargeRhomb = document.querySelector("#large-rhomb");
        this.eleSmallRhomb = document.querySelector("#small-rhomb");

        if (this.elePenta) {
            this.elePenta.addEventListener(
                "click",
                this.pentaClicked.bind(this),
                false
            );
        }
        if (this.eleTree) {
            this.eleTree.addEventListener(
                "click",
                this.treeClicked.bind(this),
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

        if (this.eleAmmann) {
            this.eleAmmann.addEventListener(
                "click",
                this.ammannClicked.bind(this),
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
        this.treeSelected = false;
        this.rhombSelected = false;
        this.ammannSelected = false;
        this.smallRhomb = false;

        const cookieJson = cookie.get(Overlays.name, this.toString());
        this.fromString(cookieJson);
    }
    refresh() {
        if (this.elePenta) {
            this.elePenta.checked = this.pentaSelected;
        }
        if (this.eleTree) {
            this.eleTree.checked = this.treeSelected;
        }

        if (this.eleRhomb) {
            this.eleRhomb.checked = this.rhombSelected;
        }

        if (this.eleAmmann) {
            this.eleAmmann.checked = this.ammannSelected;
        }

        if (
            this.eleRhombSizeField &&
            this.eleSmallRhomb &&
            this.eleLargeRhomb
        ) {
            if (this.rhombSelected || this.ammannSelected) {
                this.eleRhombSizeField.style.display = "block";
                if (this.smallRhomb) {
                    this.eleSmallRhomb.checked = true;
                } else {
                    this.eleLargeRhomb.checked = true;
                }
            } else {
                this.eleRhombSizeField.style.display = "none";
            }
        }

        cookie.set(Overlays.name, this.toString());
    }
    toString() {
        return JSON.stringify({
            pentaSelected: this.pentaSelected,
            treeSelected: this.treeSelected,
            rhombSelected: this.rhombSelected,
            ammannSelected: this.ammannSelected,
            smallRhomb: this.smallRhomb,
        });
    }

    fromString(jsonString) {
        ({
            pentaSelected: this.pentaSelected,
            treeSelected: this.treeSelected,
            rhombSelected: this.rhombSelected,
            ammannSelected: this.ammannSelected,
            smallRhomb: this.smallRhomb,
        } = JSON.parse(jsonString));
    }
    pentaClicked() {
        this.pentaSelected = !this.pentaSelected;
        this.refresh();
        this.app(Overlays.name);
    }
    treeClicked() {
        this.treeSelected = !this.treeSelected;
        this.refresh();
        this.app(Overlays.name);
    }
    rhombClicked() {
        this.rhombSelected = !this.rhombSelected;
        this.refresh();
        this.app(Overlays.name);
    }
    ammannClicked() {
        this.ammannSelected = !this.ammannSelected;
        this.refresh();
        this.app(Overlays.name);
    }
    rhombSizeClicked() {
        console.log(`click: smalRhomb: ${this.smallRhomb}`);
        console.log(`button`);
        for (let button of this.radioButtons) {
            if (button.checked) {
                this.smallRhomb = button.id == "small-rhomb";
            }
        }
        this.refresh();
        this.app(Overlays.name);
    }
}

/**
 * no fill   (null)
 * solid fill with passed color (#hhhhhh)
 * gradient fill with passed color (#hhhhhh)
 * Color darkened according to angle. (heads origin is high)
 *
 * Independant of color
 */
export class RhombStyle {
    SOLID = "solid";
    NONE = "none";
    GRADIENT = "gradient";

    constructor(app) {
        this.app = app;
        this.eleFill = document.querySelector("#rhomb-fill");
        console.log(this.eleFill);
        // none, color, gradiant.
        this.eleStroke = document.querySelector("#rhomb-stroke");
        this.eleFill.addEventListener(
            "change",
            this.onFillChanged.bind(this),
            false
        );
        this.eleStroke.addEventListener(
            "change",
            this.onStrokeChanged.bind(this),
            false
        );
        this.reset();
        this.refresh();
    }
    reset() {
        this.fill = this.SOLID;
        this.stroke = this.SOLID;
        this.fromString(cookie.get(RhombStyle.name, this.toString()));
    }
    toString() {
        return JSON.stringify({
            fill: this.fill,
            stroke: this.stroke,
        });
    }
    fromString(jsonString) {
        console.log(jsonString);
        ({ fill: this.fill, stroke: this.stroke } = JSON.parse(jsonString));
    }
    refresh() {
        let eleSelectedOption = document.querySelector(
            `#rhomb-fill > option[value="${this.fill}"]`
        );
        if (eleSelectedOption) eleSelectedOption.selected = true;
        eleSelectedOption = document.querySelector(
            `#rhomb-stroke > option[value="${this.stroke}"]`
        );
        if (eleSelectedOption) eleSelectedOption.selected = true;

        cookie.set(RhombStyle.name, this.toString(this));
    }

    onFillChanged(event) {
        this.fill = event.target.value;
        this.refresh();
        this.app(RhombStyle.name);
    }
    onStrokeChanged(event) {
        this.stroke = event.target.value;
        this.refresh();
        this.app(RhombStyle.name);
    }
}
/***
 *  Page Navigation defaults.
 */
export class PageNavigation {
    constructor(app) {
        this.app = app;
        this.navButtons = Array.from(document.querySelectorAll(".pageButton"));
        this.pages = Array.from(document.querySelectorAll(".page"));
        this.navButtons.forEach((button) =>
            button.addEventListener("click", this.pageClicked.bind(this), false)
        );

        this.reset();
        this.refresh();
    }

    reset() {
        this.activeButtonIndex = 1;
        this.fromString(cookie.get(PageNavigation.name, this.toString()));
    }

    /**
     * Updates based on this.activeButtonIndex
     * @returns
     */
    refresh() {
        if (!this.navButtons.length) {
            console.log(`!! Nothing to refresh`);
            return;
        }

        // Refresh navButtons.
        const activeNavButton = this.navButtons[this.activeButtonIndex];

        for (const navButton of this.navButtons) {
            if (navButton === activeNavButton) {
                navButton.style.background = "white";
                navButton.style.color = "black";
            } else {
                navButton.style.background = "black";
                navButton.style.color = "white";
            }
        }

        this.pages.forEach((page) => (page.style.display = "none"));
        const activePageId = activeNavButton.getAttribute("data-id");
        const activePage = document.querySelector(`#${activePageId}`);
        activePage.style.display = "block";

        cookie.set(PageNavigation.name, this.toString());
    }

    toString() {
        return JSON.stringify({
            activeButtonIndex: this.activeButtonIndex,
        });
    }

    fromString(jsonString) {
        ({ activeButtonIndex: this.activeButtonIndex } =
            JSON.parse(jsonString));
    }

    pageClicked(event) {
        const pageId = event.target.getAttribute("data-id");
        const pageIndex = this.navButtons.findIndex(
            (button) => button.getAttribute("data-id") == pageId
        );
        if (pageIndex >= 0) this.activeButtonIndex = pageIndex;
        else console.log(`No navButtons. Ignore`);

        this.refresh();
        this.app(PageNavigation.name);
    }
}

/********************************
 * Convenience routines
 ********************************/
export function logRefresh(source) {
    switch (source) {
        case Overlays.name:
            console.log(
                `Refresh penroseApp from ${Overlays.name}: ${globals.overlays}`
            );
            break;
        case RhombStyle.name:
            console.log(
                `Refresh penroseApp from ${RhombStyle.name}: ${globals.rhombStyle}`
            );
            break;
        case ShapeColors.name:
            console.log(
                `Refresh penroseApp from ${ShapeColors.name}: ${globals.shapeColors}`
            );
            break;
        case PageNavigation.name:
            console.log(
                `Refresh penroseApp from ${PageNavigation.name}: ${globals.pageNavigation}`
            );
            break;
        case Controls.name:
            console.log(
                `Refresh penroseApp from ${Controls.name}: ${globals.controls}`
            );
            break;
        case ShapeMode.name:
            console.log(
                `Refresh penroseApp from ${ShapeMode.name}: ${globals.shapeMode}`
            );
        default:
            const val = source.constructor.name;
            switch (val) {
                case Event.name:
                    console.log(
                        `Refresh penroseApp from ${source.target.constructor.name}`
                    );
                default:
                    console.log(
                        `!! Refresh penroseApp from unsupported ${source}`
                    );
            }
    }
}
export const globals = {};

export function initControls(app) {
    if (!globals.shapeColors) globals.shapeColors = new ShapeColors(app);

    if (!globals.controls) globals.controls = new Controls(app, 0, 0, false);

    if (!globals.shapeMode) globals.shapeMode = new ShapeMode(app);

    if (!globals.overlays) globals.overlays = new Overlays(app);
    if (!globals.rhombStyle) globals.rhombStyle = new RhombStyle(app);

    if (!globals.pageNavigation)
        globals.pageNavigation = new PageNavigation(app);
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
