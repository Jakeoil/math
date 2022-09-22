import * as THREE from "./js/three.module.js";
import { OrbitControls } from "./js/controls/OrbitControls.js";
import Stats from "./js/libs/stats.module.js";
import { GUI } from "./js/dat.gui.module.js";

window.addEventListener("load", threeTest, false);

/**
 * This app basically loads the interactive canvases used to discuss rhombs
 */

function threeTest() {
    console.log(
        `Three test for window: ${window.innerWidth}, ${window.innerHeight}`
    );
    console.log(THREE);

    let controls;
    let stats;

    const { container, camera, renderer, scene } = init();

    //addControls(camera, renderer);
    // The renderer is the canvas.
    const cube = cubeGeometry();
    const line = lineGeometry();
    const cone = coneGeometry();
    console.log(cone);
    scene.add(cube);
    scene.add(line);
    scene.add(cone);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(-1, 2, 4);
    scene.add(light);

    console.log(scene);

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
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    console.log(`geometry: ${geometry}`);
    console.log(geometry);
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
 * This is trash.
 * @returns
 */
function rhombohedraApp() {
    console.log(`started`);
    const canvas = document.querySelector("#gltest");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
            "Unable to initialize WebGL. Your browser or machine may not support it."
        );
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;
    const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(
                shaderProgram,
                "aVertexPosition"
            ),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(
                shaderProgram,
                "uProjectionMatrix"
            ),
            modelViewMatrix: gl.getUniformLocation(
                shaderProgram,
                "uModelViewMatrix"
            ),
        },
    };

    initBuffers(gl);
    console.log(`called init buffers`);
    drawScene(gl, programInfo);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram
            )}`
        );
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(
                shader
            )}`
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
function initBuffers(gl) {
    // Create a buffer for the square's positions.

    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.

    const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
    };
}
function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [-0.0, 0.0, -6.0]
    ); // amount to translate

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
        const numComponents = 2; // pull out 2 values per iteration
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );

    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}
