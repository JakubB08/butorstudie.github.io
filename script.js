import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

// ------------------------
// Hlavní 3D scénu
// ------------------------
const container3D = document.getElementById("container3D");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,1,0.1,1000);
camera.position.set(0,0,3.5);

const renderer = new THREE.WebGLRenderer({alpha:true});
container3D.appendChild(renderer.domElement);

const topLight = new THREE.DirectionalLight(0xffffff,1);
topLight.position.set(500,500,500);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333,1);
scene.add(ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 10;

const loader = new GLTFLoader();
let object = null;

function disposeObject(obj){
    if(!obj) return;
    obj.traverse(child=>{
        if(child.isMesh){
            child.geometry.dispose();
            if(Array.isArray(child.material)){
                child.material.forEach(mat=>{
                    mat.dispose();
                    if(mat.map) mat.map.dispose();
                });
            } else {
                child.material.dispose();
                if(child.material.map) child.material.map.dispose();
            }
        }
    });
    scene.remove(obj);
}

// ------------------------
// Model konfigurace
// ------------------------
const modelConfigs = {
    // hlavní modely
    "c1": { scale:0.12, position:[0,0,0] },
    "c2": { scale:0.12, position:[0,0,0] },
    "krcni": { scale:0.13, position:[0,0.05,0] },
    "hrudni": { scale:0.11, position:[0,0,-0.05] },
    "bederni": { scale:0.12, position:[0,0,0] },
    "kostrc": { scale:0.1, position:[0,-0.1,0] },
    "krizova": { scale:0.12, position:[0,0,0] },
    "hrudni_kost": { scale:0.12, position:[0,0,0] },
    "neprave": { scale:0.12, position:[0,0,0] },
    "prave": { scale:0.12, position:[0,0,0] },
    "volne": { scale:0.12, position:[0,0,0] },

    // podsoučástky páteře
    "c1_pozice_best": { scale:0.1, position:[0,1,0] },
    "c2_pozice_best": { scale:0.1, position:[0,1,0] },
    "krcni_pozice_best": { scale:0.1, position:[0,1,0] },
    "hrudni_pozice_best": { scale:0.1, position:[0,1,0] },
    "bederni_pozice_best": { scale:0.1, position:[0,1,0] },
    "kostrc_pozice_best": { scale:0.1, position:[0,1,0] },
    "krizova_pozice_best": { scale:0.1, position:[0,1,0] },

    // modely při nevybrání podsoučástky
    "hrud_pater_best": { scale:0.12, position:[0,0,0] },
    "hrudnik": { scale:0.12, position:[0,0,0] },
    "pater_best": { scale:0.12, position:[0,0,0] }
};

function loadModel(name){
    if(object){ disposeObject(object); object=null; }

    loader.load(`./${name}.glb`, gltf=>{
        object = gltf.scene;
        const cfg = modelConfigs[name] || { scale:0.12, position:[0,0,0] };
        object.scale.set(cfg.scale,cfg.scale,cfg.scale);
        object.position.set(...cfg.position);
        scene.add(object);
    });
}

function updateInfo(name, text){
    document.querySelector("#info h2").textContent = name;
    if(text) document.getElementById("bone-text").textContent = text;
}

// resize
function resize(){
    renderer.setSize(container3D.clientWidth,container3D.clientHeight);
    camera.aspect = container3D.clientWidth/container3D.clientHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener("resize",resize);
resize();

function animate(){ requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera);}
animate();

// ------------------------
// UI logika hlavní režim
// ------------------------
const chestBtn = document.getElementById("show-chest-btn");
const spineBtn = document.getElementById("show-spine-btn");
const chestList = document.getElementById("chest-list");
const spineList = document.getElementById("spine-list");
const boneText = document.getElementById("bone-text");
const modeSwitch = document.getElementById("mode-switch");
const btnDetail = document.getElementById("btn-detail");
const btnPosition = document.getElementById("btn-position");

let currentMode = "single";
let currentModel = "";

chestBtn.addEventListener("click", ()=>{
    chestList.style.display="flex";
    spineList.style.display="none";
    boneText.textContent="Vyber část hrudníku";
    modeSwitch.style.display="none";
});
spineBtn.addEventListener("click", ()=>{
    spineList.style.display="flex";
    chestList.style.display="none";
    boneText.textContent="Vyber část páteře";
    modeSwitch.style.display="none";
});

document.querySelectorAll("#chest-list li, #spine-list li[data-model]").forEach(li=>{
    li.addEventListener("click", ()=>{
        document.querySelectorAll("#chest-list li, #spine-list li[data-model]").forEach(i=>i.classList.remove("active"));
        li.classList.add("active");
        currentModel = li.dataset.model;
        currentMode = li.dataset.mode || "single";
        updateInfo(li.dataset.name);
        if(currentMode==="dual"){
            modeSwitch.style.display="block";
            loadModel(`${currentModel}_pozice_best`);
        } else {
            modeSwitch.style.display="none";
            loadModel(currentModel);
        }
    });
});

btnDetail.addEventListener("click", ()=>{ if(currentModel) loadModel(currentModel); });
btnPosition.addEventListener("click", ()=>{ if(currentModel) loadModel(`${currentModel}_pozice_best`); });

// ------------------------
// Testovací režim
// ------------------------
const testBtn = document.getElementById('test-mode-btn');
const counterEl = document.getElementById('progress-counter');
const exitBtn = document.getElementById('exit-test-btn');
const testContainer = document.getElementById('test-container');
const listContainer = document.getElementById('test-bones-list');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const resultEl = document.getElementById('result');
let testScene, testCamera, testRenderer, testControls, testObject=null;
let allBones=[], remainingBones=[], totalBonesCount=0, correctCount=0, currentBone=null;

function initTest3D(){
    testScene = new THREE.Scene();
    const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(5,5,5);
testScene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x888888, 0.8);
testScene.add(ambientLight);
    testCamera = new THREE.PerspectiveCamera(45, testContainer.clientWidth/testContainer.clientHeight, 0.1, 1000);
    testCamera.position.set(0,1.5,3);
    testRenderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    testRenderer.setSize(testContainer.clientWidth/2, testContainer.clientHeight);
    document.getElementById('test-3d').appendChild(testRenderer.domElement);

    testControls = new OrbitControls(testCamera,testRenderer.domElement);
    testControls.enableDamping=true;

    animateTest();
}

