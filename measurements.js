import { p } from "./point.js";
import { Bounds } from "./bounds.js";
import { interpolateWheel, successorPoint } from "./wheels.js";
import { penrose } from "./penrose.js";
//import { MODE_REAL } from "./controls/shape-mode.js"; // Now _really_
import { quadrille } from "./shape-modes.js";
import { iface } from "./penrose-screen.js";
import { measureTaskGlobals } from "./controls.js";
import { initControls, logRefresh } from "./controls.js";

window.addEventListener("load", measureTasks, false);
export function measureTasks(source) {
    logRefresh(measureTasks, source);
    initControls(measureTasks);
    drawQuadrille();
    drawImage();
    wheelTables();
    shapeWheelTests();
}

function drawQuadrille() {
    const canvas = document.querySelector("#quadrille");
    canvas.width = 0;
    canvas.height = 0;
    const { shapeMode } = measureTaskGlobals;
    const g = canvas.getContext("2d");
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    const scale = 3.7;
    const { deca } = iface(g, scale, measureTaskGlobals.shapeMode.MODE_REAL);

    let base = p(0, 0);
    let fifths = 0;
    let isDown = false;
    let exp = 2;
    // Now some decagons
    let bounds = new Bounds();
    bounds.expand(deca(fifths, isDown, base, exp));
    if (bounds.isEmpty) {
        bounds.addPoint(base, p(0, 0));
    }
    base = base.tr(p(bounds.minPoint.x, bounds.minPoint.y).neg);
    canvas.width = (bounds.maxPoint.x - bounds.minPoint.x) * scale;
    canvas.height = (bounds.maxPoint.y - bounds.minPoint.y) * scale;

    bounds = new Bounds();
    bounds.expand(deca(fifths, isDown, base, exp));
    bounds = new Bounds();
    const img = canvas.toDataURL("img.png");
}

function drawImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 0;
    canvas.height = 0;

    const g = canvas.getContext("2d");
    g.strokeStyle = penrose.OUTLINE;
    g.lineWidth = 1;
    const scale = 5;
    // Stupid way to get the globals.
    const { shapeMode } = measureTaskGlobals;
    const { deca } = iface(g, scale, shapeMode.MODE_REAL);

    // Now some decagons

    let fifths = 0;
    let isDown = false;
    let base = p(0, 0);
    let exp = 1;
    let bounds = new Bounds();
    bounds.expand(deca(fifths, isDown, base, exp));
    bounds.pad(1);
    base = base.tr(p(bounds.minPoint.x, bounds.minPoint.y).neg);
    canvas.width = (bounds.maxPoint.x - bounds.minPoint.x) * scale;
    canvas.height = (bounds.maxPoint.y - bounds.minPoint.y) * scale;

    bounds = new Bounds();
    bounds.expand(deca(fifths, isDown, base, exp));
    bounds.pad(1);
    bounds = new Bounds();
    const img = canvas.toDataURL("img.png");
    const ele = document.querySelector("#image");
    ele.src = img;
}

function wheelTables() {
    const wheels = quadrille.wheels;
    const pWheels = wheels.p;
    wheelTable("pWheel", pWheels);
    wheelTable("sWheel", quadrille.wheels.s);
    wheelTable("tWheel", quadrille.wheels.t);
    wheelTable("dWheel", quadrille.wheels.d);

    testInt(quadrille.wheels.p);
    testInt(quadrille.wheels.s);
    testInt(quadrille.wheels.t);
    testInt(quadrille.wheels.d);

    function testInt(wheels) {
        for (let i = 6; i > 1; i--) {
            const input = wheels[i].w;
            const correct = wheels[i - 1].w;
            const result = interpolateWheel(...input);
            const matches = result.every((v, index) =>
                v.equals(correct[index])
            );
            if (!matches) console.log("Interpolation failed: " + matches);
        }
    }
}
const caption = {
    pWheel: "P Distance between pentagons",
    sWheel: "S Pentagon, corner, star ",
    tWheel: "T Star to boat",
    dWheel: "D Pentagon to corner",
};

function wheelTable(id, wheel) {
    const n = 10;
    const tableDiv = document.querySelector(`#${id}`);

    const tableEle = document.createElement("table");
    const captionEle = document.createElement("caption");
    captionEle.innerHTML = caption[id];
    //captionEle.innerHTML(caption[id]);
    tableDiv.appendChild(tableEle);
    tableEle.appendChild(captionEle);

    // heading one.
    const eleH1 = document.createElement("tr");
    const eleRh1 = document.createElement("th");
    eleRh1.innerHTML = "";
    eleH1.appendChild(eleRh1);
    const h1Headers = "up0,down3,up1,down4,up2,down0,up3,down1,up4,down2".split(
        ","
    );

    const insertTh = function (value) {
        const thEle = document.createElement("th");
        thEle.innerHTML = value;
        eleH1.appendChild(thEle);
    };

    h1Headers.forEach(insertTh);
    tableEle.appendChild(eleH1);

    // heading two
    const eleH2 = document.createElement("tr");
    const eleRh2 = document.createElement("th");
    eleRh2.innerHTML = "expansion";

    eleH2.appendChild(eleRh2);
    const insertTh2 = function (value) {
        const thEle = document.createElement("th");
        thEle.innerHTML = value;
        eleH2.appendChild(thEle);
    };

    Array.from(Array(10).keys()).forEach(insertTh2);

    tableEle.appendChild(eleH2);

    for (let i = 0; i < 7; i++) {
        const eleRow = document.createElement("tr");
        const eleIndex = document.createElement("th");
        eleIndex.innerHTML = i;

        eleRow.appendChild(eleIndex);
        const tenths = wheel[i].w;
        const insertTd = function (value) {
            const tdEle = document.createElement("td");
            tdEle.innerHTML = `${value.x}, ${value.y}`;
            eleRow.appendChild(tdEle);
        };

        tenths.forEach(insertTd);
        tableEle.appendChild(eleRow);
    }
}

function makeShapesSeedSuccessor(shapesSeed) {
    const shapesSeedSuccessor = [[], [], []];
    for (let i = 0; i < shapesSeed[0].length; i++) {
        const point0 = shapesSeed[0][i];
        const point1 = shapesSeed[1][i];
        const point2 = shapesSeed[2][i];
        const [sPoint0, sPoint1, sPoint2] = successorPoint(
            point0,
            point1,
            point2
        );
        [
            shapesSeedSuccessor[0][i],
            shapesSeedSuccessor[1][i],
            shapesSeedSuccessor[2][i],
        ] = [sPoint0, sPoint1, sPoint2];
        // console.log(
        //     `${point0}${point1}${point2} ==> ${sPoint0}${sPoint0}${sPoint0}`
        // );
    }
    return shapesSeedSuccessor;
}

function shapeWheelTests() {
    // First find the quadrille rhombuses.
    const thickRhomb = quadrille.thickRhomb[0];

    const thickBigRhomb = quadrille.thickRhomb[1];
    // The angle arrays
    let shapesSeed = thickRhomb.slice(0, 3);
    const shapesSeedSuccessor = makeShapesSeedSuccessor(shapesSeed);
}
