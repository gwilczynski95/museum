import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { corridorSegmentGeometry, arrayRotate, getRandomColorMaterial } from '../static/models/models'

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
const player = {height: 1.8, speed: 150., turnSpeed:Math.PI*0.02, mass: 10};

// Physics
let prevTime = performance.now();
const acceleration = new THREE.Vector3();
const velocity = new THREE.Vector3();
const true_velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const frictionCoeff = 10.;

// Controls
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

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
var playerCircleGeometry = new THREE.CircleBufferGeometry(.5, 10);

// Materials

var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true } );

const donutMaterial = new THREE.MeshStandardMaterial()
donutMaterial.metalness = 0.7
donutMaterial.roughness = 0.2
// material.vertexColors = true
donutMaterial.normalMap = golfBallTexture;
donutMaterial.color = new THREE.Color(0x29af76);

const cubeMaterial = new THREE.MeshStandardMaterial();
cubeMaterial.color = new THREE.Color(0xd26181);
cubeMaterial.side = THREE.DoubleSide;

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
const playerCircle = new THREE.Mesh(playerCircleGeometry, wireMaterial);
scene.add(donut);
scene.add(xLine);
scene.add(yLine);
scene.add(zLine);
scene.add(plane);
scene.add(cube);
scene.add(curve);
scene.add(playerCircle);

// Set wanted position of objects
donut.rotation.set(Math.PI / 2, 0, 0);
donut.position.set(-.5, .05, -.5);

plane.rotation.set(Math.PI / 2, 0, 0);
plane.position.set(0, 0, 0);

cube.position.set(0, 0.3, -1.5);

curve.position.set(1, .2, 1);

playerCircle.rotation.set(Math.PI/2, 0, 0);


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
const defaultLightColor = 0x404040;
const light = new THREE.AmbientLight( defaultLightColor ); // soft white light
scene.add( light );


const pointLight = new THREE.PointLight(defaultLightColor, 2);
pointLight.position.set(1.33, 1.32, 0);
pointLight.intensity = 3;
pointLight.castShadow = true;
pointLight.shadow.radius = 0;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
scene.add(pointLight)

const lightGui = gui.addFolder('Ambient Light');
// lightGui.add(pointLight.position, 'x', -3, 3, .01);
// lightGui.add(pointLight.position, 'y', -3, 3, .01);
// lightGui.add(pointLight.position, 'z', -3, 3, .01);
lightGui.add(light, 'intensity', 0, 10, .01);

const lightColor = {
    color: defaultLightColor
}
lightGui.addColor(lightColor, 'color')
    .onChange(() => {
        light.color.set(lightColor.color);
    });

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // windowHalfX = window.innerWidth / 2;
    // windowHalfY = window.innerHeight / 2;  

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const onKeyDown = function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
};

const onKeyUp = function ( event ) {

    switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;

    }

};

document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 1000);
camera.position.x = 0;
camera.position.y = player.height;
camera.position.z = 1;
camera.rotation.order = "YXZ";
scene.add(camera)
camera.lookAt(new THREE.Vector3(0, player.height, 0));
// let degree = 10;
// camera.rotation.y = 2 * Math.PI * degree / 360;

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

let controls = new PointerLockControls( camera, document.body );

const blocker = document.getElementById( 'blocker' );
const instructions = document.getElementById( 'instructions' );

instructions.addEventListener( 'click', function () {

    controls.lock();

} );

controls.addEventListener( 'lock', function () {

    instructions.style.display = 'none';
    blocker.style.display = 'none';

} );

controls.addEventListener( 'unlock', function () {

    blocker.style.display = 'block';
    instructions.style.display = '';

} );

scene.add( controls.getObject() );




// place my player cube at camera
playerCircle.position.set(camera.position.x, camera.position.y / 2, camera.position.z);




// my segment test
const width = 5.;
const depth = 4.;
const height = 3.5;
const segmentsBefore = 5;  // plus x
const segmentsAfter = 5;  // minus x
let segmentsArr = [];
let iterator = 0

