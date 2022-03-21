import * as THREE from "three";
import "./style.css";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {
  BlendFunction,
  DepthDownsamplingPass,
  EdgeDetectionMode,
  PredicationMode,
  BrightnessContrastEffect,
  ColorAverageEffect,
  SepiaEffect,
  TextureEffect,
  HueSaturationEffect,
  VignetteEffect,
  SSAOEffect,
  SMAAEffect,
  SMAAImageLoader,
  SMAAPreset,
  CopyMaterial,
  ShaderPass,
  EffectComposer,
  NormalPass,
  EffectPass,
  RenderPass,
} from "postprocessing";
import gsap from "gsap";
import { CSSPlugin } from "gsap";
import CameraControls from "camera-controls";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

import px from "./assets/environmentMaps/0/px.jpg";
import nx from "./assets/environmentMaps/0/nx.jpg";
import py from "./assets/environmentMaps/0/py.jpg";
import ny from "./assets/environmentMaps/0/ny.jpg";
import pz from "./assets/environmentMaps/0/pz.jpg";
import nz from "./assets/environmentMaps/0/nz.jpg";

gsap.registerPlugin(CSSPlugin);

// Variable declarations

const plus_button = document.querySelector(".plus-button");
const minus_button = document.querySelector(".minus-button");
const directions = document.querySelector(".closed");
const flip = document.querySelector(".flip-button");
const opened_direction_box = document.querySelector(".opened");

const switch_btn_mumnag = document.querySelector(".switch_button_mumnag");
const switch_handle_mumnag = document.querySelector(".switch_handle_mumnag");
const swap_btn_mumnag = document.querySelector(".swap_btn_mumnag");
const switch_btn_mumarv = document.querySelector(".switch_button_mumarv");
const switch_handle_mumarv = document.querySelector(".switch_handle_mumarv");
const swap_btn_mumarv = document.querySelector(".swap_btn_mumarv");
const switch_btn_mumwardha = document.querySelector(".switch_button_mumwardha");
const switch_handle_mumwardha = document.querySelector(
  ".switch_handle_mumwardha"
);
const swap_btn_mumwardha = document.querySelector(".swap_btn_mumwardha");
const switch_btn_nagarv = document.querySelector(".switch_button_nagarv");
const switch_handle_nagarv = document.querySelector(".switch_handle_nagarv");
const swap_btn_nagarv = document.querySelector(".swap_btn_nagarv");
const switch_btn_nagwardha = document.querySelector(".switch_button_nagwardha");
const switch_handle_nagwardha = document.querySelector(
  ".switch_handle_nagwardha"
);
const swap_btn_nagwardha = document.querySelector(".swap_btn_nagwardha");
const switch_btn_arvwardha = document.querySelector(".switch_button_arvwardha");
const switch_handle_arvwardha = document.querySelector(
  ".switch_handle_arvwardha"
);
const swap_btn_arvwardha = document.querySelector(".swap_btn_arvwardha");

const loading = document.querySelector(".loading-container");
const percentage = document.querySelector("#percentage");
const nagpurcanvas = document.getElementById("nagpur");

let isFlipped = true;
let isOpened = true;

let isMumNagSwapped = false;
let isMumArviSwapped = false;
let isMumWardhaSwapped = false;
let isNagArviSwapped = false;
let isNagWardhaSwapped = false;
let isArviWardhaSwapped = false;

let isMumNagActive = false;
let isMumArviActive = false;
let isMumWardhaActive = false;
let isNagArviActive = false;
let isNagWardhaActive = false;
let isArviWardhaActive = false;

var envMap;
var pmremGenerator;
const assets = new Map();
let composer = null;
let smaaEffect, edgesTextureEffect, weightsTextureEffect;
const loadingManager = new THREE.LoadingManager();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();
let white_arrow = null;
let nagpurTexture = null;
let mumbaiTexture = null;
let arviTexture = null;
let wardhaTexture = null;
let redArrowTexture = null;

let mixer = null;
let arrowmixer = null;
let model = null;
let root = null;
let animations;
let actionMumNag = null;
let actionNagMum = null;
let actionMumArv = null;
let actionArvMum = null;
let actionMumWardha = null;
let actionWardhaMum = null;
let actionNagWardha = null;
let actionWardhaNag = null;
let actionNagArvi = null;
let actionArviNag = null;
let actionArvWardha = null;
let actionWardhaArv = null;

/**
 * Scene
 */

// Scene
const scene = new THREE.Scene();

/**
 * Environment
 */
const environmentMap = cubeTextureLoader.load([px, nx, py, ny, pz, nz]);
scene.environment = environmentMap;

/**
 * Loaders
 */

const gltfLoader = new GLTFLoader(loadingManager);
const smaaImageLoader = new SMAAImageLoader(loadingManager);

