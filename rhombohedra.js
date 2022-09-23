import * as THREE from "./js/three.module.js";
import { OrbitControls } from "./js/controls/OrbitControls.js";
import Stats from "./js/libs/stats.module.js";
import { GUI } from "./js/dat.gui.module.js";

window.addEventListener("load", threeTest, false);

/**
 * This app basically loads the interactive canvases used to discuss rhombs
 */

function threeTest() {
    solarSystem();
    let controls;
    let stats;

    const { container, camera, renderer, scene } = init();

    //addControls(camera, renderer);
    // The renderer is the canvas.
    const cube = cubeGeometry();
    const line = lineGeometry();
    const cone = coneGeometry();
    scene.add(cube);
    scene.add(line);
    scene.add(cone);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(-1, 2, 4);
    scene.add(light);

    window.addEventListener(
        "resize",
        () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            render();
        },
        false
    );

    function setUpStats() {
        const stats = Stats();
        // Shows up oddly.
        container.appendChild(stats.dom);
    }

    function setUpGui() {
        const gui = new GUI();
        const cubeFolder = gui.addFolder("Cube");
        cubeFolder.add(cube.scale, "x", -5, 5);
        cubeFolder.add(cube.scale, "y", -5, 5);
        cubeFolder.add(cube.scale, "z", -5, 5);
        cubeFolder.open();
        const cameraFolder = gui.addFolder("Camera");
        cameraFolder.add(camera.position, "z", 0, 10);
        cameraFolder.open();
    }

    var animate = function () {
        requestAnimationFrame(animate);

        cube.rotation.x += 1 / 200;
        //cube.rotation.y += 1 / 60;
        //controls.update();
        cube.rotation.y += 1 / 60;
        //controls.update();
        renderer.render(scene, camera);
        //stats.update();
    };

    function render() {
        renderer.render(scene, camera);
    }

    animate();
}
function addControls(camera, renderer) {
    controls = new OrbitControls(camera, renderer.domElement);
}
function init() {
    const container = document.getElementById("three-test");
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    container.appendChild(renderer.domElement);
    return { container, camera, scene, renderer };
}

function lineGeometry() {
    //create a blue LineBasicMaterial
    const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const points = [];
    points.push(new THREE.Vector3(-10, 0, 0));
    points.push(new THREE.Vector3(0, 10, 0));
    points.push(new THREE.Vector3(10, 0, 0));
    const geometry = new THREE.BufferGeometry(points);
    const line = new THREE.Line(geometry, material);
    return line;
}

function cubeGeometry() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); // greenish blue

    const cube = new THREE.Mesh(geometry, material);
    return cube;
}

function coneGeometry() {
    const geo = new THREE.ConeGeometry(3, 4, 16);
    const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); //
    const cone = new THREE.Mesh(geo, material);
    return cone;
}

/**
 * Just do the solar system in the book
 */
function solarSystem() {
    //const canvas = document.createElement("canvas");
    const canvas = document.querySelector("#solar-system");
    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 40;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 1000;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 150, 0);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    const scene = new THREE.Scene();

    const objects = [];

    // One sphere for all
    const radius = 1;
    const wSegs = 6;
    const hSegs = 6;
    const sphereGeometry = new THREE.SphereGeometry(radius, wSegs, hSegs);

    const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
    sunMesh.scale.set(5, 5, 5);
    scene.add(sunMesh);
    objects.push(sunMesh);

    const color = 0xffffff;
    const intensity = 3;
    const light = new THREE.PointLight(color, intensity);
    scene.add(light);

    const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x2233ff,
        emissive: 0x112244,
    });
    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);

    earthMesh.position.x = 10;
    //scene.add(earthMesh);
    sunMesh.add(earthMesh);
    objects.push(earthMesh);

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        objects.forEach((obj) => {
            obj.rotation.y = time;
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}
