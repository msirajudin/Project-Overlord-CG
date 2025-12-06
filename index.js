/* Group Forming - Group 3
No  NIM Name
1   2702309984  Muhammad Sirajudin Suyuti
2   2702309901  Angel Felicia
3   2702216002  Fredrick Willson Makmun
4   2702316176  Dimas Alifio Paramudya Purboyo */

import * as THREE from "./Three JS/build/three.module.js";
import { OrbitControls } from "./Three JS/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./Three JS/examples/jsm/loaders/GLTFLoader.js";
import { FontLoader } from "./Three JS/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "./Three JS/examples/jsm/geometries/TextGeometry.js";

// glob var utk dark warrior
let momongaObj = null;
const MOVEMENT_SPEED = 0.1; 
const ROTATION_SPEED = 0.05; 

// glob var utk Spell Circle
let spellCircle = null;
let spellLight = null;
let isSpellActive = false;

// glob var utk Hamsuke Interaction (Raycast)
let hamsukeBodyMesh = null; 
let isHappy = true; 
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// state tombol keyboard
const keys = {
    w: false, a: false, s: false, d: false,
    q: false, e: false
};

let currentCamera;
let thirdPersonCam;
let firstPersonCam;

//setup scene n renderer
const scene = new THREE.Scene();

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

//camera setup
thirdPersonCam = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 2000
);
thirdPersonCam.position.set(6, 3, 5);
thirdPersonCam.lookAt(0, 0, 0);

firstPersonCam = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 2000
);
firstPersonCam.position.set(0, 1.8, 0); //sebelumnya menggunakan (0, 100, 13) agar sesuai pada wajah yg dimana sesuai parameter soal itu terlihat seperti di kaki, namun kami menyesuaikan kembali dengan parameter soal yakni (0, 1.8, 0). terima kasih 

currentCamera = thirdPersonCam;

const controls = new OrbitControls(thirdPersonCam, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

//lights setup
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xFFFFFF, 1.2);
spotLight.position.set(0, 10, 0);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.distance = 1000; 
scene.add(spotLight);

const dirLight = new THREE.DirectionalLight(0xFFFFEE, 0.5);
dirLight.position.set(5, 2, 8);
scene.add(dirLight);

spellLight = new THREE.PointLight(0xFFD700, 2, 3);
spellLight.visible = false; 
scene.add(spellLight);

