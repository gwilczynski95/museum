import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function corridorSegmentGeometry(width, depth, height) {
    // console.log('jolo');
    var plane1 = new THREE.PlaneBufferGeometry(depth, height);
    plane1.translate(0, height / 2, 0);

    var plane2 = new THREE.PlaneBufferGeometry(depth, width);
    plane2.rotateX(Math.PI / 2);
    plane2.translate(0, height, width / 2);

    var plane3 = new THREE.PlaneBufferGeometry(depth, height);
    plane3.translate(0, height / 2, width);

    var plane4 = new THREE.PlaneBufferGeometry(depth, width);
    plane4.rotateX(Math.PI / 2);
    plane4.translate(0, 0, width / 2);

    return BufferGeometryUtils.mergeBufferGeometries(
        [plane1, plane2, plane3, plane4]
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
  