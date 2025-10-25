import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// === Hlavní 3D poznávačka ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(0,0,3.5);

const renderer = new THREE.WebGLRenderer({ alpha:true });
document.getElementById("container3D").appendChild(renderer.domElement);

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
controls.target.set(0,0,0);
controls.update();

// === Funkce pro zničení objektu ===
function disposeObject(obj, sceneToRemove) {
    if (!obj) return;
    obj.traverse(child => {
        if (child.isMesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                    mat.dispose();
                    if (mat.map) mat.map.dispose();
                });
            } else {
                child.material.dispose();
                if (child.material.map) child.material.map.dispose();
            }
        }
    });
    sceneToRemove.remove(obj);
}

// === Data pro ověřování ===
const theoryFacts = {
  "front04":[{text:"Tvoří přední část lebky a horní okraj očnic.",correct:true},{text:"Obsahuje čelní dutiny, které snižují hmotnost lebky.",correct:true},{text:"Spojuje se s temenní, nosní a klínovou kostí.",correct:true},{text:"Obsahuje kloubní výběžek, který tvoří čelistní kloub.",correct:false},{text:"Tvoří zadní část mozkovny spolu s týlní kostí.",correct:false}],
  "cich":[{text:"Nachází se mezi očnicemi a tvoří část nosní přepážky.",correct:true},{text:"Lamina cribrosa umožňuje průchod čichových nervů.",correct:true},{text:"Podílí se na stavbě nosní přepážky a očnice.",correct:true},{text:"Obsahuje čelistní dutiny pro horní zuby.",correct:false},{text:"Spojuje se přímo s dolní čelistí.",correct:false}],
  "dolnicel02":[{text:"Tvoří dolní hranici obličeje a je pohyblivá.",correct:true},{text:"Umožňuje pohyb dolní čelisti při žvýkání a mluvení.",correct:true},{text:"Uvnitř vede mandibulární kanálek s cévami a nervy pro dolní zuby.",correct:true},{text:"Obsahuje čelistní dutiny jako součást vedlejších dutin nosních.",correct:false},{text:"Spojuje se s čelní kostí.",correct:false}],
  "hornicel":[{text:"Leží nad dolní čelistí a tvoří střed obličeje.",correct:true},{text:"Obsahuje čelistní dutiny – součást vedlejších dutin nosních.",correct:true},{text:"Podílí se na tvorbě nosní a ústní dutiny.",correct:true},{text:"Obsahuje čelní dutiny snižující hmotnost lebky.",correct:false},{text:"Tvoří zadní část mozkovny.",correct:false}],
  "klin03":[{text:"Leží uprostřed lebky mezi čelní a týlní kostí.",correct:true},{text:"Obsahuje klínové dutiny – vedlejší dutiny nosní.",correct:true},{text:"Na horní straně těla je turecké sedlo (sella turcica) s hypofýzou.",correct:true},{text:"Obsahuje čelistní dutiny pro horní zuby.",correct:false},{text:"Tvoří dolní hranici obličeje a je pohyblivá.",correct:false}],
  "lice":[{text:"Tvoří vyvýšené části lící a boční okraje očnic.",correct:true},{text:"Spánkový výběžek se spojuje se spánkovou kostí.",correct:true},{text:"Přenáší žvýkací síly mezi horní čelistí a lebkou.",correct:true},{text:"Obsahuje čelní dutiny.",correct:false},{text:"Tvoří část nosní přepážky.",correct:false}],
  "jazyl03":[{text:"Zavěšena pod dolní čelistí v oblasti krku.",correct:true},{text:"Podpírá jazyk a hrtan a podílí se na polykání a tvorbě hlasu.",correct:true},{text:"Nemá přímé kostní spojení s ostatními kostmi.",correct:true},{text:"Spojuje se přímo s horní čelistí.",correct:false},{text:"Obsahuje čelní dutiny.",correct:false}],
  "patro":[{text:"Nachází se v zadní části ústní dutiny, za horní čelistí.",correct:true},{text:"Odděluje nosní a ústní dutinu a vytváří základ pro měkké patro.",correct:true},{text:"Spolu s horní čelistí uzavírá přední část vedlejších dutin nosních.",correct:true},{text:"Tvoří zadní část mozkovny.",correct:false},{text:"Obsahuje čelistní dutiny.",correct:false}],
  "tyl":[{text:"Tvoří zadní a dolní část lebky.",correct:true},{text:"Má týlní otvor (foramen magnum) pro míchu a kondyly pro spojení s atlasem.",correct:true},{text:"Chrání mozeček a mozkový kmen.",correct:true},{text:"Obsahuje čelní dutiny.",correct:false},{text:"Tvoří boční stěnu očnice.",correct:false}],
  "dolniskor":[{text:"Leží v dolní části nosní dutiny, podél její boční stěny.",correct:true},{text:"Zvětšuje povrch nosní dutiny a napomáhá proudění vzduchu.",correct:true},{text:"Nepřímo souvisí i s ústní dutinou přes patro.",correct:true},{text:"Tvoří strop ústní dutiny.",correct:false},{text:"Obsahuje čelní dutiny.",correct:false}],
  "spank":[{text:"Nachází se po stranách lebky, pod temenní kostí.",correct:true},{text:"Obsahuje sluchové a rovnovážné ústrojí v pars petrosa.",correct:true},{text:"Tvoří kloub s dolní čelistí a část jařmového oblouku.",correct:true},{text:"Obsahuje čelní dutiny.",correct:false},{text:"Tvoří dolní hranici obličeje a je pohyblivá.",correct:false}],
  "nosni":[{text:"Malé kosti tvořící hřbet nosu.",correct:true},{text:"Spojují se s čelní a horní čelistí.",correct:true},{text:"Podílí se na propojení s vedlejšími dutinami nosními.",correct:true},{text:"Tvoří dolní hranici obličeje a je pohyblivá.",correct:false},{text:"Obsahuje kloubní výběžek pro čelistní kloub.",correct:false}],
  "slzni":[{text:"Malá kost ve vnitřním koutku očnice.",correct:true},{text:"Obsahuje slzní jamku, kde začíná slzní kanálek ústící do nosní dutiny.",correct:true},{text:"Tvoří část vnitřní stěny očnice.",correct:true},{text:"Obsahuje čelní dutiny.",correct:false},{text:"Spojuje se přímo s dolní čelistí.",correct:false}],
  "radlic":[{text:"Nachází se ve střední části nosní dutiny.",correct:true},{text:"Tvoří dolní a zadní část nosní přepážky.",correct:true},{text:"Spojuje se s patrovou, klínovou a čichovou kostí.",correct:true},{text:"Tvoří strop ústní dutiny.",correct:false},{text:"Obsahuje čelní dutiny.",correct:false}],
  "temen":[{text:"Leží na vrcholu lebky a tvoří její strop.",correct:true},{text:"Spojuje se s čelní, týlní a spánkovou kostí pomocí švů.",correct:true},{text:"Tvoří horní část mozkovny – lební dutiny chránící mozek.",correct:true},{text:"Obsahuje čelistní dutiny.",correct:false},{text:"Tvoří dolní hranici obličeje.",correct:false}]
};