// momonga load Model
const gltfLoader = new GLTFLoader();
gltfLoader.load('./assets/models/momonga_ainz_ooal_gown/scene.gltf',
    (gltf) => {
        const model = gltf.scene;
        momongaObj = model;

        model.position.set(0, -0.01, 3); 
        model.scale.set(0.01, 0.01, 0.01);
        model.rotation.set(0, Math.PI/2, 0);

        momongaObj.add(firstPersonCam);
        // firstPersonCam.rotation.set(0, -Math.PI, 0); sebelumnya menggunakan ini agar posisi sedikit menghadap kedepan, namun kami jadi ikut parameter soal
        firstPersonCam.lookAt(1, 1.8, 0); //sesuai parameter soal

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

// gorund
function createGround() {
    const geo = new THREE.BoxGeometry(25, 2, 25); 
    const txtLoader = new THREE.TextureLoader();
    
    const grassTex = txtLoader.load('./assets/textures/grass/rocky_terrain_02_diff_1k.jpg');
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.set(20, 20); 

    const mat = new THREE.MeshStandardMaterial({ 
        map: grassTex,
        roughness: 0.8,
        color: 0xFFFFFF 
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -1, 0);
    mesh.receiveShadow = true;      
    scene.add(mesh);
    console.log("Ground muncul");
}
createGround(); 

// Hamsuke, 100% mengikuti parameter soal walau hasilnya memiliki kejanggalan di bagian telinga karena berbeda warna dan memiliki arah dan posisi yang kurang tepat. 
function createHamsuke() {
    const hamsukeGroup = new THREE.Group();

    const texLoader = new THREE.TextureLoader();
    const texFrontHappy = texLoader.load('./assets/textures/hamsuke/front_happy.png');
    const texFrontSad = texLoader.load('./assets/textures/hamsuke/front_sad.png');
    const texSide = texLoader.load('./assets/textures/hamsuke/side.png');
    const texTopBack = texLoader.load('./assets/textures/hamsuke/top&back.png');
    
    const bodyMaterials = [
        new THREE.MeshPhongMaterial({ map: texSide }),        
        new THREE.MeshPhongMaterial({ map: texSide }),      
        new THREE.MeshPhongMaterial({ map: texTopBack }),     
        new THREE.MeshPhongMaterial({ map: texTopBack }),    
        new THREE.MeshPhongMaterial({ map: texFrontHappy }),     
        new THREE.MeshPhongMaterial({ map: texTopBack })     
    ];
    const bodyGeo = new THREE.BoxGeometry(2, 2, 2); 
    hamsukeBodyMesh = new THREE.Mesh(bodyGeo, bodyMaterials);
    hamsukeBodyMesh.position.set(3, 1, -1);
    hamsukeBodyMesh.rotation.set(0, Math.PI / 8, 0);
    hamsukeBodyMesh.castShadow = true;
    hamsukeBodyMesh.receiveShadow = true;
    
    hamsukeBodyMesh.userData = { texHappy: texFrontHappy, texSad: texFrontSad };
    hamsukeGroup.add(hamsukeBodyMesh);

    const tailMainGeo = new THREE.BoxGeometry(0.6, 2.8, 0.6);
    const tailMat = new THREE.MeshPhongMaterial({ color: 0x023020 }); 
    const tailMain = new THREE.Mesh(tailMainGeo, tailMat);
    tailMain.position.set(2.6, 1.4, -2.25);
    tailMain.rotation.set(0, Math.PI / 8, 0);
    tailMain.castShadow = true;
    hamsukeGroup.add(tailMain);

    const tailExtGeo = new THREE.BoxGeometry(0.6, 0.6, 1.4);
    const tailExt = new THREE.Mesh(tailExtGeo, tailMat);
    tailExt.position.set(2.44, 2.8, -2.62);
    tailExt.rotation.set(0, Math.PI / 8, Math.PI / 2);
    tailExt.castShadow = true;
    hamsukeGroup.add(tailExt);

    const earGeo = new THREE.ConeGeometry(0.2, 0.7, 128); 
    const earMatLeft = new THREE.MeshPhongMaterial({ color: 0x023020 }); 
    const earL = new THREE.Mesh(earGeo, earMatLeft);
    earL.position.set(4.05, 2.2, -0.6);
    earL.rotation.set(0, 0, -Math.PI / 8);     
    earL.castShadow = true;
    hamsukeGroup.add(earL);

    const earMatRight = new THREE.MeshPhongMaterial({ color: 0x6B6860 }); 
    const earR = new THREE.Mesh(earGeo, earMatRight);
    earR.position.set(2.5, 2.2, 0);
    earR.rotation.set(0, 0, -Math.PI / 8);    
    earR.castShadow = true;
    hamsukeGroup.add(earR);

    return hamsukeGroup;
}
const hamsuke = createHamsuke();
hamsuke.position.set(0, 0, 0); 
scene.add(hamsuke);

// Pohon #StopTebangPohonMasal = longsor
function createTrees() {
    const treeGroup = new THREE.Group();
    const texLoader = new THREE.TextureLoader();
    const trunkTex = texLoader.load('./assets/textures/tree/chinese_cedar_bark_diff_1k.jpg');
    const trunkGeo = new THREE.CylinderGeometry(0.6, 0.6, 3, 32);
    const trunkMat = new THREE.MeshStandardMaterial({
        map: trunkTex,
        color: 0xFFFFFF
    });

    //sepsifikasi sesuai permintaan soal
    const botLeafGeo = new THREE.ConeGeometry(3, 4, 32);
    const topLeafGeo = new THREE.ConeGeometry(2.1, 2.8, 32);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x374F2F });
    const positions = [
        { x: -5, z: -5 },
        { x: 7, z: -6 },
        { x: -8, z: 8 }
    ];

    positions.forEach(pos => {
        //trunk
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(pos.x, 1.5, pos.z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);

        //bottom leaves
        const bLeaf = new THREE.Mesh(botLeafGeo, leafMat);
        bLeaf.position.set(pos.x, 4, pos.z);
        bLeaf.castShadow = true;
        bLeaf.receiveShadow = true;
        treeGroup.add(bLeaf);

        //top leaves
        const tLeaf = new THREE.Mesh(topLeafGeo, leafMat);
        tLeaf.position.set(pos.x, 6, pos.z);
        tLeaf.castShadow = true;
        tLeaf.receiveShadow = true;
        treeGroup.add(tLeaf);
    });
    return treeGroup;
}
const trees = createTrees();
scene.add(trees);

// 3d text overlord)
function create3DText() {
    const fontLoader = new FontLoader();
    fontLoader.load('./Three JS/examples/fonts/helvetiker_bold.typeface.json', (font) => {
        
        const textGeo = new TextGeometry('OVerlord', {
            font: font,
            size: 1,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: false 
        });
        const textMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF
        });
        const textMesh = new THREE.Mesh(textGeo, textMat);
        
        // posisi n rotasi sesuai soal
        textMesh.position.set(-6, 4, 5);
        textMesh.rotation.set(0, Math.PI / 2, 0);
        
        textMesh.castShadow = true;
        textMesh.receiveShadow = true;

        scene.add(textMesh);
        console.log("Text Overlord muncul");
    });
}
create3DText();

