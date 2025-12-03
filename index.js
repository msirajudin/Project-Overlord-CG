/* Group Forming - Group 3
No  NIM Name
1   2702309984  Muhammad Sirajudin Suyuti
2   2702309901  Angel Felicia
3   2702216002  Fredrick Willson Makmun
4   2702316176  Dimas Alifio Paramudya Purboyo */

import * as THREE from "./Three JS/build/three.module.js";
import { OrbitControls } from "./Three JS/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./Three JS/examples/jsm/loaders/GLTFLoader.js";

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
//a. Third Person Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(6, 3, 5);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
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
        //requirements ada di soal hal 7
        model.position.set(0, -0.51, 3);
        model.scale.set(0.01, 0.01, 0.01);
        model.rotation.set(0, Math.PI/2, 0);

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
    console.log("Ground deployed!");

}
createGround(); 

//Hamsuke atau Hamster
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

function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();