// === Loader a objekt ===
const loader = new GLTFLoader();
let object = null;

// === Funkce hlavní scéna ===
function loadModel(modelName) {
    if (object) { disposeObject(object, scene); object=null; }
    loader.load(`./models02/${modelName}.glb`, gltf=>{
        object = gltf.scene;
        object.scale.set(0.12,0.12,0.12);
        object.position.set(0,0,0);
        object.rotation.y = THREE.MathUtils.degToRad(-20);
        scene.add(object);
    }, undefined, err=>console.error('Chyba při načítání modelu:', err));
}

function updateBoneInfo(name, text){
    document.querySelector("#info h2").textContent=name;
    document.querySelector("#bone-text").innerHTML=(text||'').split('||').join('<br>');
}

function resizeRenderer(){
    const container = document.getElementById("viewer-container");
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
}

window.addEventListener('resize', resizeRenderer);
resizeRenderer();

function animate(){ requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera);}
animate();

// === Klikání na kosti a lebku s centralizovanou funkcí ===
const skullBtn = document.getElementById("show-skull-btn");
const boneLis = document.querySelectorAll("#bones-nav li");

function setActive(btnOrLi, isSkull=false){
    boneLis.forEach(li=>li.classList.remove("active"));
    skullBtn.classList.remove("active");

    btnOrLi.classList.add("active");

    const model = btnOrLi.dataset.model;
    const name = btnOrLi.dataset.name;
    const text = btnOrLi.dataset.text;
    loadModel(model);
    updateBoneInfo(name,text);

    document.getElementById("verify-btn").style.display = isSkull ? "none" : "inline-block";
}

// klikání na lebku
skullBtn.addEventListener("click",()=>setActive(skullBtn,true));

// klikání na kosti
boneLis.forEach(li=>li.addEventListener("click",()=>setActive(li)));

// === Výchozí stav ===
loadModel("scene");
updateBoneInfo("Lebka – 3D poznávačka","Vyber kost ze seznamu a zobrazí se detailní pohled.");


   // === Testovací režim - samostatná scéna ===
const test3dDiv = document.getElementById('test-3d');
let testScene, testCamera, testRenderer, testControls, testObject = null;
let allBones = [], remainingBones=[], currentBone=null, correctCount=0, totalBonesCount=0;