for (let iter=segmentsBefore - 1; iter >= 0; iter--) {
    var tempGeometry = corridorSegmentGeometry(width, depth, height);
    tempGeometry.translate(camera.position.x + depth + iter * depth, 0, 0);
    let tempSegmentConfig = {
        maxX: camera.position.x + depth * 3/2 + iter * depth,
        minX: camera.position.x + depth/2 + iter * depth,
        number: iterator,
        segment: new THREE.Mesh(tempGeometry, getRandomColorMaterial())
    }

    tempSegmentConfig.segment.name = `segment${tempSegmentConfig.number}`;
    scene.add(
        tempSegmentConfig.segment
    );
    segmentsArr.push(tempSegmentConfig);
    iterator++;
}

var tempGeometry = corridorSegmentGeometry(width, depth, height);
let tempSegmentConfig = {
    maxX: camera.position.x + depth/2,
    minX: camera.position.x + -depth/2,
    number: iterator,
    segment: new THREE.Mesh(tempGeometry, getRandomColorMaterial())
}
tempSegmentConfig.segment.name = `segment${tempSegmentConfig.number}`;
scene.add(
    tempSegmentConfig.segment
);
segmentsArr.push(tempSegmentConfig);
iterator++;

for (let iter=0; iter < segmentsAfter; iter++) {
    var tempGeometry = corridorSegmentGeometry(width, depth, height);
    tempGeometry.translate(camera.position.x -depth - iter * depth, 0, 0);
    let tempSegmentConfig = {
        maxX: camera.position.x -depth/2 - iter * depth,
        minX: camera.position.x -depth * 3/2 - iter * depth,
        number: iterator,
        segment: new THREE.Mesh(tempGeometry, getRandomColorMaterial())
    }
    tempSegmentConfig.segment.name = `segment${tempSegmentConfig.number}`;
    scene.add(
        tempSegmentConfig.segment
    );
    segmentsArr.push(tempSegmentConfig);
    iterator++;
}

// for (let iter=0; iter <segmentsAfter + segmentsBefore + 1; iter++) {
//     console.log(segmentsArr[iter].segment.name)
//     console.log(scene.getObjectByName(segmentsArr[iter].segment.name))
// }
// console.log(segmentsArr);




// console.log(segmentsArr[segmentsBefore]);
// segmentsArr = arrayRotate(segmentsArr);
// console.log(segmentsArr[segmentsBefore]);
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

const clock = new THREE.Clock()