// spell circle
function createSpellCircle() {
    const spellGroup = new THREE.Group();

    const spellMat = new THREE.MeshPhongMaterial({
        color: 0xDAA520,
        emissive: 0xFFCC00,
        emissiveIntensity: 2,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });

    const innerGeo = new THREE.RingGeometry(1, 1.2, 64);
    const innerRing = new THREE.Mesh(innerGeo, spellMat);
    innerRing.rotation.set(-Math.PI / 2, 0, 0); 
    innerRing.position.set(0, 0.02, 0); 
    spellGroup.add(innerRing);

    const outerGeo = new THREE.RingGeometry(1.8, 2, 64);
    const outerRing = new THREE.Mesh(outerGeo, spellMat);
    outerRing.rotation.set(-Math.PI / 2, 0, 0);
    outerRing.position.set(0, 0.02, 0);
    spellGroup.add(outerRing);

    const pointerGeo = new THREE.BoxGeometry(0.05, 4, 0.01);
    const p1 = new THREE.Mesh(pointerGeo, spellMat);
    p1.rotation.set(Math.PI/2, 0, Math.PI/2); 
    p1.position.set(0, 0.01, 0); 
    spellGroup.add(p1);

    const p2 = new THREE.Mesh(pointerGeo, spellMat);
    p2.rotation.set(Math.PI/2, 0, 0);
    p2.position.set(0, 0.02, 0);
    spellGroup.add(p2);

    spellGroup.visible = false; 
    return spellGroup;
}
spellCircle = createSpellCircle();
scene.add(spellCircle);


// event listener
window.addEventListener('resize', function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// listener utk raycast happy/sad
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, currentCamera);

    if(hamsukeBodyMesh) {
        const intersects = raycaster.intersectObject(hamsukeBodyMesh);
        if(intersects.length > 0) {
            isHappy = !isHappy;
            
            if(isHappy) {
                hamsukeBodyMesh.material[4].map = hamsukeBodyMesh.userData.texHappy;
                console.log("Hamsuke senang! :D");
            } else {
                hamsukeBodyMesh.material[4].map = hamsukeBodyMesh.userData.texSad;
                console.log("Hamsuke sedih... :(");
            }
            hamsukeBodyMesh.material[4].needsUpdate = true;
        }
    }
});

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase(); 
    
    if (key === 'v') { 
        if (currentCamera === thirdPersonCam) {
            currentCamera = firstPersonCam;
            controls.enabled = false; 
            console.log("Ganti ke First Person");
        } else {
            currentCamera = thirdPersonCam;
            controls.enabled = true; 
            console.log("Ganti ke Third Person");
        }
    }
    if (event.code === 'Space') { 
        if (spellCircle && spellLight) {
            isSpellActive = !isSpellActive; 
            spellCircle.visible = isSpellActive;
            spellLight.visible = isSpellActive;
            console.log("Spell Menyala..!:", isSpellActive);
        }
    }
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

//animation
function animate(){
    requestAnimationFrame(animate);
    
    if (momongaObj) {
        if (keys.q) momongaObj.rotation.y += ROTATION_SPEED;
        if (keys.e) momongaObj.rotation.y -= ROTATION_SPEED;
        if (keys.w) momongaObj.translateZ(MOVEMENT_SPEED);  
        if (keys.s) momongaObj.translateZ(-MOVEMENT_SPEED); 
        if (keys.a) momongaObj.translateX(MOVEMENT_SPEED);  
        if (keys.d) momongaObj.translateX(-MOVEMENT_SPEED); 

        if (spellCircle && spellLight) {
            spellCircle.position.x = momongaObj.position.x;
            spellCircle.position.z = momongaObj.position.z;
            spellLight.position.set(
                momongaObj.position.x, 
                momongaObj.position.y + 0.5, 
                momongaObj.position.z
            );
            if(isSpellActive) {
                spellCircle.rotation.y += 0.02;
            }
        }
    }
    controls.update();
    renderer.render(scene, currentCamera);
}
animate();
//THANK YOU