function initTest3D() {
    testScene = new THREE.Scene();
    testCamera = new THREE.PerspectiveCamera(75,1,0.1,1000);
    testCamera.position.set(0,0,3.5);

    testRenderer = new THREE.WebGLRenderer({alpha:true});
    test3dDiv.appendChild(testRenderer.domElement);

    testControls = new OrbitControls(testCamera, testRenderer.domElement);
    testControls.enableDamping=true;
    testControls.enablePan=false;
    testControls.minDistance=2;
    testControls.maxDistance=10;
    testControls.target.set(0,0,0);
    testControls.update();

    const topLight = new THREE.DirectionalLight(0xffffff,1);
    topLight.position.set(500,500,500);
    testScene.add(topLight);
    const ambientLight = new THREE.AmbientLight(0x333333,1);
    testScene.add(ambientLight);

    resizeTestRenderer();
    animateTest();
}

function resizeTestRenderer(){
    testRenderer.setSize(test3dDiv.clientWidth,test3dDiv.clientHeight);
    testCamera.aspect = test3dDiv.clientWidth/test3dDiv.clientHeight;
    testCamera.updateProjectionMatrix();
}

function animateTest(){
    requestAnimationFrame(animateTest);
    testControls.update();
    testRenderer.render(testScene,testCamera);
}

function loadTestModel(modelName){
    if(testObject) { disposeObject(testObject, testScene); testObject=null; }
    loader.load(`./models02/${modelName}.glb`, gltf=>{
        testObject=gltf.scene;
        testObject.scale.set(0.12,0.12,0.12);
        testObject.position.set(0,0,0);
        testObject.rotation.y=THREE.MathUtils.degToRad(-20);
        testScene.add(testObject);
    }, undefined, err=>console.error('Chyba načítání test modelu:',err));
}

// === Test logika ===
const testModeBtn=document.getElementById('test-mode-btn');
const bonesNav=document.getElementById('bones-nav');
const containerDiv=document.getElementById('container');
const testContainer=document.getElementById('test-container');

const listContainer=document.getElementById('test-bones-list');
const submitBtn=document.getElementById('submit-btn');
const resultEl=document.getElementById('result');
const nextBtn=document.getElementById('next-btn');

let counterEl=document.getElementById('progress-counter');
if(!counterEl){
    counterEl=document.createElement('p');
    counterEl.id='progress-counter';
    counterEl.style.marginTop='10px';
    counterEl.style.fontWeight='bold';
    document.querySelector('#test-container > div:nth-child(2)').insertBefore(counterEl, submitBtn);
}

function updateCounter(){ counterEl.textContent=`${correctCount}/${totalBonesCount}`; }

function prepareBones(){ 
    allBones=Array.from(document.querySelectorAll('#bones-nav li')).map(li=>({model:li.dataset.model,name:li.dataset.name,text:li.dataset.text}));
    remainingBones=allBones.slice(); totalBonesCount=remainingBones.length; correctCount=0;
    updateCounter();
}

function populateTestList(){
    listContainer.innerHTML='';
    allBones.forEach(b=>{
        const item=document.createElement('li');
        item.textContent=b.name; item.style.cursor='pointer'; item.style.padding='6px 8px';
        item.addEventListener('click',()=>{ listContainer.querySelectorAll('li').forEach(i=>i.classList.remove('selected')); item.classList.add('selected'); });
        listContainer.appendChild(item);
    });
}

function loadNextTestModel(){
    if(!remainingBones.length){
        resultEl.textContent=`Hotovo! Skóre: ${correctCount}/${totalBonesCount}`;
        nextBtn.style.display='none'; submitBtn.style.display='none';
        if(!document.getElementById('home-btn')){
            const homeBtn=document.createElement('button'); homeBtn.id='home-btn'; homeBtn.classList.add('btn-white'); homeBtn.textContent='Domů'; homeBtn.style.marginTop='10px';
            homeBtn.addEventListener('click',()=>location.reload());
            resultEl.after(homeBtn);
        }
        return;
    }
    const index=Math.floor(Math.random()*remainingBones.length);
    currentBone=remainingBones[index];
    loadTestModel(currentBone.model);

    resultEl.textContent='';
    listContainer.querySelectorAll('li').forEach(li=>li.classList.remove('selected'));
    nextBtn.style.display='none'; submitBtn.style.display='block';
    updateCounter();
}

function startTest(){
    skullBtn.style.display = 'none';
    testModeBtn.textContent='EXIT'; testModeBtn.style.backgroundColor='#c0392b'; testModeBtn.title='Ukončit test a vrátit se zpět';
    testModeBtn.onclick=()=>location.reload();
    bonesNav.style.display='none'; containerDiv.style.display='none'; testContainer.style.display='flex';
    initTest3D();
    prepareBones(); populateTestList(); loadNextTestModel();
}

testModeBtn.addEventListener('click', startTest);

