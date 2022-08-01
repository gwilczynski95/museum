import './style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { corridorSegmentGeometry, corridorSegmentArchGeometry, arrayRotate, getRandomColorMaterial } from '../static/models/models'

// Segments config
const segmentWidth = 5.;
const segmentDepth = 4.;
const segmentHeight = 3.5;
const segmentArch = segmentWidth / 2;
const segmentsBefore = 10;  // plus x
const segmentsAfter = segmentsBefore;  // minus x

const segmentFogStart = 3;

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Fog
const fogColor = 0x969696;
const fogNear = segmentFogStart * segmentDepth;
const fogFar = segmentsBefore * segmentDepth;
const fog = new THREE.Fog(fogColor, fogNear, fogFar);
scene.fog = fog;
scene.background = new THREE.Color(fogColor);

// Player
const player = {height: 1.8, speed: 150., turnSpeed:Math.PI*0.02, mass: 10};

// Physics
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Controls
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Objects
var playerCircleGeometry = new THREE.CircleBufferGeometry(.5, 10);

// Materials

var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe:true, visible:false } );

// Mesh
const playerCircle = new THREE.Mesh(playerCircleGeometry, wireMaterial);
scene.add(playerCircle);

// Set wanted position of objects
playerCircle.rotation.set(Math.PI/2, 0, 0);

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
camera.position.z = segmentWidth / 2;
camera.rotation.order = "YXZ";
scene.add(camera)
camera.lookAt(new THREE.Vector3(1000, player.height, 0));

// place my player cube at camera
playerCircle.position.set(camera.position.x, camera.position.y / 2, camera.position.z);

// Controls
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

// my segment test
let segmentsArr = [];
let iterator = 0

for (let iter=segmentsBefore - 1; iter >= 0; iter--) {
    // var tempGeometry = corridorSegmentGeometry(segmentWidth, segmentDepth, segmentHeight);
    var tempGeometry = corridorSegmentArchGeometry(segmentWidth, segmentDepth, segmentHeight, segmentArch);
    tempGeometry.translate(camera.position.x + segmentDepth + iter * segmentDepth, 0, 0);
    let tempSegmentConfig = {
        maxX: camera.position.x + segmentDepth * 3/2 + iter * segmentDepth,
        minX: camera.position.x + segmentDepth/2 + iter * segmentDepth,
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

// var tempGeometry = corridorSegmentGeometry(segmentWidth, segmentDepth, segmentHeight);
var tempGeometry = corridorSegmentArchGeometry(segmentWidth, segmentDepth, segmentHeight, segmentArch);
let tempSegmentConfig = {
    maxX: camera.position.x + segmentDepth/2,
    minX: camera.position.x + -segmentDepth/2,
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
    // var tempGeometry = corridorSegmentGeometry(segmentWidth, segmentDepth, segmentHeight);
    var tempGeometry = corridorSegmentArchGeometry(segmentWidth, segmentDepth, segmentHeight, segmentArch);
    tempGeometry.translate(camera.position.x -segmentDepth - iter * segmentDepth, 0, 0);
    let tempSegmentConfig = {
        maxX: camera.position.x -segmentDepth/2 - iter * segmentDepth,
        minX: camera.position.x -segmentDepth * 3/2 - iter * segmentDepth,
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

const tick = () =>
{   
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
        
        // update position of the collision circle
        playerCircle.position.x = camera.position.x;
        playerCircle.position.z = camera.position.z;

        // segments update
        if (camera.position.x < segmentsArr[segmentsBefore].minX) {
            var segmentToRemove = scene.getObjectByName(`segment${segmentsArr[0].number}`)
            scene.remove(segmentToRemove);
            segmentsArr = arrayRotate(segmentsArr);
            var tempGeometry = corridorSegmentArchGeometry(segmentWidth, segmentDepth, segmentHeight, segmentArch);
            tempGeometry.translate(segmentsArr[segmentsBefore + segmentsAfter - 1].minX - segmentDepth/2, 0, 0);
            segmentsArr[segmentsBefore + segmentsAfter] = {
                maxX: segmentsArr[segmentsBefore + segmentsAfter - 1].minX,
                minX: segmentsArr[segmentsBefore + segmentsAfter - 1].minX - segmentDepth,
                number: segmentsArr[segmentsBefore + segmentsAfter - 1].number + 1,
                segment: new THREE.Mesh(tempGeometry, getRandomColorMaterial())
            }
            segmentsArr[segmentsBefore + segmentsAfter].segment.name = `segment${segmentsArr[segmentsBefore + segmentsAfter].number}`
            scene.add(segmentsArr[segmentsBefore + segmentsAfter].segment)

        } else if (camera.position.x > segmentsArr[segmentsBefore].maxX) {
            var segmentToRemove = scene.getObjectByName(`segment${segmentsArr[segmentsBefore + segmentsAfter].number}`)
            scene.remove(segmentToRemove);
            segmentsArr = arrayRotate(segmentsArr, true);
            var tempGeometry = corridorSegmentArchGeometry(segmentWidth, segmentDepth, segmentHeight, segmentArch);
            tempGeometry.translate(segmentsArr[1].maxX + segmentDepth/2, 0, 0);
            segmentsArr[0] = {
                maxX: segmentsArr[1].maxX + segmentDepth,
                minX: segmentsArr[1].maxX,
                number: segmentsArr[1].number - 1,
                segment: new THREE.Mesh(tempGeometry, getRandomColorMaterial())
            }
            segmentsArr[0].segment.name = `segment${segmentsArr[0].number}`
            scene.add(segmentsArr[0].segment)
        }
    }
    prevTime = time;

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()