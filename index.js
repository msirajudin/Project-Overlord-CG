/* Group Forming - Group 3

No  NIM Name

1   2702309984  Muhammad Sirajudin Suyuti

2   2702309901  Angel Felicia

3   2702216002  Fredrick Willson Makmun

4   2702316176  Dimas Alifio Paramudya Purboyo */



import * as THREE from "Three JS\build\three.module.js";
import { GLTFLoader } from ".\Three JS\examples\jsm\loaders\GLTFLoader";

// import { OrbitControls } from ".three/addons/controls/OrbitControls.js";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { GLTFLoader } from "./Three JS/examples/jsm/loaders/GLTFLoader";

//setup scene n renderer (kriteria Scene and Renderer poin 5)
const scene = new THREE.Scene();

//sementara use warna solid karena SKYBOX msh ERROR
scene.background = new THREE.Color(0x87CEEB)

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

//skybox (kriteria Skybox poin 5)
// const loader = new THREE.CubeTextureLoader();
// const texture = loader.load([
//     './assets/skybox/side-1.png',
//     './assets/skybox/side-3.png',
//     './assets/skybox/top.png',    
//     './assets/skybox/bottom.png',
//     './assets/skybox/side-4.png',
//     './assets/skybox/side-2.png'  
// ]);
// scene.background = texture;

//check debugging
// scene.background = new THREE.Color(0x87CEEB)
// const testBox = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({color:  0xff0000})
// );
// scene.add(testBox);

//check debugging

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
        model.position.set(0, -0.01, 3);
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
)

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