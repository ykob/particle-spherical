var lastTimeRender;
var renderer;
var scene;
var canvas;
var camera;
var trackball;

var pointLight;
var ambientLight;

var boxObjArr = [];
var boxNum = 192;

var threeStart = function() {
  initThree();
  initCamera();
  initLight();
  
  for (var i = 0; i < boxNum; i++) {
    boxObjArr[i] = new boxObj();
    boxObjArr[i].init(i);
  }
  
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
  camera.up.set(0, 0, 1);
  camera.lookAt({
    x: 0,
    y: 0,
    z: 0
  });
  
  trackball = new THREE.TrackballControls(camera, canvas);
  trackball.screen.width = bodyWidth;
  trackball.screen.height = bodyHeight;
  trackball.noRotate = false;
  trackball.rotateSpeed = 3;
  trackball.noZoom = false;
  trackball.zoomSpeed = 1;
  trackball.noPan = true;
  trackball.minDistance = 200;
  trackball.maxDistance = 3000;
};

var initLight = function() {
  var pointLightSphere;
  
  pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0, 0, 0);
  pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
  
  ambientLight = new THREE.AmbientLight(0x111111);
  
  scene.add(pointLight);
  scene.add(ambientLight);
  
  pointLightSphere = new lightSphereObj();
  pointLightSphere.init();
};

var lightSphereObj = function() {
  this.r = 80;
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.segments = 24;
  this.geometry;
  this.material;
  this.mesh;
};

lightSphereObj.prototype.init = function() {
  this.geometry = new THREE.SphereGeometry(this.r, this.segments);
  this.material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    opacity: 0.9,
    transparent: true
  });
  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.setPosition();
  scene.add(this.mesh);
};

lightSphereObj.prototype.setPosition = function() {
  this.mesh.position.set(this.x, this.y, this.z);
};

var boxObj = function() {
  this.size = 1;
  this.scale = 0;
  this.rad = 0;
  this.rad2 = 0;
  this.r = 240;
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
  this.rad = getRadian(360 * index / boxNum);
  this.rad2 = getRadian(360 * index * 10 / boxNum);
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
  this.x = Math.cos(this.rad) * Math.cos(this.rad2) * this.r;
  this.y = Math.cos(this.rad) * Math.sin(this.rad2) * this.r;
  this.z = Math.sin(this.rad) * this.r;
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

var render = function() {
  renderer.clear();
  for (var i = 0; i < boxObjArr.length; i++) {
    boxObjArr[i].rad += getRadian(0.5);
    boxObjArr[i].rad2 += getRadian(0.5);
    boxObjArr[i].changePositionVal();
    boxObjArr[i].setPosition();
    boxObjArr[i].changeRotationVal();
    boxObjArr[i].setRotation();
  };
  renderer.render(scene, camera);
  trackball.update();
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
