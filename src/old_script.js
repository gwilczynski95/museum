import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Utils

function calcDegree(currentPosition, change) {
    const degMax = 2*Math.PI;
    const degMin = 0;
    let outPosition = 0;
    if (currentPosition + change >= degMax) {
        outPosition = currentPosition + change - degMax;
    } else if (currentPosition + change < degMin) {
        outPosition = degMax + currentPosition + change;
    } else {
        outPosition = currentPosition + change;
    }
    return outPosition
}

function calcQuarterDegree(rotation) {
    // Returns degree made with z axis and the quarter the degree belongs to.
    const quarterDegreeStep = Math.PI / 2;
    let prettyDegree = 0;
    let quarter = Math.floor(rotation / quarterDegreeStep);

    if (quarter == 1) {
        prettyDegree = Math.PI - rotation;
    } else if (quarter == 2) {
        prettyDegree = rotation - Math.PI;
    } else if (quarter == 3) {
        prettyDegree = 2 * Math.PI - rotation;
    } else {
        prettyDegree = rotation;
    }
    return [prettyDegree, quarter];
}

function calcQuarterXandZSign(quarter) {
    if (quarter == 0) {
        return [-1, 1];
    } else if (quarter == 1) {
        return [-1, -1];
    } else if (quarter == 2) {
        return [1, -1];
    } else {
        return [1, 1];
    }
}

// Load
const textureLoader = new THREE.TextureLoader()
const golfBallTexture = textureLoader.load('/textures/golf_ball_normal_map.png')

const surfaceTexture = textureLoader.load('/textures/surface_normal_map.jpg')

// Load 3D models
const modelsLoader = new GLTFLoader();
modelsLoader.load('/models/scene.gltf', function (gltf) {
    let car = gltf.scene.children[0];
    car.scale.set(0.5, 0.5, 0.5);
    gltf.scene.rotation.set(0, - Math.PI / 4, 0);
    gltf.scene.position.set(1, 0, -1)
    car.position.set(0, .15, 0);
    car.castShadow = true;
    car.receiveShadow = true;
    scene.add(gltf.scene);
})

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Player
const player = {height: .5, speed: 0.05, turnSpeed:Math.PI*0.02};


// Objects

class CustomSinCurve extends THREE.Curve {
    constructor (scale = 1) {
        super();
        this.scale = scale;
    }

    getPoint (t, optionalTarget = new THREE.Vector3()) {
        const tx = Math.cos(4 * Math.PI * t) - 2 * t;
        // const tx = Math.cos(2 * Math.PI * t);
        // const ty = t;
        const ty = Math.sin(2 * Math.PI * t);
        const tz = Math.sin(4 * Math.PI * t) - 4 * t;
        // const tz = 0;

        return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
    }
}
// const geometry = new THREE.SphereBufferGeometry(.5, 64, 64)
const donutGeometry = new THREE.TorusBufferGeometry(.1, .05, 64, 64)

const planeGeometry = new THREE.PlaneGeometry(50, 50)

const cubeGeometry = new THREE.BoxGeometry(.5, .5, .5);

const curvePath = new CustomSinCurve(.15);
const curveGeometry = new THREE.TubeGeometry(curvePath, 128, .04, 32, false)

const xVertices = [];
xVertices.push( new THREE.Vector3(-.5, 0, 0) );
xVertices.push( new THREE.Vector3(50, 0, 0) );
const xAxisLineGeometry = new THREE.BufferGeometry().setFromPoints(xVertices);

const yVertices = [];
yVertices.push( new THREE.Vector3(0, -.5, 0) );
yVertices.push( new THREE.Vector3(0, 50, 0) );
const yAxisLineGeometry = new THREE.BufferGeometry().setFromPoints(yVertices);

const zVertices = [];
zVertices.push( new THREE.Vector3(0, 0, -.50) );
zVertices.push( new THREE.Vector3(0, 0, 50) );
const zAxisLineGeometry = new THREE.BufferGeometry().setFromPoints(zVertices);

// Materials