submitBtn.addEventListener('click',()=>{
    const selected=listContainer.querySelector('li.selected'); if(!selected){ resultEl.textContent='Vyber kost!'; return;}
    if(!currentBone){ resultEl.textContent='Žádný model není načtený.'; return;}
    const chosenName=selected.textContent;
    if(chosenName===currentBone.name){
        resultEl.textContent='✅ Správně!';
        const idx=remainingBones.findIndex(b=>b.model===currentBone.model);
        if(idx!==-1) remainingBones.splice(idx,1);
        correctCount++; updateCounter();
    } else resultEl.textContent=`❌ Špatně! Správná odpověď: ${currentBone.name}`;
    nextBtn.style.display='block'; submitBtn.style.display='none';
});

nextBtn.addEventListener('click',()=>{ nextBtn.style.display='none'; loadNextTestModel(); });

// === Resize okna ===
window.addEventListener('resize',()=>{
    if(testRenderer && testRenderer.domElement.parentElement===test3dDiv) resizeTestRenderer();
    else resizeRenderer();
});

// === Ověřování tvrzení ===
const verifyBtn=document.getElementById('verify-btn');
const verifyForm=document.getElementById('verify-form');
const verifyClaimsDiv=document.getElementById('verify-claims');
const verifySubmit=document.getElementById('verify-submit');
const verifyResult=document.getElementById('verify-result');

verifyBtn.addEventListener('click',()=>{
    document.getElementById('bone-text').style.display='none';
    verifyForm.style.display='block'; verifyResult.textContent='';

    const activeLi=document.querySelector('#bones-nav li.active'); if(!activeLi) return;
    const facts=theoryFacts[activeLi.dataset.model]||[];
    verifyClaimsDiv.innerHTML='';
    facts.forEach((f,i)=>{
        const label=document.createElement('label'); label.style.display='block';
        const checkbox=document.createElement('input'); checkbox.type='checkbox'; checkbox.value=i;
        label.appendChild(checkbox); label.appendChild(document.createTextNode(' '+f.text));
        verifyClaimsDiv.appendChild(label);
    });
});

verifySubmit.addEventListener('click', () => {
  const activeLi = document.querySelector('#bones-nav li.active');
  if (!activeLi) return;

  const model = activeLi.dataset.model;
  const claims = theoryFacts[model] || [];

  let correct = true;
  let messages = [];

  // --- 1️⃣ Ověření tvrzení ---
  const checkboxes = verifyClaimsDiv.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb, i) => {
    const isChecked = cb.checked;
    const shouldBeChecked = claims[i].correct;
    if (isChecked !== shouldBeChecked) {
      correct = false;
      messages.push(`Tvrzení ${i + 1}: správně ${shouldBeChecked ? 'zaškrtnout' : 'nezaškrtávat'} – "${claims[i].text}"`);
    }
  });

  // --- 2️⃣ Ověření počtu a části lebky ---
  const textData = activeLi.dataset.text;
  const matchCount = textData.match(/Počet:\s*(\d+)/);
  const matchPart = textData.match(/Část:\s*([^\|]+)/);

  const correctCount = matchCount ? matchCount[1] : null;
  let correctPart = matchPart ? matchPart[1].trim().toLowerCase() : null;

  // úprava – sjednotíme koncovku pro hezčí výpis
  if (correctPart.startsWith("mozkov")) correctPart = "mozková";
  if (correctPart.startsWith("obličej")) correctPart = "obličejová";

  const userCount = document.querySelector('input[name="bone-count"]:checked');
  const userPart = document.querySelector('input[name="bone-part"]:checked');

  // === pokud uživatel nic nevybral, je to také chyba
  if (!userCount) {
    correct = false;
    messages.push(`Správný počet: ${correctCount}`);
  } else if (userCount.value !== correctCount) {
    correct = false;
    messages.push(`Správný počet: ${correctCount}`);
  }

  if (!userPart) {
    correct = false;
    messages.push(`Správná část lebky: ${correctPart}`);
  } else if (userPart.value.toLowerCase() !== correctPart) {
    correct = false;
    messages.push(`Správná část lebky: ${correctPart}`);
  }

  // --- 3️⃣ Výsledek ---
  if (correct) {
    verifyResult.textContent = '✅ Vše správně!';
  } else {
    verifyResult.innerHTML = messages.map(m => `❌ ${m}`).join('<br>');
  }

  // --- 4️⃣ Tlačítko Domů ---
  if (!document.getElementById('home-btn-verify')) {
    const homeBtn = document.createElement('button');
    homeBtn.id = 'home-btn-verify';
    homeBtn.classList.add('btn-white');
    homeBtn.textContent = 'Domů';
    homeBtn.style.marginTop = '10px';
    homeBtn.addEventListener('click', () => location.reload());
    verifyResult.after(homeBtn);
  }
});
