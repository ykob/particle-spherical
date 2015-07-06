var lastTimeRender;
var renderer;
var scene;
var canvas;
var camera;
var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector2();
var intersects;

var pointLight;
var hemiLight;
var lightSphere;
var background;

var boxObjArr = [];
var boxNum = 150;

var judgeRaycastSphere = false;
var accelerating = false;

var threeStart = function() {
  initThree();
  initCamera();
  initLight();
  initBackground();
  
  for (var i = 0; i < boxNum; i++) {
    boxObjArr[i] = new boxObj();
    boxObjArr[i].init(i);
  }
  
  setEvent();
  renderloop();
};

var initThree = function() {
  canvas = document.getElementById('canvas');
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  if (!renderer) {
    alert('Three.jsの初期化に失敗しました。');
  }
  renderer.setSize(bodyWidth, bodyHeight);
  canvas.appendChild(renderer.domElement);
  renderer.setClearColor(0x000000, 1.0);
  scene = new THREE.Scene();
};

var initCamera = function() {
  camera = new THREE.PerspectiveCamera(45, bodyWidth / bodyHeight, 1, 4000);
  camera.position.set(500, 500, 500);
  camera.up.set(0, 1, 0);
  camera.lookAt({
    x: 0,
    y: 0,
    z: 0
  });
};

var initLight = function() {
  pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0, 0, 0);
  
  hemiLight = new THREE.HemisphereLight(0xffff33, 0xff3333, 0);
  
  scene.add(pointLight);
  scene.add(hemiLight);
  
  lightSphere = new LightSphereObj();
  lightSphere.init();
};

var initBackground = function() {
  bgGeometry = new THREE.SphereGeometry(1000, 60, 60);
  bgMaterial = new THREE.MeshLambertMaterial({
    color: 0x7a7a7a,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0
  });
  background = new THREE.Mesh(bgGeometry, bgMaterial);
  scene.add(background);
};

var LightSphereObj = function() {
  this.id = 0;
  this.r = 80;
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.cd = 0.4;
  this.k  = 0.02;
  this.val  = 0;
  this.valBase = this.val;
  this.a = 0;
  this.v = 0;
  this.segments = 30;
  this.geometry;
  this.material;
  this.mesh;
};

LightSphereObj.prototype.init = function() {
  this.geometry = new THREE.SphereGeometry(this.r, this.segments, this.segments);
  this.material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    opacity: 0.9,
    transparent: true
  });
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.setPosition();
  scene.add(this.mesh);
  this.id = this.mesh.id;
};

LightSphereObj.prototype.setPosition = function() {
  this.mesh.position.set(this.x, this.y, this.z);
};

LightSphereObj.prototype.changeScale = function() {
  this.mesh.scale.set(1 - this.val / 500, 1 - this.val / 500, 1 - this.val / 500);
};

LightSphereObj.prototype.mathHook = function() {
  this.a = (this.valBase - this.val) * this.k;
  this.a -= this.cd * this.v;
  this.v += this.a;
  this.val  += this.v;
};

var boxObj = function() {
  this.size = 1;
  this.scale = 0;
  this.rad = 0;
  this.rad2 = 0;
  this.r = 250;
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.rotateX = 0;
  this.rotateY = 0;
  this.rotateZ = 0;
  this.mesh;
};

var boxObjGeometry = new THREE.BoxGeometry(1, 1, 1);

var boxObjMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff
});

boxObj.prototype.init = function(index) {
  this.scale = getRandomInt(8, 36);
  this.mesh = new THREE.Mesh(boxObjGeometry, boxObjMaterial);
  this.rad = getRandomInt(0, 360);
  this.rad2 = getRandomInt(0, 360);
  this.radAccel = getRadian(getRandomInt(6, 10));
  this.changeScale();
  this.changePositionVal();
  this.setPosition();
  this.changeRotationVal();
  this.setRotation();
  scene.add(this.mesh);
};

boxObj.prototype.changeScale = function() {
  this.mesh.scale.x = this.scale * this.size;
  this.mesh.scale.y = this.scale * this.size;
  this.mesh.scale.z = this.scale * this.size;
};

