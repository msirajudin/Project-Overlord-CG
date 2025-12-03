/* Group Forming - Group 3
No  NIM Name
1   2702309984  Muhammad Sirajudin Suyuti
2   2702309901  Angel Felicia
3   2702216002  Fredrick Willson Makmun
4   2702316176  Dimas Alifio Paramudya Purboyo */

import * as THREE from "./Three JS/build/three.module.js";
import { OrbitControls } from "./Three JS/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./Three JS/examples/jsm/loaders/GLTFLoader.js";

// flob var utk dark warrior
let momongaObj = null;
const MOVEMENT_SPEED = 0.1; 
const ROTATION_SPEED = 0.05; 

// state tombol keyboard
const keys = {
    w: false, a: false, s: false, d: false,
    q: false, e: false
};

let currentCamera; // Kamera yang sedang aktif dirender
let thirdPersonCam;
let firstPersonCam; // Kamera baru

//setup scene n renderer (kriteria Scene and Renderer poin 5)
const scene = new THREE.Scene();

//sementara use warna solid karena SKYBOX msh ERROR
// scene.background = new THREE.Color(0x87CEEB);

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    './assets/skybox/side-1.png', 
    './assets/skybox/side-3.png', 
    './assets/skybox/top.png',    
    './assets/skybox/bottom.png', 
    './assets/skybox/side-4.png', 
    './assets/skybox/side-2.png'
]);
scene.background = texture;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);
//^beberapa disetting sesuai permintaan di soal

//setup camera (kriteria Camera poin 10)
// --- CAMERA SETUP (Revisi Dual Camera) ---

// a. Third Person Camera (Setup Lama)
thirdPersonCam = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
thirdPersonCam.position.set(6, 3, 5);
thirdPersonCam.lookAt(0, 0, 0);

// b. First Person Camera (Setup Baru)
firstPersonCam = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
// Posisi relatif terhadap kepala Momonga (y=1.8)
firstPersonCam.position.set(0, 100, 13); 
// Rotation nanti dihandle pas attach ke momonga

// Set Default Camera
currentCamera = thirdPersonCam;