const donutMaterial = new THREE.MeshStandardMaterial()
donutMaterial.metalness = 0.7
donutMaterial.roughness = 0.2
// material.vertexColors = true
donutMaterial.normalMap = golfBallTexture;
donutMaterial.color = new THREE.Color(0x29af76);

const cubeMaterial = new THREE.MeshStandardMaterial();
cubeMaterial.color = new THREE.Color(0xd26181);

const curveMaterial = new THREE.MeshStandardMaterial();
curveMaterial.color = new THREE.Color(0xa635cd);
curveMaterial.side = THREE.DoubleSide;
curveMaterial.wireframe = true;

const planeMaterial = new THREE.MeshStandardMaterial()
// planeMaterial.normalMap = surfaceTexture;
// planeMaterial.normalMap.repeat.set(64, 64);
// planeMaterial.normalMap.wrapS = planeMaterial.normalMap.wrapT = THREE.RepeatWrapping;
planeMaterial.side = THREE.DoubleSide;
planeMaterial.color = new THREE.Color(0xcccccc);

const xAxisLineMaterial = new THREE.LineBasicMaterial()
xAxisLineMaterial.color = new THREE.Color(0xff0000);  // r

const yAxisLineMaterial = new THREE.LineBasicMaterial()
yAxisLineMaterial.color = new THREE.Color(0x00ff00);  // g

const zAxisLineMaterial = new THREE.LineBasicMaterial()
zAxisLineMaterial.color = new THREE.Color(0x0000ff);  // b

// Mesh
const donut = new THREE.Mesh(donutGeometry,donutMaterial);
const xLine = new THREE.Line(xAxisLineGeometry, xAxisLineMaterial);
const yLine = new THREE.Line(yAxisLineGeometry, yAxisLineMaterial);
const zLine = new THREE.Line(zAxisLineGeometry, zAxisLineMaterial);
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
const curve = new THREE.Mesh(curveGeometry, curveMaterial);
scene.add(donut);
scene.add(xLine);
scene.add(yLine);
scene.add(zLine);
scene.add(plane);
scene.add(cube);
scene.add(curve);


// Set wanted position of objects
donut.rotation.set(Math.PI / 2, 0, 0);
donut.position.set(-.5, .05, -.5);

plane.rotation.set(Math.PI / 2, 0, 0);
plane.position.set(0, 0, 0);

cube.position.set(0, 0.3, -1.5);

curve.position.set(1, .2, 1);


// Shadows
donut.castShadow = true;
donut.receiveShadow = true;
// plane.castShadow = true;
plane.receiveShadow = true;
cube.receiveShadow = true;
cube.castShadow = true;
curve.receiveShadow = true;
curve.castShadow = true;


// Lights
const defaultLightColor = 0xe1bc7f
const pointLight = new THREE.PointLight(defaultLightColor, 2);
pointLight.position.set(1.33, 1.32, 0);
pointLight.intensity = 3;
pointLight.castShadow = true;
pointLight.shadow.radius = 0;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
scene.add(pointLight)

const light = gui.addFolder('Light 2');
light.add(pointLight.position, 'x', -3, 3, .01);
light.add(pointLight.position, 'y', -3, 3, .01);
light.add(pointLight.position, 'z', -3, 3, .01);
light.add(pointLight, 'intensity', 0, 10, .01);

const lightColor = {
    color: defaultLightColor
}
light.addColor(lightColor, 'color')
    .onChange(() => {
        pointLight.color.set(lightColor.color);
    });

// const pointLightHelper2 = new THREE.PointLightHelper(pointLight3, .5);
// scene.add(pointLightHelper2);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;  

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 1000);
camera.position.x = 0;
camera.position.y = player.height;
camera.position.z = -5;
scene.add(camera)
camera.lookAt(new THREE.Vector3(0, player.height, 0));
// let degree = 10;
// camera.rotation.y = 2 * Math.PI * degree / 360;

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// set camera controls
// let controls;
// function createControls( cam ) {
//     controls = new OrbitControls(cam, renderer.domElement);
//     // controls.rotateSpeed = 1.0;
//     // controls.zoomSpeed = 1.2;
//     // controls.panSpeed = 0.8;
// }
// createControls(camera);