boxObj.prototype.changePositionVal = function() {
  this.x = Math.cos(this.rad) * Math.cos(this.rad2) * (this.r - (lightSphere.val * 1.6));
  this.y = Math.cos(this.rad) * Math.sin(this.rad2) * (this.r - (lightSphere.val * 1.6));
  this.z = Math.sin(this.rad) * (this.r - (lightSphere.val * 1.6));
};

boxObj.prototype.setPosition = function() {
  this.mesh.position.set(this.x, this.y, this.z);
};

boxObj.prototype.changeRotationVal = function() {
  this.rotateX = this.rad * 2;
  this.rotateY = this.rad * 2;
  this.rotateZ = this.rad * 2;
};

boxObj.prototype.setRotation = function() {
  this.mesh.rotation.set(this.rotateX, this.rotateY, this.rotateZ);
};

var setEvent = function () {
  var mousedownX = 0;
  var mousedownY = 0;
  
  var eventTouchStart = function(x, y) {
    judgeRaycastSphere = true;
  };

  var eventTouchMove = function(x, y) {
    mousemoveX = x;
    mousemoveY = y;
    mouseVector.x = (x / window.innerWidth) * 2 - 1;
    mouseVector.y = - (y / window.innerHeight) * 2 + 1;
    judgeRaycastSphere = false;
  };

  var eventTouchEnd = function() {
    accelerating = false;
    lightSphere.valBase = 0;
  };
  
  window.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  window.addEventListener('selectstart', function (event) {
    event.preventDefault();
  });
  
  window.addEventListener('mousedown', function (event) {
    event.preventDefault();
    eventTouchStart(event.clientX, event.clientY);
  });
  
  window.addEventListener('mousemove', function (event) {
    event.preventDefault();
    eventTouchMove(event.clientX, event.clientY);
  });
  
  window.addEventListener('mouseup', function (event) {
    event.preventDefault();
    eventTouchEnd();
  });
  
  window.addEventListener('touchstart', function (event) {
    event.preventDefault();
    eventTouchStart(event.touches[0].clientX, event.touches[0].clientY);
  });
  
  window.addEventListener('touchend', function (event) {
    event.preventDefault();
    eventTouchEnd();
  });
}

var render = function() {
  var focusLightSphere = false;
  
  renderer.clear();
  raycaster.setFromCamera(mouseVector, camera);
  intersects = raycaster.intersectObjects(scene.children);
  for (var i = 0; i < intersects.length; i++) {
    if (intersects[i].object.id == lightSphere.id) {
      focusLightSphere = true;
      document.body.className = 'is-focus-sphere';
      if (judgeRaycastSphere) {
        accelerating = true;
        lightSphere.valBase = 100;
      }
    }
  }
  if (!focusLightSphere) {
    document.body.className = '';
  };
  lightSphere.mathHook();
  lightSphere.changeScale();
  hemiLight.intensity = lightSphere.val / 105;
  background.material.opacity = lightSphere.val / 100;
  for (var i = 0; i < boxObjArr.length; i++) {
    boxObjArr[i].rad += getRadian(0.12) + (boxObjArr[i].radAccel * (lightSphere.val / 100));
    boxObjArr[i].rad2 += getRadian(0.12) + (boxObjArr[i].radAccel * (lightSphere.val / 100));
    boxObjArr[i].changePositionVal();
    boxObjArr[i].setPosition();
    boxObjArr[i].changeRotationVal();
    boxObjArr[i].setRotation();
  };
  renderer.render(scene, camera);
};

var renderloop = function() {
  var now = +new Date();
  requestAnimationFrame(renderloop);

  if (now - lastTimeRender < frameTime) {
    return;
  }
  render();
  lastTimeRender = +new Date();
};

var resizeRenderer = function() {
  bodyWidth  = document.body.clientWidth;
  bodyHeight = document.body.clientHeight;
  renderer.setSize(bodyWidth, bodyHeight);
  initCamera();
};

debounce(window, 'resize', function(event){
  resizeRenderer();
});

threeStart();