function animateTest(){
    requestAnimationFrame(animateTest);
    if(testControls) testControls.update();
    if(testRenderer) testRenderer.render(testScene,testCamera);
}

function loadTestModel(name){
    if(testObject) testScene.remove(testObject);

    loader.load(`./${name}.glb`, gltf=>{
        testObject = gltf.scene;

        // získej velikost modelu
        const box = new THREE.Box3().setFromObject(testObject);
        const size = new THREE.Vector3();
        box.getSize(size);

        // spočítej největší rozměr a nastav uniformní scale
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 0.9 / maxDim; // zmenšení a zachování poměru
        testObject.scale.setScalar(scaleFactor);

        // vycentruj model
        const center = new THREE.Vector3();
        box.getCenter(center);
        testObject.position.sub(center.multiplyScalar(scaleFactor));

        testScene.add(testObject);
    });
}

const testModels = [
  "c1", "c2", "krcni", "hrudni", "bederni", 
  "kostrc", "krizova", "hrudni_kost", "neprave", 
  "prave", "volne"
];

function prepareBones(){
    allBones = testModels.map(name => {
        const cfg = modelConfigs[name];
        const baseScale = cfg.scale || 0.12;
        const scale = baseScale * 0.9; // zmenšení o 10 % pro testovací mód
        return { 
            model: name, 
            name: name, 
            scale: [scale, scale, scale], 
            position: cfg.position 
        };
    });

    remainingBones = allBones.slice();
    totalBonesCount = remainingBones.length;
    correctCount = 0;
    updateCounter();
}

function updateCounter(){ counterEl.textContent=`${correctCount}/${totalBonesCount}`; }