// Orbit Controls (Hanya untuk Third Person)
const controls = new OrbitControls(thirdPersonCam, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

//Lights kriteria poin 10
//ambientLight
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
scene.add(ambientLight);

//spotLight
const spotLight = new THREE.SpotLight(0xFFFFFF, 1.2);
spotLight.position.set(0, 10, 0);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
scene.add(spotLight);

//directionalLight
const dirLight = new THREE.DirectionalLight(0xFFFFEE, 0.5);
dirLight.position.set(5, 2, 8);
scene.add(dirLight);

//momonga loadModel
const gltfLoader = new GLTFLoader();
gltfLoader.load('./assets/models/momonga_ainz_ooal_gown/scene.gltf',
    (gltf) => {
        const model = gltf.scene;
        
        momongaObj = model; // simpan ke var global

        //posisi kuubah ke -0.18 krn kalau sesuai soal -0.01 agak melayang kak.
        model.position.set(0, -0.18, 3); 
        
        model.scale.set(0.01, 0.01, 0.01);
        model.rotation.set(0, Math.PI/2, 0);

        // --- ATTACH CAMERA TO MOMONGA ---
        // Masukkan kamera FPS ke dalam grup Momonga biar ikut gerak
        momongaObj.add(firstPersonCam);

        // Fix rotasi kamera biar ga liat kuping (putar 90 derajat dr posisi model)
        // Kita paksa kameranya menghadap depan (Local Axis)
        firstPersonCam.rotation.set(0, -Math.PI, 0);

        model.traverse((node) => {
            if(node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(model);
        console.log("Momonga summon");
    },
    undefined, (error) => {
        console.error("gagal mengsummon Momonga :(", error);
    }
);

//Ground/Tanah
function createGround() {
    const geo = new THREE.BoxGeometry(25, 25); 
    const txtLoader = new THREE.TextureLoader();
    
    const grassTex = txtLoader.load('./assets/textures/grass/rocky_terrain_02_diff_1k.jpg');
    
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(20, 20); 

    const mat = new THREE.MeshStandardMaterial({ 
        map: grassTex,
        roughness: 0.8 
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2; 
    mesh.receiveShadow = true;      
    mesh.position.set(0, -1, 0)

    scene.add(mesh);
    console.log("Ground muncul");

}
createGround(); 

///Hamsuke atau Hamster
function createHamsuke() {
    const hamsukeGroup = new THREE.Group();


    const texLoader = new THREE.TextureLoader();
    const texFront = texLoader.load('./assets/textures/hamsuke/front_happy.png');
    const texSide = texLoader.load('./assets/textures/hamsuke/side.png');
    const texTopBack = texLoader.load('./assets/textures/hamsuke/top&back.png');
   
    const bodyMaterials = [
        new THREE.MeshStandardMaterial({ map: texSide }),        
        new THREE.MeshStandardMaterial({ map: texSide }),      
        new THREE.MeshStandardMaterial({ map: texTopBack }),    
        new THREE.MeshStandardMaterial({ map: texTopBack }),    
        new THREE.MeshStandardMaterial({ map: texFront }),      
        new THREE.MeshStandardMaterial({ map: texTopBack })    
    ];


    const bodyGeo = new THREE.BoxGeometry(3, 2.5, 3);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterials);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    hamsukeGroup.add(bodyMesh);


    const earGeo = new THREE.ConeGeometry(0.2,0.7,128);
    // kuping kiri
    const earMatLeft = new THREE.MeshStandardMaterial({ color: 0x6B6860 });
    const earL = new THREE.Mesh(earGeo, earMatLeft);
    earL.position.set(-1.2, 1.5, 1.3);
    earL.rotation.set(0, 0, 0.2);    
    earL.castShadow = true;
    hamsukeGroup.add(earL);


    // kuping kanan
    const earMatRight = new THREE.MeshStandardMaterial({ color: 0x6B6860 });
    const earR = new THREE.Mesh(earGeo, earMatRight);
    earR.position.set(1.2,1.5,1.3);
    earR.rotation.set(0,0,-0.2);    
    earR.castShadow = true;
    hamsukeGroup.add(earR);


    // ekor
    const tailGeo = new THREE.BoxGeometry(0.8,0.8, 1.4);
    const tailMat = new THREE.MeshStandardMaterial({ color: 0x023020 });
    const tailMesh = new THREE.Mesh(tailGeo, tailMat);
    tailMesh.position.set(0.1, 1.7, -1.3);
    tailMesh.rotation.set(-Math.PI / 2,0,0);
    tailMesh.castShadow = true;
    tailMesh.receiveShadow = true;
    hamsukeGroup.add(tailMesh);


    return hamsukeGroup;
}


const hamsuke = createHamsuke();

hamsuke.position.set(1.8, 0.75, -1.95); 
hamsuke.rotation.set(0, 0.5, 0); 
scene.add(hamsuke);

window.addEventListener('resize', function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// event listener keyboard
window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase(); // biar case insensitive (W or w sama aja)
    
    // 1. Logic Switch Kamera (V)
    if (key === 'v') { 
        if (currentCamera === thirdPersonCam) {
            currentCamera = firstPersonCam;
            controls.enabled = false; // Matikan orbit kalau lagi FPS
            console.log("Switched to First Person");
        } else {
            currentCamera = thirdPersonCam;
            controls.enabled = true; // Nyalakan orbit lagi
            console.log("Switched to Third Person");
        }
    }

    // 2. Logic Movement (WASD) - Disatukan biar gak ketimpa
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
    }
});

window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
    }
});

function animate(){
    requestAnimationFrame(animate);
    
    // movementLogic, gerakan dark warrior
    if (momongaObj) {
        // rotasi (Q/E)
        if (keys.q) momongaObj.rotation.y += ROTATION_SPEED;
        if (keys.e) momongaObj.rotation.y -= ROTATION_SPEED;

        // gerakan (W/A/S/D)
        if (keys.w) momongaObj.translateZ(MOVEMENT_SPEED);  //maju
        if (keys.s) momongaObj.translateZ(-MOVEMENT_SPEED); //mundur
        if (keys.a) momongaObj.translateX(MOVEMENT_SPEED);  //kiri
        if (keys.d) momongaObj.translateX(-MOVEMENT_SPEED); //kanan
    }

    controls.update();
    
    // render kamera yg lagi aktif aja
    renderer.render(scene, currentCamera);
}

animate();