function load() {
  return new Promise((resolve, reject) => {
    if (assets.size === 0) {
      loadingManager.onError = reject;
      loadingManager.onProgress = (item, loaded, total) => {
        const progressRatio = loaded / total;
        const convertedPercentage = Math.floor(progressRatio * 100);
        percentage.innerText = convertedPercentage + "%";

        if (convertedPercentage == 100) {
          gsap.to(loading, {
            opacity: 0,

            duration: 1,
            ease: "Power4.out",
          });

          loading.style.pointerEvents = "none";
        }

        if (loaded === total) {
          resolve(assets);
        }
      };

      // Textures

      white_arrow = textureLoader.load("./assets/white_Arrows.png");
      nagpurTexture = textureLoader.load("./assets/Nagpur.png");
      mumbaiTexture = textureLoader.load("./assets/Mumbai.png");
      arviTexture = textureLoader.load("./assets/Arvi.png");
      wardhaTexture = textureLoader.load("./assets/Wardha.png");
      redArrowTexture = textureLoader.load(
        "./assets/redarrow.png",
        (texture) => {
          texture.minFilter = THREE.NearestFilter;
        }
      );

      /**
       * Model
       */
      gltfLoader.load("/IC04.glb", (gltf) => {
        assets.set("gltf-scene", gltf.scene);
        model = gltf;

        console.log(model);

        root =
          gltf.scene.children[0].children[0].children[1].children[2]
            .children[1];

        //  Mumbai - Nagpur
        root.children[0].children[0].children[3].visible = false;

        //  Nagpur - Mumbai
        root.children[0].children[1].children[3].visible = false;

        //  Mumbai - Arvi
        root.children[1].children[0].children[3].visible = false;

        //  Arvi - Mumbai
        root.children[1].children[1].children[3].visible = false;

        //  Mumbai - Wardha
        root.children[2].children[0].children[3].visible = false;

        //  Wardha - Mumbai
        root.children[2].children[1].children[3].visible = false;

        //  Nagpur - Arvi
        root.children[3].children[0].children[3].visible = false;

        //  Arvi - Nagpur
        root.children[3].children[1].children[3].visible = false;

        //  Nagpur - Wardha
        root.children[4].children[0].children[3].visible = false;

        //  Wardha - Nagpur
        root.children[4].children[1].children[3].visible = false;

        //  Arvi - Wardha
        root.children[5].children[0].children[3].visible = false;

        //  Wardha - Arvi
        root.children[5].children[1].children[3].visible = false;

        animations = gltf.animations;

        mixer = new THREE.AnimationMixer(gltf.scene);
        arrowmixer = new THREE.AnimationMixer(gltf.scene);

        let action1 = [];
        let animset1;
        let action2 = [];
        let animset2;
        let action3 = [];
        let animset3;
        let action4 = [];
        let animset4;
        let action5 = [];
        let animset5;
        let action6 = [];
        let animset6;
        let action7 = [];
        let animset7;
        let action8 = [];
        let animset8;
        let action9 = [];
        let animset9;
        let action10 = [];
        let animset10;
        let action11 = [];
        let animset11;
        let action12 = [];
        let animset12;
        let action13 = [];
        let animset13;

        for (let i = 1; i < 39; i++) {
          function playanim(a) {
            animset1 = mixer.clipAction(gltf.animations[a]);
            action1.push(animset1);
          }

          playanim(i);
        }

        for (let i = 41; i < 81; i++) {
          function playanim(a) {
            animset2 = mixer.clipAction(gltf.animations[a]);
            action2.push(animset2);
          }

          playanim(i);
        }

        for (let i = 84; i < 90; i++) {
          function playanim(a) {
            animset3 = mixer.clipAction(gltf.animations[a]);
            action3.push(animset3);
          }

          playanim(i);
        }

        for (let i = 92; i < 100; i++) {
          function playanim(a) {
            animset4 = mixer.clipAction(gltf.animations[a]);
            action4.push(animset4);
          }

          playanim(i);
        }

        for (let i = 102; i < 109; i++) {
          function playanim(a) {
            animset5 = mixer.clipAction(gltf.animations[a]);
            action5.push(animset5);
          }

          playanim(i);
        }

        for (let i = 111; i < 116; i++) {
          function playanim(a) {
            animset6 = mixer.clipAction(gltf.animations[a]);
            action6.push(animset6);
          }

          playanim(i);
        }

        for (let i = 118; i < 123; i++) {
          function playanim(a) {
            animset7 = mixer.clipAction(gltf.animations[a]);
            action7.push(animset7);
          }

          playanim(i);
        }

        for (let i = 125; i < 134; i++) {
          function playanim(a) {
            animset8 = mixer.clipAction(gltf.animations[a]);
            action8.push(animset8);
          }

          playanim(i);
        }

        for (let i = 136; i < 142; i++) {
          function playanim(a) {
            animset9 = mixer.clipAction(gltf.animations[a]);
            action9.push(animset9);
          }

          playanim(i);
        }

        for (let i = 144; i < 152; i++) {
          function playanim(a) {
            animset10 = mixer.clipAction(gltf.animations[a]);
            action10.push(animset10);
          }

          playanim(i);
        }

        for (let i = 154; i < 158; i++) {
          function playanim(a) {
            animset11 = mixer.clipAction(gltf.animations[a]);
            action11.push(animset11);
          }

          playanim(i);
        }

        for (let i = 160; i < 164; i++) {
          function playanim(a) {
            animset12 = mixer.clipAction(gltf.animations[a]);
            action12.push(animset12);
          }

          playanim(i);
        }

        for (let i = 166; i < 306; i++) {
          function playanim(a) {
            animset13 = mixer.clipAction(gltf.animations[a]);
            action13.push(animset13);
          }

          playanim(i);
        }

        let interval1 = 2500, //  = 2.5s
          increment1 = 1;
        let interval2 = 2500, //  = 2.5s
          increment2 = 1;
        let interval3 = 2500, //  = 2.5s
          increment3 = 1;
        let interval4 = 2500, //  = 2.5s
          increment4 = 1;
        let interval5 = 2500, //  = 2.5s
          increment5 = 1;
        let interval6 = 2500, //  = 2.5s
          increment6 = 1;
        let interval7 = 2500, //  = 2.5s
          increment7 = 1;
        let interval8 = 2500, //  = 2.5s
          increment8 = 1;
        let interval9 = 3500, //  = 2.5s
          increment9 = 1;
        let interval10 = 3000, //  = 2.5s
          increment10 = 1;
        let interval11 = 3500, //  = 2.5s
          increment11 = 1;
        let interval12 = 4500, //  = 2.5s
          increment12 = 1;
        let interval13 = 4000, //  = 2.5s
          increment13 = 1;

        // Mumbai - Nagpur
        action1.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval1 * increment1);

          increment1 = increment1 + 1;
        });

        // Nagpur-Mumbai
        action2.forEach(function (el) {
          var run = setTimeout(function () {
            if (el._clip.name == "msr_trc_01_vclGeo (2)") {
              el.stop();
            } else if (el._clip.name == "msr_trc_01_vclGeo (1)") {
              el.stop();
            } else if (el._clip.name == "msr_trc_01_vclGeo") {
              el.stop();
            } else if (el._clip.name == "msr_tlr_01_vclGeo") {
              el.stop();
            } else if (el._clip.name == "msr_tlr_01_vclGeo (1)") {
              el.stop();
            } else if (el._clip.name == "msr_tlr_01_vclGeo (2)") {
              el.stop();
            } else if (el._clip.name == "msr_mtl_01_vclGeo") {
              el.stop();
            } else if (el._clip.name == "msr_mtl_01_vclGeo (1)") {
              el.stop();
            } else if (el._clip.name == "msr_mtl_01_vclGeo (2)") {
              el.stop();
            } else {
              el.play();
            }

            clearTimeout(run);
          }, interval2 * increment2);

          increment2 = increment2 + 1;
        });

        // Mumbai - Arvi
        action3.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval3 * increment3);

          increment3 = increment3 + 1;
        });

        // Arvi - Mumbai
        action4.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval4 * increment4);

          increment4 = increment4 + 1;
        });

        // Mumbai - Wardha
        action5.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval5 * increment5);

          increment5 = increment5 + 1;
        });

        // Wardha - Mumbai
        action6.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval6 * increment6);

          increment6 = increment6 + 1;
        });

        // Nagpur - Arvi
        action7.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval7 * increment7);

          increment7 = increment7 + 1;
        });

        // Arvi - Nagpur
        action8.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval8 * increment8);

          increment8 = increment8 + 1;
        });

        //Nagpur - Wardha
        action9.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval9 * increment9);

          increment9 = increment9 + 1;
        });

        // Wardha - Nagpur
        action10.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval10 * increment10);

          increment10 = increment10 + 1;
        });

        // Arvi - Wardha
        action11.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval11 * increment11);

          increment11 = increment11 + 1;
        });

        // Wardha - Arvi
        action12.forEach(function (el) {
          var run = setTimeout(function () {
            el.play();

            clearTimeout(run);
          }, interval12 * increment12);

          increment12 = increment12 + 1;
        });

        action13.forEach(function (el) {
          var run = setTimeout(function () {
            if (el._clip.name == "msr_trc_01_vclGeo (2)") {
              el.stop();
            } else if (el._clip.name == "msr_trc_01_vclGeo (1)") {
              el.stop();
            } else if (el._clip.name == "msr_trc_01_vclGeo") {
              el.stop();
            } else if (el._clip.name == "msr_tlr_01_vclGeo") {
              el.stop();
            } else if (el._clip.name == "msr_tlr_01_vclGeo (1)") {
              el.stop();
            } else if (el._clip.name == "msr_tlr_01_vclGeo (2)") {
              el.stop();
            } else if (el._clip.name == "msr_mtl_01_vclGeo") {
              el.stop();
            } else if (el._clip.name == "msr_mtl_01_vclGeo (1)") {
              el.stop();
            } else if (el._clip.name == "msr_mtl_01_vclGeo (2)") {
              el.stop();
            } else {
              el.play();
            }

            clearTimeout(run);
          }, interval13 * increment13);

          increment13 = increment13 + 1;
        });

        gltf.scene.position.set(0, 0, 0);
        scene.add(gltf.scene);

        updateallMaterials();
      });

      smaaImageLoader.load(([search, area]) => {
        assets.set("smaa-search", search);
        assets.set("smaa-area", area);
      });
    } else {
      resolve();
    }
  });
}