function populateTestList(){
    listContainer.innerHTML='';
    allBones.forEach(b=>{
        const li = document.createElement('li');
        li.textContent = b.name;
        li.addEventListener('click', ()=>{
            listContainer.querySelectorAll('li').forEach(i=>i.classList.remove('selected'));
            li.classList.add('selected');
        });
        listContainer.appendChild(li);
    });
}

function loadNextTest(){
    if(!remainingBones.length){
        resultEl.textContent=`Hotovo! Skóre: ${correctCount}/${totalBonesCount}`;
        submitBtn.style.display='none';
        nextBtn.style.display='none';
        return;
    }
    const index = Math.floor(Math.random()*remainingBones.length);
    currentBone = remainingBones[index];
    loadTestModel(currentBone.model);
    resultEl.textContent='';
    listContainer.querySelectorAll('li').forEach(li=>li.classList.remove('selected'));
    submitBtn.style.display='block';
    nextBtn.style.display='none';
    updateCounter();
}

submitBtn.addEventListener('click', ()=>{
    const selected = listContainer.querySelector('li.selected');
    if(!selected){ resultEl.textContent='Vyber kost!'; return; }
    if(selected.textContent === currentBone.name){
        resultEl.textContent='✅ Správně!';
        remainingBones = remainingBones.filter(b=>b.model!==currentBone.model);
        correctCount++;
    } else resultEl.textContent=`❌ Špatně! Správná odpověď: ${currentBone.name}`;
    updateCounter();
    submitBtn.style.display='none';
    nextBtn.style.display='block';
});

nextBtn.addEventListener('click', ()=>{ loadNextTest(); });

// tlačítko TEST
testBtn.addEventListener('click', ()=>{
    document.getElementById('container').style.display='none';
    testContainer.style.display='flex';
    testBtn.style.display='none';
    exitBtn.style.display='inline-block'; // zobraz EXIT
    initTest3D();
    prepareBones();
    populateTestList();
    loadNextTest();
});


// tlačítko EXIT testu
testContainer.querySelector('#exit-test-btn')?.addEventListener('click', ()=>{
    testContainer.style.display='none';
    document.getElementById('container').style.display='flex';
    testBtn.style.display='block';
    if(testRenderer && testRenderer.domElement.parentElement){
        testRenderer.domElement.parentElement.removeChild(testRenderer.domElement);
        testRenderer=null;
        testScene=null;
        testCamera=null;
    }
});

window.addEventListener('resize', ()=>{
    resize();
    if(testRenderer){
        testRenderer.setSize(testContainer.clientWidth/2, testContainer.clientHeight);
        testCamera.aspect = (testContainer.clientWidth/2)/testContainer.clientHeight;
        testCamera.updateProjectionMatrix();
    }
});

testContainer.querySelector('#exit-test-btn')?.addEventListener('click', ()=>{
    testContainer.style.display='none';
    document.getElementById('container').style.display='flex';
    testBtn.style.display='block';
    if(testRenderer && testRenderer.domElement.parentElement){
        testRenderer.domElement.parentElement.removeChild(testRenderer.domElement);
        testRenderer = null;
        testScene = null;
        testCamera = null;
    }
});

exitBtn.addEventListener('click', ()=>{
    // Ukončení testu a návrat
    testContainer.style.display='none';
    document.getElementById('container').style.display='flex';

    testBtn.style.display='inline-block'; // znovu zobraz TEST
    exitBtn.style.display='none';          // skryj EXIT

    // Odstraníme Three.js renderer
    if(testRenderer && testRenderer.domElement.parentElement){
        testRenderer.domElement.parentElement.removeChild(testRenderer.domElement);
        testRenderer = null;
        testScene = null;
        testCamera = null;
    }

    // Obnovíme stav výběru a info
    chestList.style.display='none';
    spineList.style.display='none';
    boneText.textContent="Vyber podsoučástku pro zobrazení modelu.";
    modeSwitch.style.display='none';
    currentModel = "";
});