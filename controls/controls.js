import { cookie } from "../controls.js";
import { penrose } from "../penrose.js";
import { norm } from "../point.js";
import { RhombStyle } from "./rhomb-style.js";

/**
 * A clustered set of globals
 * Cannot say whether it was a good idea to cluster them
 * Added cookie handling
 */
export class Controls {
    constructor(app, fifths, typeIndex, isDown) {
        this.app = app;
        this.eleFifths = document.querySelector("#fifths");
        this.eleType = document.querySelector("#type");
        this.eleIsDown = document.querySelector("#isDown");

        if (this.eleFifths)
            this.eleFifths.addEventListener(
                "click",
                this.clickFifths.bind(this),
                false
            );

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
        this.reset(fifths, typeIndex, isDown);
        this.refresh();
    }
    reset(fifths, typeIndex, isDown) {
        this.fifths = fifths;
        this.typeIndex = typeIndex;
        this.isDown = isDown;
        this.fifths = cookie.getFifths(fifths);
        this.typeIndex = cookie.getTypeIndex(typeIndex);
        this.isDown = cookie.getIsDown(isDown);
    }
    toString() {
        return JSON.stringify({
            fifths: this.fill,
            typeIndex: this.typeIndex,
            isDown: this.isDown,
        });
    }
    fromString() {
        ({
            fifths: this.fill,
            typeIndex: this.typeIndex,
            isDown: this.isDown,
        } = JSON.parse(jsonString));
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
        penrose.Deca,
    ];
    //refresh() {}
    refresh() {
        if (this.eleFifths) this.eleFifths.innerHTML = `fifths: ${this.fifths}`;
        if (this.eleType) this.eleType.innerHTML = this.typeName;
        if (this.eleIsDown) this.eleIsDown.innerHTML = this.direction;
        cookie.set(Controls.name, this.toString);
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
        this.refresh();
        this.app(Controls.name);
    }

    clickType() {
        console.log(`click type`);
        this.bumpType();
        this.refresh();
        this.app(Controls.name);
    }

    clickIsDown() {
        this.toggleDirection();
        this.refresh();
        this.app(Controls.name);
    }
}