const tick = () =>
{   
    const elapsedTime = clock.getElapsedTime();
    const time = performance.now();

    // Controls
    if (controls.isLocked === true) {
        const delta = (time - prevTime) / 1000;
        velocity.x -= velocity.x * 10. * delta;
        velocity.z -= velocity.z * 10. * delta;
        
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if ( moveForward || moveBackward ) velocity.z -= direction.z * player.speed * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * player.speed * delta;

        const position = playerCircle.geometry.attributes.position;
        const vector = new THREE.Vector3();
        var collision = false;

        for (var vertexIndex = 0; vertexIndex < position.count; vertexIndex++) {
            vector.fromBufferAttribute( position, vertexIndex );
            vector.applyMatrix4( playerCircle.matrixWorld );
            var directionVector = vector.sub(playerCircle.position);

            var ray = new THREE.Raycaster(playerCircle.position, directionVector.normalize());
            var collisionResults = ray.intersectObjects([segmentsArr[segmentsBefore].segment]);
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                collision = true;
                break;
            }
        }

        velocity.x = Math.round(velocity.x * 10000) / 10000;
        velocity.z = Math.round(velocity.z * 10000) / 10000;

        var new_velocity_x = velocity.x;
        var new_velocity_z = velocity.z;

        if (collision) {
            var mag = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.z, 2));
            var degX = Math.round(Math.acos(velocity.x / mag) * 100) / 100;
            var degZ = Math.acos(velocity.z / mag);
            if (degX > Math.PI / 2) 
                degZ = Math.PI * 2 - degZ;
            var camRotY = camera.rotation.y;
            if (camRotY < 0)
                camRotY = Math.PI * 2 + camRotY;      
            // check collision vector
            var dx = collisionResults[0].point.x - camera.position.x;
            var dz = collisionResults[0].point.z - camera.position.z;
            var col_deg = Math.atan2(dx, dz);
            if (col_deg < 0) 
                col_deg = 2 * Math.PI + col_deg;
            var v_deg = camRotY - degZ;
            console.log("col_deg: " + Math.round(col_deg * 100) / 100 + " v_deg: " + Math.round(v_deg * 100) / 100 + " diff: " + Math.round((col_deg - v_deg) * 100) / 100);



            var absVelocityZ = Math.cos(camRotY - degZ) * mag;
            new_velocity_x = velocity.x - Math.sin(camRotY + 1e-8) * absVelocityZ;
            new_velocity_z = velocity.z - Math.cos(camRotY + 1e-8) * absVelocityZ;
        }
        
        controls.moveRight( - new_velocity_x * delta );
        controls.moveForward( - new_velocity_z * delta );

        if (collision) {
            // push player outside the wall
            if (camera.position.z < collisionResults[0].point.z)
                camera.position.z -= 1e-2;
            else if (camera.position.z > collisionResults[0].point.z)
                camera.position.z += 1e-2;
        }
        
        // update position of the cube
        playerCircle.position.x = camera.position.x;
        playerCircle.position.z = camera.position.z;

        // segments update
        if (camera.position.x < segmentsArr[segmentsBefore].minX) {
            var segmentToRemove = scene.getObjectByName(`segment${segmentsArr[0].number}`)
            // console.log(`removing maxX: ${segmentsArr[0].maxX}, minX: ${segmentsArr[0].minX}, number: ${segmentsArr[0].number}`)
            scene.remove(segmentToRemove);
            segmentsArr = arrayRotate(segmentsArr);
            var tempGeometry = corridorSegmentGeometry(width, depth, height);
            tempGeometry.translate(segmentsArr[segmentsBefore + segmentsAfter - 1].minX - depth/2, 0, 0);
            segmentsArr[segmentsBefore + segmentsAfter] = {
                maxX: segmentsArr[segmentsBefore + segmentsAfter - 1].minX,
                minX: segmentsArr[segmentsBefore + segmentsAfter - 1].minX - depth,
                number: segmentsArr[segmentsBefore + segmentsAfter - 1].number + 1,
                segment: new THREE.Mesh(tempGeometry, getRandomColorMaterial())
            }
            // console.log(`adding maxX: ${segmentsArr[segmentsBefore + segmentsAfter].maxX}, minX: ${segmentsArr[segmentsBefore + segmentsAfter].minX}, number: ${segmentsArr[segmentsBefore + segmentsAfter].number}`)
            segmentsArr[segmentsBefore + segmentsAfter].segment.name = `segment${segmentsArr[segmentsBefore + segmentsAfter].number}`
            scene.add(segmentsArr[segmentsBefore + segmentsAfter].segment)

        } else if (camera.position.x > segmentsArr[segmentsBefore].maxX) {
            var segmentToRemove = scene.getObjectByName(`segment${segmentsArr[segmentsBefore + segmentsAfter].number}`)
            // console.log(`removing maxX: ${segmentsArr[segmentsBefore + segmentsAfter].maxX}, minX: ${segmentsArr[segmentsBefore + segmentsAfter].minX}, number: ${segmentsArr[segmentsBefore + segmentsAfter].number}`)
            scene.remove(segmentToRemove);
            segmentsArr = arrayRotate(segmentsArr, true);
            var tempGeometry = corridorSegmentGeometry(width, depth, height);
            tempGeometry.translate(segmentsArr[1].maxX + depth/2, 0, 0);
            segmentsArr[0] = {
                maxX: segmentsArr[1].maxX + depth,
                minX: segmentsArr[1].maxX,
                number: segmentsArr[1].number - 1,
                segment: new THREE.Mesh(tempGeometry, getRandomColorMaterial())
            }
            // console.log(`adding maxX: ${segmentsArr[0].maxX}, minX: ${segmentsArr[0].minX}, number: ${segmentsArr[0].number}`)
            segmentsArr[0].segment.name = `segment${segmentsArr[0].number}`
            scene.add(segmentsArr[0].segment)
        }
    }
    prevTime = time;
    
    // Generate corridor

    // Update objects
    cube.rotation.y = .5 * elapsedTime;
    let cubeScaleFactor = .2 * Math.sin(elapsedTime) + 1;
    cube.scale.set(cubeScaleFactor, cubeScaleFactor, cubeScaleFactor);

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()