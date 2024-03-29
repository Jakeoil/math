import { ShapeColors } from "./controls/ShapeColors.js";
import { Overlays } from "./controls/Overlays.js";
import { PageNavigation } from "./controls/PageNavigation.js";
import { RhombStyle } from "./controls/RhombStyle.js";
import { ShapeMode } from "./controls/ShapeMode.js";
import { Figure } from "./controls/Figure.js";
import { PentaStyle } from "./controls/PentaStyle.js";

/**
 * Controls are
 */
/********************************
 * Convenience routines
 ********************************/
export function logRefresh(app, source) {
    switch (source) {
        case Overlays.name:
            console.log(
                `Refresh ${app.name} from ${Overlays.name}: ${globals.overlays}`
            );
            break;
        case RhombStyle.name:
            console.log(
                `Refresh ${app.name} from ${RhombStyle.name}: ${globals.rhombStyle}`
            );
            break;
        case PentaStyle.name:
            console.log(
                `Refresh ${app.name} from ${PentaStyle.name}: ${globals.pentaStyle}`
            );
            break;
        case ShapeColors.name:
            console.log(
                `Refresh ${app.name} from ${ShapeColors.name}: ${globals.shapeColors}`
            );
            break;
        case PageNavigation.name:
            console.log(
                `Refresh ${app.name} from ${PageNavigation.name}: ${globals.pageNavigation}`
            );
            break;
        case Figure.name:
            console.log(
                `Refresh ${app.name} from ${Figure.name}: ${globals.controls}`
            );
            break;
        case ShapeMode.name:
            console.log(
                `Refresh ${app.name} from ${ShapeMode.name}: ${globals.shapeMode}`
            );
        default:
            const val = source.constructor.name;
            switch (val) {
                case Event.name:
                    console.log(
                        `Refresh ${app.name} from ${Event.name}: ${source.type}`
                    );
                    break;
                default:
                    console.log(
                        `Refresh ${app.name} from unsupported ${val} ${source}`
                    );
            }
    }
}

export const measureTask = {};
export const measureTaskGlobals = {};
export const globals = {};

export function initControls(app) {
    if (app.name == "penroseApp") {
        if (!globals.shapeColors) globals.shapeColors = new ShapeColors(app);

        if (!globals.controls) globals.controls = new Figure(app, 0, 0, false);

        if (!globals.shapeMode) globals.shapeMode = new ShapeMode(app);

        if (!globals.overlays) globals.overlays = new Overlays(app);
        if (!globals.rhombStyle) globals.rhombStyle = new RhombStyle(app);
        if (!globals.pentaStyle) globals.pentaStyle = new PentaStyle(app);

        if (!globals.pageNavigation)
            globals.pageNavigation = new PageNavigation(app);
    } else if (app.name == "measureTasks") {
        if (!measureTaskGlobals.shapeMode)
            measureTaskGlobals.shapeMode = new ShapeMode(app);
        if (!measureTaskGlobals.overlays)
            measureTaskGlobals.overlays = new Overlays(app);
        if (!measureTaskGlobals.rhombStyle)
            measureTaskGlobals.rhombStyle = new RhombStyle(app);
    } else {
        console.log("missing app");
    }
}
/**
 * The cookie has strong ties to the controls.
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
}
// The cookie interface !!! We already found this to be dangerous.
export const cookie = new Cookie();

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