load();

// Update all Materials

const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: redArrowTexture },
  },
  transparent: true,
  vertexShader,
  fragmentShader,
});



const updateallMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      // child.material.toneMapping = THREE.LinearToneMapping
      // child.material.envMap = environmentMap;
      // child.material.envMapIntensity = 1.3;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;

      // if(child.name.startsWith('msr_ExpresswayWall_Geo', 0)) {
      //   child.material.map.encoding = THREE.sRGBEncoding
      // }
      if (child.name.startsWith("msr_IC04Road_geo", 0)) {
        child.material.map.generateMipmaps = true;
        child.material.map.magFilter = THREE.LinearFilter;
      }
      if (child.name.startsWith("msr_Mountain_geo", 0)) {
        child.material.envMapIntensity = 1.8;
        child.material.map.wrapS = 12;
        child.material.map.wrapT = 6;
      }
      if (child.name.includes("Dir")) {
        child.material = shaderMaterial;
      }
    }
  });
};

function initialize(assets) {
  CameraControls.install({ THREE: THREE });

  /**
   * Base
   */

  // Canvas
  const canvas = document.querySelector(".webgl");

  const planeGeometry = new THREE.PlaneBufferGeometry(0.5, 0.3);
  const planeMaterial = new THREE.MeshStandardMaterial({
    map: white_arrow,
    transparent: true,
  });

  const nagpurPlaneMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  nagpurPlaneMesh.rotation.x = -Math.PI / 2;

  const verticalLinepoints = [];
  verticalLinepoints.push(new THREE.Vector3(-0.5, 0.5, 0));
  verticalLinepoints.push(new THREE.Vector3(-0.5, 0, 0));

  const horizontalLinepoints = [];
  horizontalLinepoints.push(new THREE.Vector3(-0.5, 0, 0));
  horizontalLinepoints.push(new THREE.Vector3(-0.1, 0, 0));

  const nagpurVerticalLinegeometry = new THREE.BufferGeometry().setFromPoints(
    verticalLinepoints
  );
  const nagpurHorizontalLinegeometry = new THREE.BufferGeometry().setFromPoints(
    horizontalLinepoints
  );

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 2,
  });

  const nagpurVerticalLine = new THREE.Line(
    nagpurVerticalLinegeometry,
    lineMaterial
  );
  const nagpurHorizontalLine = new THREE.Line(
    nagpurHorizontalLinegeometry,
    lineMaterial
  );

  const nagpurline = new THREE.Group();
  nagpurline.add(nagpurVerticalLine, nagpurHorizontalLine);

  const nagpurDiv = document.createElement("div");
  nagpurDiv.className = "label";
  nagpurDiv.textContent = "Nagpur";
  nagpurDiv.style.marginTop = "-1em";
  const nagpurLabel = new CSS2DObject(nagpurDiv);
  nagpurLabel.position.set(0, 0.5, 0);

  const nagpurSpriteMaterial = new THREE.SpriteMaterial({
    color: new THREE.Color(0x909090),
    map: nagpurTexture,
  });

  const nagpurSprite = new THREE.Sprite(nagpurSpriteMaterial);
  nagpurSprite.scale.set(1.2, 0.25, 0);
  nagpurSprite.position.set(0, 0.5, 0);

  nagpurSprite.material.map.encoding = THREE.sRGBEncoding;

  const nagpurGeometry = new THREE.PlaneBufferGeometry(0.5, 0.3);

  const nagpurMaterial = new THREE.MeshStandardMaterial({
    map: nagpurTexture,
    side: THREE.DoubleSide
  });

  const nagpurMesh = new THREE.Mesh(nagpurGeometry, nagpurMaterial);
  nagpurMesh.add(nagpurLabel);

  // nagpurSprite.material.color = new THREE.Color( 0.1, 0.1, 0.1 );

  const nagpurGroup = new THREE.Group();
  nagpurGroup.position.set(6, -0.15, -1.5);
  nagpurGroup.add(nagpurPlaneMesh, nagpurline, nagpurSprite);

  scene.add(nagpurGroup);

  // Mumbai

  const mumbaiPlaneMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  mumbaiPlaneMesh.rotation.x = -Math.PI / 2;

  const mumbaiVerticalLinegeometry = new THREE.BufferGeometry().setFromPoints(
    verticalLinepoints
  );
  const mumbaiHorizontalLinegeometry = new THREE.BufferGeometry().setFromPoints(
    horizontalLinepoints
  );

  const mumbaiVerticalLine = new THREE.Line(
    mumbaiVerticalLinegeometry,
    lineMaterial
  );
  const mumbaiHorizontalLine = new THREE.Line(
    mumbaiHorizontalLinegeometry,
    lineMaterial
  );

  const mumbailine = new THREE.Group();
  mumbailine.add(mumbaiVerticalLine, mumbaiHorizontalLine);

  const mumbaiSpriteMaterial = new THREE.SpriteMaterial({
    color: new THREE.Color(0x909090),
    map: mumbaiTexture,
  });

  const mumbaiSprite = new THREE.Sprite(mumbaiSpriteMaterial);
  mumbaiSprite.scale.set(1.2, 0.25, 0);
  mumbaiSprite.position.set(0, 0.5, 0);

  mumbaiSprite.material.map.encoding = THREE.sRGBEncoding;

  const mumbaiGroup = new THREE.Group();
  mumbaiGroup.position.set(-4, -0.15, 1.5);
  mumbaiGroup.rotation.y = Math.PI;
  mumbaiGroup.add(mumbaiPlaneMesh, mumbailine, mumbaiSprite);

  scene.add(mumbaiGroup);

  // Arvi

  const arviPlaneMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  arviPlaneMesh.rotation.x = -Math.PI / 2;
  arviPlaneMesh.rotation.y = 0;

  const arviVerticalLinegeometry = new THREE.BufferGeometry().setFromPoints(
    verticalLinepoints
  );
  const arviHorizontalLinegeometry = new THREE.BufferGeometry().setFromPoints(
    horizontalLinepoints
  );

  const arviVerticalLine = new THREE.Line(
    arviVerticalLinegeometry,
    lineMaterial
  );
  const arviHorizontalLine = new THREE.Line(
    arviHorizontalLinegeometry,
    lineMaterial
  );

  const arviline = new THREE.Group();
  arviline.add(arviVerticalLine, arviHorizontalLine);

  const arviSpriteMaterial = new THREE.SpriteMaterial({
    color: new THREE.Color(0x909090),
    map: arviTexture,
  });

  const arviSprite = new THREE.Sprite(arviSpriteMaterial);
  arviSprite.scale.set(0.8, 0.22, 0);
  arviSprite.position.set(-0.5, 0.5, 0);

  arviSprite.material.map.encoding = THREE.sRGBEncoding;

  const arviGroup = new THREE.Group();
  arviGroup.position.set(0, -0.15, -3.5);
  arviGroup.rotation.y = Math.PI / 2;
  arviGroup.add(arviPlaneMesh, arviline, arviSprite);

  scene.add(arviGroup);

  // Wardha

  const wardhaPlaneMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  wardhaPlaneMesh.rotation.x = -Math.PI / 2;
  wardhaPlaneMesh.rotation.y = 0;

  const wardhaVerticalLinegeometry = new THREE.BufferGeometry().setFromPoints(
    verticalLinepoints
  );
  const wardhaHorizontalLinegeometry = new THREE.BufferGeometry().setFromPoints(
    horizontalLinepoints
  );

  const wardhaVerticalLine = new THREE.Line(
    wardhaVerticalLinegeometry,
    lineMaterial
  );
  const wardhaHorizontalLine = new THREE.Line(
    wardhaHorizontalLinegeometry,
    lineMaterial
  );

  const wardhaline = new THREE.Group();
  wardhaline.add(wardhaVerticalLine, wardhaHorizontalLine);

  const wardhaSpriteMaterial = new THREE.SpriteMaterial({
    color: new THREE.Color(0x909090),
    map: wardhaTexture,
  });

  const wardhaSprite = new THREE.Sprite(wardhaSpriteMaterial);
  wardhaSprite.scale.set(0.8, 0.22, 0);
  wardhaSprite.position.set(-0.5, 0.5, 0);

  wardhaSprite.material.map.encoding = THREE.sRGBEncoding;

  wardhaSprite.material.map.anisotropy = 2;

  const wardhaGroup = new THREE.Group();
  wardhaGroup.position.set(0, -0.15, 3.5);
  wardhaGroup.rotation.y = -Math.PI / 1.8;
  wardhaGroup.add(wardhaPlaneMesh, wardhaline, wardhaSprite);

  scene.add(wardhaGroup);

  /**
   * Lights
   */

  const d = 14;
  const directionalLight = new THREE.DirectionalLight("#ffffff", 0.7);
  directionalLight.position.set(2, 2.01, 3.5);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.bottom = -d;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.bias = 0.01;
  directionalLight.shadow.camera.normalBias = 0.34;
  directionalLight.shadow.mapSize.set(4096, 4096);
  scene.add(directionalLight);

  /**
   * Sizes
   */
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  /**
   * Camera
   */
  // Base camera
  const camera = new THREE.PerspectiveCamera(
    65,
    sizes.width / sizes.height,
    1,
    10000
  );
  camera.position.x = (Math.PI / 180) * 4.5;
  camera.position.y = Math.PI * 1.6;
  camera.position.z = 6;

  scene.add(camera);

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    powerPreference: "high-performance",
    antialias: false,
    stencil: false,
    depth: false,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 2;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // pmremGenerator = new THREE.PMREMGenerator(renderer);

  // new RGBELoader()
  //   .setDataType(THREE.UnsignedByteType)
  //   .load("sunflowers_1k.hdr", function (texture) {
  //     envMap = pmremGenerator.fromEquirectangular(texture).texture;

  //     scene.castShadow = true;
  //     scene.receiveShadow = true;
  //     scene.environment = envMap;
  //     scene.environment.encoding = THREE.LinearEncoding

  //     texture.dispose();
  //     pmremGenerator.dispose();
  //   });
  // pmremGenerator.compileEquirectangularShader();

  /**
   * Post Processing
   */
  const capabilities = renderer.capabilities;
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const anisotropy = Math.min(
    composer.getRenderer().capabilities.getMaxAnisotropy(),
    8
  );

  const colorAverageEffect = new ColorAverageEffect(BlendFunction.SKIP);
  const sepiaEffect = new SepiaEffect({ blendFunction: BlendFunction.SKIP });

  const brightnessContrastEffect = new BrightnessContrastEffect({
    blendFunction: BlendFunction.SKIP,
    brightness: 0.05,
    contrast: 0.01,
  });

  const hueSaturationEffect = new HueSaturationEffect({
    blendFunction: BlendFunction.NORMAL,
    saturation: 0.4,
    hue: 0.02,
  });

  const vignetteEffect = new VignetteEffect({
    eskil: false,
    offset: 0.05,
    darkness: 0.25,
  });

  const normalPass = new NormalPass(scene, camera);
  const depthDownsamplingPass = new DepthDownsamplingPass({
    normalBuffer: normalPass.texture,
    resolutionScale: 0.25,
  });

  const normalDepthBuffer = capabilities.isWebGL2
    ? depthDownsamplingPass.texture
    : null;

  const ssaoEffect = new SSAOEffect(camera, normalPass.texture, {
    blendFunction: BlendFunction.MULTIPLY,
    distanceScaling: false,
    depthAwareUpsampling: true,
    normalDepthBuffer,
    samples: 35,
    rings: 7,
    distanceThreshold: 0.3, // Render up to a distance of ~20 world units
    distanceFalloff: 0.0025, // with an additional ~2.5 units of falloff.
    rangeThreshold: 0.1, // Occlusion proximity of ~0.3 world units
    rangeFalloff: 0.01, // with ~0.1 units of falloff.
    luminanceInfluence: 0.001,
    minRadiusScale: 0.33,
    radius: 0.21,
    intensity: 1,
    bias: 0.01,
    fade: 0.001,
    color: new THREE.Color(0x404f04),
    resolutionScale: 1,
  });

  smaaEffect = new SMAAEffect(
    assets.get("smaa-search"),
    assets.get("smaa-area"),
    SMAAPreset.HIGH,
    EdgeDetectionMode.COLOR
  );

  smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.02);
  smaaEffect.edgeDetectionMaterial.setPredicationMode(PredicationMode.DEPTH);
  smaaEffect.edgeDetectionMaterial.setPredicationThreshold(0.002);
  smaaEffect.edgeDetectionMaterial.setPredicationScale(1.0);

  edgesTextureEffect = new TextureEffect({
    blendFunction: BlendFunction.SKIP,
    texture: smaaEffect.renderTargetEdges.texture,
  });

  weightsTextureEffect = new TextureEffect({
    blendFunction: BlendFunction.SKIP,
    texture: smaaEffect.renderTargetWeights.texture,
  });

  const copyPass = new ShaderPass(new CopyMaterial());

  const textureEffect = new TextureEffect({
    blendFunction: BlendFunction.SKIP,
    texture: depthDownsamplingPass.texture,
  });

  const effectPass = new EffectPass(
    camera,
    hueSaturationEffect,
    colorAverageEffect,
    sepiaEffect,
    brightnessContrastEffect,
    vignetteEffect,
    ssaoEffect,
    textureEffect,
    smaaEffect,
    edgesTextureEffect,
    weightsTextureEffect
  );

  copyPass.enabled = false;
  copyPass.renderToScreen = true;
  effectPass.renderToScreen = true;

  composer.addPass(copyPass);

  composer.addPass(normalPass);

  if (capabilities.isWebGL2) {
    composer.addPass(depthDownsamplingPass);
  } else {
    console.log(
      "WebGL 2 not supported, falling back to naive depth downsampling"
    );
  }

  composer.addPass(effectPass);

  const cameraControls = new CameraControls(camera, renderer.domElement);
  cameraControls.dampingFactor = 0.05;
  cameraControls.dollySpeed = 0.5;
  cameraControls.minDistance = 3;
  cameraControls.maxDistance = 7;
  cameraControls.mouseButtons.left = CameraControls.ACTION.TRUCK;
  cameraControls.mouseButtons.middle = CameraControls.ACTION.DOLLY;
  // cameraControls.mouseButtons.right = CameraControls.ACTION.ROTATE;
  cameraControls.touches.one = CameraControls.ACTION.TRUCK;
  cameraControls.touches.two = CameraControls.ACTION.DOLLY;

  let startAzimuthAngle = cameraControls.azimuthAngle;
  let startPolarAngle = cameraControls.polarAngle;

  function setPanLimit() {
    const bb = new THREE.Box3(
      new THREE.Vector3(-6.0, 0.0, -6.0),
      new THREE.Vector3(6.0, 0.0, 2.0)
    );
    cameraControls.setBoundary(bb);
  }

  setPanLimit();

  /**
   * Animate
   */
  const clock = new THREE.Clock();
  let lastElapsedTime = 0;

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - lastElapsedTime;
    lastElapsedTime = elapsedTime;
    const hasControlsUpdated = cameraControls.update(deltaTime);

    // you can skip this condition to render though
    if (hasControlsUpdated) {
      renderer.render(scene, camera);
    }

    // Update mixer
    if (mixer !== null || arrowmixer !== null) {
      mixer.update(deltaTime);
      arrowmixer.update(deltaTime * 5);
    }

    // Update material uniforms
    shaderMaterial.uniforms.uTime.value = deltaTime;

    nagpurMesh.quaternion.copy(camera.quaternion);

    // Render
    // renderer.render(scene, camera);
    composer.render();

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();

  // ----- Dom Interactions

  /**
   * Flip View
   */

  function TopView(angle) {
    if (isOpened == true) {
      cameraControls.rotatePolarTo(-20 * THREE.MathUtils.DEG2RAD, true);
      isOpened = false;
    } else if (isOpened == false) {
      cameraControls.rotatePolarTo(20 * THREE.MathUtils.DEG2RAD, true);
      isOpened = true;
    }
  }

  function flipCamera(angle) {
    if (isFlipped == true) {
      cameraControls.rotateAzimuthTo(180 * THREE.MathUtils.DEG2RAD, true);
    } else if (isFlipped == false) {
      cameraControls.rotateAzimuthTo(angle, true);
    }
  }

  flip.addEventListener("click", () => {
    flipCamera(startAzimuthAngle);
  });

  // ----Zoom Controls

  plus_button.addEventListener("click", (e) => {
    cameraControls.dolly(3, true);
  });

  minus_button.addEventListener("click", (e) => {
    cameraControls.dolly(-3, true);
  });

  // ----Directions

  let cityA,
    cityB = null;

  function openCloseDirectionBox() {
    if (isOpened == true) {
      opened_direction_box.classList.remove("is-active");
      directions.classList.remove("is-active");

      actionNagMum = arrowmixer.clipAction(animations[40]);
      actionNagMum.stop();
      actionMumNag = arrowmixer.clipAction(animations[0]);
      actionMumNag.stop();
      actionMumArv = arrowmixer.clipAction(animations[83]);
      actionMumArv.stop();
      actionArvMum = arrowmixer.clipAction(animations[91]);
      actionArvMum.stop();
      actionWardhaMum = arrowmixer.clipAction(animations[110]);
      actionWardhaMum.stop();
      actionMumWardha = arrowmixer.clipAction(animations[101]);
      actionMumWardha.stop();
      actionNagArvi = arrowmixer.clipAction(animations[117]);
      actionNagArvi.stop();
      actionArviNag = arrowmixer.clipAction(animations[124]);
      actionArviNag.stop();
      actionNagWardha = arrowmixer.clipAction(animations[135]);
      actionNagWardha.stop();
      actionWardhaNag = arrowmixer.clipAction(animations[143]);
      actionWardhaNag.stop();
      actionArvWardha = arrowmixer.clipAction(animations[153]);
      actionArvWardha.stop();
      actionWardhaArv = arrowmixer.clipAction(animations[159]);
      actionWardhaArv.stop();

      resetDirection();
      switch_handle_mumnag.classList.remove("is-active");
      switch_handle_mumarv.classList.remove("is-active");
      switch_handle_arvwardha.classList.remove("is-active");
      switch_handle_mumwardha.classList.remove("is-active");
      switch_handle_nagarv.classList.remove("is-active");
      switch_handle_nagwardha.classList.remove("is-active");
    } else {
      opened_direction_box.classList.add("is-active");
      directions.classList.add("is-active");
    }
  }

  function swapCityNames(cityA, cityB) {
    let temp,
      swappedcityA,
      swappedcityB = null;

    temp = cityA;
    swappedcityA = cityB;
    swappedcityB = temp;

    return { swappedcityA, swappedcityB };
  }

  function resetDirection() {
    //  Mumbai - Nagpur
    root.children[0].children[0].children[3].visible = false;

    //  Nagpur - Mumbai
    root.children[0].children[1].children[3].visible = false;

    //  Mumbai - Arvi
    root.children[1].children[0].children[3].visible = false;

    //  Arvi - Mumbai
    root.children[1].children[1].children[3].visible = false;

    //  Mumbai - Wardha
    root.children[2].children[0].children[3].visible = false;

    //  Wardha - Mumbai
    root.children[2].children[1].children[3].visible = false;

    //  Nagpur - Arvi
    root.children[3].children[0].children[3].visible = false;

    //  Arvi - Nagpur
    root.children[3].children[1].children[3].visible = false;

    //  Nagpur - Wardha
    root.children[4].children[0].children[3].visible = false;

    //  Wardha - Nagpur
    root.children[4].children[1].children[3].visible = false;

    //  Arvi - Wardha
    root.children[5].children[0].children[3].visible = false;

    //  Wardha - Arvi
    root.children[5].children[1].children[3].visible = false;

    actionMumNag = null;
    actionNagMum = null;
    actionMumArv = null;
    actionArvMum = null;
    actionMumWardha = null;
    actionWardhaMum = null;
    actionNagWardha = null;
    actionWardhaNag = null;
    actionNagArvi = null;
    actionArviNag = null;
    actionArvWardha = null;
    actionWardhaArv = null;
  }

  function playDirectionAnim() {
    resetDirection();
    if (isMumNagActive == true) {
      if (isMumNagSwapped == false) {
        actionNagMum = arrowmixer.clipAction(animations[40]);
        actionNagMum.stop();
        actionMumNag = arrowmixer.clipAction(animations[0]);
        actionMumNag.play();
        root.children[0].children[0].children[3].visible = true;

        var MNtl = gsap.timeline({ duration: 1, repeat: -1 });

        MNtl.to(root.children[0].children[0].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.in",
        }).to(root.children[0].children[0].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      } else {
        actionMumNag = arrowmixer.clipAction(animations[0]);
        actionMumNag.stop();
        actionNagMum = arrowmixer.clipAction(animations[40]);
        actionNagMum.play();
        root.children[0].children[1].children[3].visible = true;

        var NMtl = gsap.timeline({ duration: 1, repeat: -1 });

        NMtl.to(root.children[0].children[1].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[0].children[1].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      }
    } else {
      actionNagMum = arrowmixer.clipAction(animations[40]);
      actionNagMum.stop();
      actionMumNag = arrowmixer.clipAction(animations[0]);
      actionMumNag.stop();
      root.children[0].children[0].children[3].visible = false;
      root.children[0].children[1].children[3].visible = false;
    }

    if (isMumArviActive == true) {
      if (isMumArviSwapped == false) {
        actionArvMum = arrowmixer.clipAction(animations[91]);
        actionArvMum.stop();
        actionMumArv = arrowmixer.clipAction(animations[83]);
        actionMumArv.play();
        root.children[1].children[0].children[3].visible = true;

        var MAtl = gsap.timeline({ duration: 1, repeat: -1 });

        MAtl.to(root.children[1].children[0].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[1].children[0].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      } else {
        actionMumArv = arrowmixer.clipAction(animations[83]);
        actionMumArv.stop();
        actionArvMum = arrowmixer.clipAction(animations[91]);
        actionArvMum.play();
        root.children[1].children[1].children[3].visible = true;

        var AMtl = gsap.timeline({ duration: 1, repeat: -1 });

        AMtl.to(root.children[1].children[1].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[1].children[1].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      }
    } else {
      actionMumArv = arrowmixer.clipAction(animations[83]);
      actionMumArv.stop();
      actionArvMum = arrowmixer.clipAction(animations[91]);
      actionArvMum.stop();
      root.children[1].children[0].children[3].visible = false;
      root.children[1].children[1].children[3].visible = false;
    }

    if (isMumWardhaActive == true) {
      if (isMumWardhaSwapped == false) {
        actionWardhaMum = arrowmixer.clipAction(animations[110]);
        actionWardhaMum.stop();
        actionMumWardha = arrowmixer.clipAction(animations[101]);
        actionMumWardha.play();
        root.children[2].children[0].children[3].visible = true;

        var MWtl = gsap.timeline({ duration: 1, repeat: -1 });

        MWtl.to(root.children[2].children[0].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[2].children[0].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      } else {
        actionMumWardha = arrowmixer.clipAction(animations[101]);
        actionMumWardha.stop();
        actionWardhaMum = arrowmixer.clipAction(animations[110]);
        actionWardhaMum.play();
        root.children[2].children[1].children[3].visible = true;

        var WMtl = gsap.timeline({ duration: 1, repeat: -1 });

        WMtl.to(root.children[2].children[1].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[2].children[1].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      }
    } else {
      actionWardhaMum = arrowmixer.clipAction(animations[110]);
      actionWardhaMum.stop();
      actionMumWardha = arrowmixer.clipAction(animations[101]);
      actionMumWardha.stop();
      root.children[2].children[0].children[3].visible = false;
      root.children[2].children[1].children[3].visible = false;
    }

    if (isNagArviActive == true) {
      if (isNagArviSwapped == false) {
        actionArviNag = arrowmixer.clipAction(animations[124]);
        actionArviNag.stop();
        actionNagArvi = arrowmixer.clipAction(animations[117]);
        actionNagArvi.play();
        root.children[3].children[0].children[3].visible = true;

        var NAtl = gsap.timeline({ duration: 1, repeat: -1 });

        NAtl.to(root.children[3].children[0].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[3].children[0].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      } else {
        actionNagArvi = arrowmixer.clipAction(animations[117]);
        actionNagArvi.stop();
        actionArviNag = arrowmixer.clipAction(animations[124]);
        actionArviNag.play();
        root.children[3].children[1].children[3].visible = true;

        var ANtl = gsap.timeline({ duration: 1, repeat: -1 });

        ANtl.to(root.children[3].children[1].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[3].children[1].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      }
    } else {
      actionNagArvi = arrowmixer.clipAction(animations[117]);
      actionNagArvi.stop();
      actionArviNag = arrowmixer.clipAction(animations[124]);
      actionArviNag.stop();
      root.children[3].children[0].children[3].visible = false;
      root.children[3].children[1].children[3].visible = false;
    }

    if (isNagWardhaActive == true) {
      if (isNagWardhaSwapped == false) {
        actionWardhaNag = arrowmixer.clipAction(animations[143]);
        actionWardhaNag.stop();
        actionNagWardha = arrowmixer.clipAction(animations[135]);
        actionNagWardha.play();
        root.children[4].children[0].children[3].visible = true;

        var NWtl = gsap.timeline({ duration: 1, repeat: -1 });

        NWtl.to(root.children[4].children[0].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[4].children[0].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      } else {
        actionNagWardha = arrowmixer.clipAction(animations[135]);
        actionNagWardha.stop();
        actionWardhaNag = arrowmixer.clipAction(animations[143]);
        actionWardhaNag.play();
        root.children[4].children[1].children[3].visible = true;

        var WNtl = gsap.timeline({ duration: 1, repeat: -1 });

        WNtl.to(root.children[4].children[1].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[4].children[1].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      }
    } else {
      actionNagWardha = arrowmixer.clipAction(animations[135]);
      actionNagWardha.stop();
      actionWardhaNag = arrowmixer.clipAction(animations[143]);
      actionWardhaNag.stop();
      root.children[4].children[0].children[3].visible = false;
      root.children[4].children[1].children[3].visible = false;
    }

    if (isArviWardhaActive == true) {
      if (isArviWardhaSwapped == false) {
        actionWardhaArv = arrowmixer.clipAction(animations[159]);
        actionWardhaArv.stop();
        actionArvWardha = arrowmixer.clipAction(animations[153]);
        actionArvWardha.play();
        root.children[5].children[0].children[3].visible = true;

        var AWtl = gsap.timeline({ duration: 1, repeat: -1 });

        AWtl.to(root.children[5].children[0].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[5].children[0].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      } else {
        actionArvWardha = arrowmixer.clipAction(animations[153]);
        actionArvWardha.stop();
        actionWardhaArv = arrowmixer.clipAction(animations[159]);
        actionWardhaArv.play();
        root.children[5].children[1].children[3].visible = true;

        var WAtl = gsap.timeline({ duration: 1, repeat: -1 });

        WAtl.to(root.children[5].children[1].children[3].children[0].material, {
          opacity: 0,
          ease: "Power2.out",
        }).to(root.children[5].children[1].children[3].children[0].material, {
          opacity: 1,
          ease: "Power2.in",
        });
      }
    } else {
      actionArvWardha = arrowmixer.clipAction(animations[153]);
      actionArvWardha.stop();
      actionWardhaArv = arrowmixer.clipAction(animations[159]);
      actionWardhaArv.stop();
      root.children[5].children[0].children[3].visible = false;
      root.children[5].children[1].children[3].visible = false;
    }
  }

  directions.addEventListener("click", () => {
    TopView(startPolarAngle);
    openCloseDirectionBox();
  });

  switch_btn_mumnag.addEventListener("click", () => {
    resetDirection();

    switch_handle_mumnag.classList.add("is-active");

    isMumNagActive = true;

    try {
      cityA.style.color = "rgba(255,255,255, 0.5)";
      cityB.style.color = "rgba(255,255,255, 0.5)";
    } catch (error) {}

    if (isMumNagActive == true) {
      cityA =
        switch_btn_mumnag.previousElementSibling.previousElementSibling
          .previousElementSibling;
      cityB = switch_btn_mumnag.previousElementSibling;
      cityA.style.color = "rgba(255,255,255, 1)";
      cityB.style.color = "rgba(255,255,255, 1)";
    }

    isMumArviActive =
      isMumWardhaActive =
      isNagArviActive =
      isNagWardhaActive =
      isArviWardhaActive =
        false;

    switch_handle_mumarv.classList.remove("is-active");
    switch_handle_arvwardha.classList.remove("is-active");
    switch_handle_mumwardha.classList.remove("is-active");
    switch_handle_nagarv.classList.remove("is-active");
    switch_handle_nagwardha.classList.remove("is-active");

    playDirectionAnim();
  });

  swap_btn_mumnag.addEventListener("click", () => {
    cityA =
      switch_btn_mumnag.previousElementSibling.previousElementSibling
        .previousElementSibling;
    cityB = switch_btn_mumnag.previousElementSibling;
    const { swappedcityA, swappedcityB } = swapCityNames(
      cityA.innerText,
      cityB.innerText
    );

    cityA.innerText = swappedcityA;
    cityB.innerText = swappedcityB;

    isMumNagSwapped = !isMumNagSwapped;

    playDirectionAnim();
  });

  switch_btn_mumarv.addEventListener("click", () => {
    resetDirection();

    switch_handle_mumarv.classList.add("is-active");

    isMumArviActive = true;

    try {
      cityA.style.color = "rgba(255,255,255, 0.5)";
      cityB.style.color = "rgba(255,255,255, 0.5)";
    } catch (error) {}

    if (isMumArviActive == true) {
      cityA =
        switch_btn_mumarv.previousElementSibling.previousElementSibling
          .previousElementSibling;
      cityB = switch_btn_mumarv.previousElementSibling;
      cityA.style.color = "rgba(255,255,255, 1)";
      cityB.style.color = "rgba(255,255,255, 1)";
    }

    isMumNagActive =
      isMumWardhaActive =
      isNagArviActive =
      isNagWardhaActive =
      isArviWardhaActive =
        false;

    switch_handle_mumnag.classList.remove("is-active");
    switch_handle_arvwardha.classList.remove("is-active");
    switch_handle_mumwardha.classList.remove("is-active");
    switch_handle_nagarv.classList.remove("is-active");
    switch_handle_nagwardha.classList.remove("is-active");

    playDirectionAnim();
  });

  swap_btn_mumarv.addEventListener("click", () => {
    cityA =
      switch_btn_mumarv.previousElementSibling.previousElementSibling
        .previousElementSibling;
    cityB = switch_btn_mumarv.previousElementSibling;
    const { swappedcityA, swappedcityB } = swapCityNames(
      cityA.innerText,
      cityB.innerText
    );

    cityA.innerText = swappedcityA;
    cityB.innerText = swappedcityB;

    isMumArviSwapped = !isMumArviSwapped;

    playDirectionAnim();
  });

  switch_btn_mumwardha.addEventListener("click", () => {
    resetDirection();

    switch_handle_mumwardha.classList.add("is-active");

    isMumWardhaActive = true;


    try {
      cityA.style.color = "rgba(255,255,255, 0.5)";
      cityB.style.color = "rgba(255,255,255, 0.5)";
    } catch (error) {}

    if (isMumWardhaActive == true) {
      cityA =
        switch_btn_mumwardha.previousElementSibling.previousElementSibling
          .previousElementSibling;
      cityB = switch_btn_mumwardha.previousElementSibling;
      cityA.style.color = "rgba(255,255,255, 1)";
      cityB.style.color = "rgba(255,255,255, 1)";
    }


    isMumNagActive =
      isMumArviActive =
      isNagArviActive =
      isNagWardhaActive =
      isArviWardhaActive =
        false;

    switch_handle_mumnag.classList.remove("is-active");
    switch_handle_arvwardha.classList.remove("is-active");
    switch_handle_mumarv.classList.remove("is-active");
    switch_handle_nagarv.classList.remove("is-active");
    switch_handle_nagwardha.classList.remove("is-active");

    playDirectionAnim();
  });

  swap_btn_mumwardha.addEventListener("click", () => {
    cityA =
      switch_btn_mumwardha.previousElementSibling.previousElementSibling
        .previousElementSibling;
    cityB = switch_btn_mumwardha.previousElementSibling;
    const { swappedcityA, swappedcityB } = swapCityNames(
      cityA.innerText,
      cityB.innerText
    );

    cityA.innerText = swappedcityA;
    cityB.innerText = swappedcityB;

    isMumWardhaSwapped = !isMumWardhaSwapped;

    playDirectionAnim();
  });

  switch_btn_nagarv.addEventListener("click", () => {
    resetDirection();

    switch_handle_nagarv.classList.add("is-active");

    isNagArviActive = true;

    try {
      cityA.style.color = "rgba(255,255,255, 0.5)";
      cityB.style.color = "rgba(255,255,255, 0.5)";
    } catch (error) {}

    if (isNagArviActive == true) {
      cityA =
        switch_btn_nagarv.previousElementSibling.previousElementSibling
          .previousElementSibling;
      cityB = switch_btn_nagarv.previousElementSibling;
      cityA.style.color = "rgba(255,255,255, 1)";
      cityB.style.color = "rgba(255,255,255, 1)";
    }

    isMumNagActive =
      isMumArviActive =
      isMumWardhaActive =
      isNagWardhaActive =
      isArviWardhaActive =
        false;

    switch_handle_mumnag.classList.remove("is-active");
    switch_handle_arvwardha.classList.remove("is-active");
    switch_handle_mumwardha.classList.remove("is-active");
    switch_handle_mumarv.classList.remove("is-active");
    switch_handle_nagwardha.classList.remove("is-active");
    playDirectionAnim();
  });

  swap_btn_nagarv.addEventListener("click", () => {
    cityA =
      switch_btn_nagarv.previousElementSibling.previousElementSibling
        .previousElementSibling;
    cityB = switch_btn_nagarv.previousElementSibling;
    const { swappedcityA, swappedcityB } = swapCityNames(
      cityA.innerText,
      cityB.innerText
    );

    cityA.innerText = swappedcityA;
    cityB.innerText = swappedcityB;

    isNagArviSwapped = !isNagArviSwapped;

    playDirectionAnim();
  });

  
  
  switch_btn_nagwardha.addEventListener("click", () => {
    resetDirection();

    switch_handle_nagwardha.classList.add("is-active");

    isNagWardhaActive = true;

    try {
      cityA.style.color = "rgba(255,255,255, 0.5)";
      cityB.style.color = "rgba(255,255,255, 0.5)";
    } catch (error) {}

    if (isNagWardhaActive == true) {
      cityA =
        switch_btn_nagwardha.previousElementSibling.previousElementSibling
          .previousElementSibling;
      cityB = switch_btn_nagwardha.previousElementSibling;
      cityA.style.color = "rgba(255,255,255, 1)";
      cityB.style.color = "rgba(255,255,255, 1)";
    }


    isMumNagActive =
      isMumArviActive =
      isMumWardhaActive =
      isNagArviActive =
      isArviWardhaActive =
        false;

    switch_handle_mumnag.classList.remove("is-active");
    switch_handle_arvwardha.classList.remove("is-active");
    switch_handle_mumwardha.classList.remove("is-active");
    switch_handle_nagarv.classList.remove("is-active");
    switch_handle_mumarv.classList.remove("is-active");
    playDirectionAnim();
  });

  swap_btn_nagwardha.addEventListener("click", () => {
    cityA =
      switch_btn_nagwardha.previousElementSibling.previousElementSibling
        .previousElementSibling;
    cityB = switch_btn_nagwardha.previousElementSibling;
    const { swappedcityA, swappedcityB } = swapCityNames(
      cityA.innerText,
      cityB.innerText
    );

    cityA.innerText = swappedcityA;
    cityB.innerText = swappedcityB;

    isNagWardhaSwapped = !isNagWardhaSwapped;

    playDirectionAnim();
  });

  
  switch_btn_arvwardha.addEventListener("click", () => {
    resetDirection();

    switch_handle_arvwardha.classList.add("is-active");

    isArviWardhaActive = true;

    try {
      cityA.style.color = "rgba(255,255,255, 0.5)";
      cityB.style.color = "rgba(255,255,255, 0.5)";
    } catch (error) {}

    if (isArviWardhaActive == true) {
      cityA =
        switch_btn_arvwardha.previousElementSibling.previousElementSibling
          .previousElementSibling;
      cityB = switch_btn_arvwardha.previousElementSibling;
      cityA.style.color = "rgba(255,255,255, 1)";
      cityB.style.color = "rgba(255,255,255, 1)";
    }

    isMumNagActive =
      isMumArviActive =
      isMumWardhaActive =
      isNagArviActive =
      isNagWardhaActive =
        false;

    switch_handle_mumnag.classList.remove("is-active");
    switch_handle_nagwardha.classList.remove("is-active");
    switch_handle_mumwardha.classList.remove("is-active");
    switch_handle_nagarv.classList.remove("is-active");
    switch_handle_mumarv.classList.remove("is-active");
    playDirectionAnim();
  });

  swap_btn_arvwardha.addEventListener("click", () => {
    cityA =
      switch_btn_arvwardha.previousElementSibling.previousElementSibling
        .previousElementSibling;
    cityB = switch_btn_arvwardha.previousElementSibling;
    const { swappedcityA, swappedcityB } = swapCityNames(
      cityA.innerText,
      cityB.innerText
    );

    cityA.innerText = swappedcityA;
    cityB.innerText = swappedcityB;

    isArviWardhaSwapped = !isArviWardhaSwapped;

    playDirectionAnim();
  });
}

load().then(initialize).catch(console.error);