/**
 * Animate
 */

document.addEventListener('mousemove', onDocumentMouseMove);

document.addEventListener('keydown', onKeyDown);

let mouseX = 0;
let mouseY = 0;

// let targetX = 0;
// let targetY = 0;




function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
};

// let rotationY = 0;
// let rotationX = 0;
// let rotationStep = .05;

function onKeyDown(event) { // My own work, found out to be useless, had some fun with it
    if (event.keyCode == 65) {  // a
        let tempRotation = calcDegree(camera.rotation.y, - (Math.PI / 2));
        // let [tempPrettyRot, tempQuarter] = calcQuarterDegree(tempRotation);
        // let [xSign, zSign] = calcQuarterXandZSign(tempQuarter);
        // console.log(`requestedRot: ${180 * tempRotation / Math.PI}, requestedPrettyRot: ${180 * tempPrettyRot / Math.PI}, quarter: ${tempQuarter}, xSign: ${xSign}, zSign: ${zSign}, xStep: ${xSign * Math.sin(tempPrettyRot) * player.speed}, zStep: ${zSign * Math.cos(tempPrettyRot) * player.speed}`)

        // camera.position.x += xSign * Math.sin(tempPrettyRot) * player.speed;
        // camera.position.z += zSign * Math.cos(tempPrettyRot) * player.speed;
        camera.position.x -= Math.sin(tempRotation) * player.speed;
        camera.position.z += Math.cos(tempRotation) * player.speed;
    }
    if (event.keyCode == 68) {  // d
        let tempRotation = calcDegree(camera.rotation.y, (Math.PI / 2));
        // let [tempPrettyRot, tempQuarter] = calcQuarterDegree(tempRotation);
        // let [xSign, zSign] = calcQuarterXandZSign(tempQuarter);
        // console.log(`requestedRot: ${180 * tempRotation / Math.PI}, requestedPrettyRot: ${180 * tempPrettyRot / Math.PI}, quarter: ${tempQuarter}, xSign: ${xSign}, zSign: ${zSign}, xStep: ${xSign * Math.sin(tempPrettyRot) * player.speed}, zStep: ${zSign * Math.cos(tempPrettyRot) * player.speed}`)

        // camera.position.x += xSign * Math.sin(tempPrettyRot) * player.speed;
        // camera.position.z += zSign * Math.cos(tempPrettyRot) * player.speed;
        camera.position.x -= Math.sin(tempRotation) * player.speed;
        camera.position.z += Math.cos(tempRotation) * player.speed;
    }
    if (event.keyCode == 87) {  // w
		camera.position.x += -Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += Math.cos(camera.rotation.y) * player.speed;
    } 
    if (event.keyCode == 83) {  // s
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
    } 
    if (event.keyCode == 81) {  // q <- left rotation
        camera.rotation.y = calcDegree(camera.rotation.y, -player.turnSpeed);
    }
    if (event.keyCode == 69) {  // e <- right rotation
        camera.rotation.y = calcDegree(camera.rotation.y, player.turnSpeed);
    }
};

const clock = new THREE.Clock()

const tick = () =>
{
    // targetX = mouseX * .001;
    // targetY = mouseY * .001;
    
    const elapsedTime = clock.getElapsedTime()


    // controls.update();
    
    // Update objects
    cube.rotation.y = .5 * elapsedTime;
    let cubeScaleFactor = .2 * Math.sin(elapsedTime) + 1;
    cube.scale.set(cubeScaleFactor, cubeScaleFactor, cubeScaleFactor);
    
    camera.rotation.y = calcDegree(camera.rotation.y, mouseX * 0.01 - camera.rotation.y)
    camera.rotation.x = calcDegree(camera.rotation.x, - mouseY * 0.01 - camera.rotation.x)
    console.log(camera.rotation.y)

    // sphere.rotation.y = .5 * elapsedTime

    // sphere.rotation.y += .5 * (targetX - sphere.rotation.y)
    // sphere.rotation.x += .5 * (targetY - sphere.rotation.x)

    // sphere.rotation.y = rotationY
    // sphere.rotation.x = rotationX

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()