import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function corridorSegmentGeometry(width, depth, height) {
    var plane1 = new THREE.PlaneBufferGeometry(depth, height);
    plane1.translate(0, height / 2, 0);

    var plane2 = new THREE.PlaneBufferGeometry(depth, width);
    plane2.rotateX(Math.PI / 2);
    plane2.translate(0, height, width / 2);  // ceiling

    var plane3 = new THREE.PlaneBufferGeometry(depth, height);
    plane3.translate(0, height / 2, width);

    var plane4 = new THREE.PlaneBufferGeometry(depth, width);
    plane4.rotateX(Math.PI / 2);
    plane4.translate(0, 0, width / 2);

    return BufferGeometryUtils.mergeBufferGeometries(
        [plane1, plane2, plane3, plane4]
    );
}

export function corridorSegmentArchGeometry(width, depth, wallHeight, archCurve) {
    var plane1 = new THREE.PlaneBufferGeometry(depth, wallHeight);
    plane1.translate(0, wallHeight / 2, 0);


    var plane2 = new THREE.PlaneBufferGeometry(width, depth, 10, 1);
    planeCurve(plane2, archCurve);
    plane2.rotateX(Math.PI / 2);
    // plane2.rotateZ(Math.PI / 2);
    plane2.rotateY(Math.PI / 2);
    // plane2.translate(0, wallHeight, width / 2);
    plane2.translate(0, wallHeight, width / 2);
    // plane2.translate(0, 3, 0);

    var plane3 = new THREE.PlaneBufferGeometry(depth, wallHeight);
    plane3.translate(0, wallHeight / 2, width);

    var plane4 = new THREE.PlaneBufferGeometry(depth, width);
    plane4.rotateX(Math.PI / 2);
    plane4.translate(0, 0, width / 2);

    return BufferGeometryUtils.mergeBufferGeometries(
        [
            plane1, 
            plane2, 
            plane3, 
            plane4
        ]
    );
}

// Utils function, should be elsewhere
export function arrayRotate(arr, reverse) {
    if (reverse) arr.unshift(arr.pop());
    else arr.push(arr.shift());
    return arr;
}


export function getRandomColorMaterial() {
    const material = new THREE.MeshStandardMaterial();
    material.color = new THREE.Color(getRandomRgb());
    material.side = THREE.DoubleSide;
    return material;
}

function getRandomRgb() {
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = num >> 8 & 255;
    var b = num & 255;
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }


function planeCurve(plane, curve){

    let p = plane.parameters;
    let hw = p.width * 0.5;

    let a = new THREE.Vector2(-hw, 0);
    let b = new THREE.Vector2(0, curve);
    let c = new THREE.Vector2(hw, 0);

    let ab = new THREE.Vector2().subVectors(a, b);
    let bc = new THREE.Vector2().subVectors(b, c);
    let ac = new THREE.Vector2().subVectors(a, c);

    let r = (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));

    let center = new THREE.Vector2(0, curve - r);
    let baseV = new THREE.Vector2().subVectors(a, center);
    let baseAngle = baseV.angle() - (Math.PI * 0.5);
    let arc = baseAngle * 2;

    let uv = plane.attributes.uv;
    let pos = plane.attributes.position;
    let mainV = new THREE.Vector2();
    for (let i = 0; i < uv.count; i++){
        let uvRatio = 1 - uv.getX(i);
        let y = pos.getY(i);
        mainV.copy(c).rotateAround(center, (arc * uvRatio));
        pos.setXYZ(i, mainV.x, y, -mainV.y);
    }

    pos.needsUpdate = true;

}
