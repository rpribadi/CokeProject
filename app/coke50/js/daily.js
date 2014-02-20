/**
 * dat.globe Javascript WebGL Globe Toolkit
 * http://dataarts.github.com/dat.globe
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var DAT = DAT || {};
var camera = null;
var composer, effectFocus;
var rotation = null; 
var target = { x: 3.0023889803846893, y: 0.7635987755982989 };
var R = 200;
//var distanceTarget = 100000;

//var target_1 = {x: 2.964955396106033, y: 0.7201028706105379};
//var target_2 = {x: 2.964955396106033, y: 0.7201028706105379};
//var target_3 = {x: 2.964955396106033, y: 0.7201028706105379};


//var target_2 = {x: 3.3556551396534653, y: 0.4944166519362625};
//var target_3 = {x: 3.254085128246786, y: 0.5582591552116186};
//var distanceTarget_1 = 460;
//var distanceTarget_2 = 380;
//var distanceTarget_3 = 400;
var imgDir = '/coke50/image/';

//set camera zoom in trajectory
var trajectory = [
  {dist : 390,
    targ: {x: 3.2484077502602235, y: 0.5993469676865384}},

  {dist : 220,
    targ: {x: 3.2713414803550953, y: 0.5799547862833997}}
]


// Press keyboard "a" to start camera zoom in onto earth
zoom_to_top10 = function(duration){

  var p1 = duration/Math.abs(trajectory[0].dist - distanceTarget) * 5
  camera_move(trajectory[0].targ,trajectory[0].dist,-5,p1);

  //remove camera tween:
  var t = parseInt(globe.time * test); // get current globe time;
  cam_tweens[t+1].stop();

  console.log(cam_tweens);
  //event.preventDefault();

  var tween = new TWEEN.Tween(globe.points.material).to({opacity: 0.3},duration/2).easing(TWEEN.Easing.Cubic.EaseOut).start();
  
  setTimeout(function(){
    var p2 = duration/Math.abs(trajectory[1].dist - distanceTarget) * 5
    camera_move(trajectory[1].targ,trajectory[1].dist,-5,p2);
    var tween = new TWEEN.Tween(globe.points.material).to({opacity: 0},duration*2).easing(TWEEN.Easing.Cubic.EaseOut).start();
    
  }, duration+500);
  var image = THREE.ImageUtils.loadTexture(imgDir+'world_3.jpg');
    
  setTimeout(function(){

      mesh_globe.material.uniforms.texture.value = image;
  },duration + 1500);  
  
}


DAT.Globe = function(container, colorFn) {

  distanceTarget = 500;
  c_close = 450; c_far = 550;


  colorFn = function(x) {
    var c = new THREE.Color();
    //c.setHSL( ( 0.0 + ( x * 20 ) ), 1.0, 0.5 );
    c.setHSL( x, 1.0, 0.5 );
    //console.log(0.6 - ( x * 0.5 ) );
    //console.log(c);
    return c;
  };

  var Shaders = {
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: null }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vNormal = normalize( normalMatrix * normal );',
          'vUv = uv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D texture;',
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'vec3 diffuse = texture2D( texture, vUv ).xyz;',
          'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
          'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
        '}'
      ].join('\n')
    },
    'atmosphere' : {
      uniforms: {},
      vertexShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'vNormal = normalize( normalMatrix * normal );',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
          'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
        '}'
      ].join('\n')
    }
  };

  var scene, renderer, w, h;
  var mesh, atmosphere, point;
  
  var overRenderer;

 

  var curZoomSpeed = 0;
  var zoomSpeed = 50;

  var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
      targetOnDown = { x: 0, y: 0 };
  
  var rotation = { x: 0, y: 0.0 };
  //target = { x: Math.PI*3/2, y: Math.PI / 6.0 };
  
  var distance = 100000; 
  var padding = 40;
  var PI_HALF = Math.PI / 2;
  var effectFXAA;

  function init() {

    container.style.color = '#fff';
    container.style.font = '13px/20px Arial, sans-serif';

    var shader, uniforms, material;
    w = container.offsetWidth || window.innerWidth;
    h = container.offsetHeight || window.innerHeight;

    camera = new THREE.PerspectiveCamera(30, w / h, 1, 10000);
    //camera.position.z = distance;

    scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(R, 40, 30);

    shader = Shaders['earth'];
    
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['texture'].value = THREE.ImageUtils.loadTexture(imgDir+'world.jpg');

    uniforms_2 = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms_2['texture'].value = THREE.ImageUtils.loadTexture(imgDir+'world_3.jpg');
    
    //Here set the material of the globe
    material_g_zoom1  = new THREE.ShaderMaterial({

          uniforms: uniforms,
          transparent:true,
          opacity:1,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        });

    mesh_globe = new THREE.Mesh(geometry, material_g_zoom1);//innitiate globe
    mesh_globe.rotation.y = Math.PI;
    scene.add(mesh_globe);

    shader = Shaders['atmosphere'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);
   
    material = new THREE.ShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true

        });

    mesh = new THREE.Mesh(geometry, material);//innitiate atmosphere
    mesh.scale.set( 1.2, 1.2, 1.2 );
    scene.add(mesh);

    geometry = new THREE.CubeGeometry(0.75, 0.75, 1);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.5));

    point = new THREE.Mesh(geometry);

    renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true, 
      antialias: false
    });
    
    renderer.setSize(w, h);
    renderer.setClearColor( 0x000000, 1 );

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.id = 'canvas';

        // postprocessing

    var renderModel = new THREE.RenderPass( scene, camera );
    var effectBloom = new THREE.BloomPass( 1.5 );
    var effectFilm = new THREE.FilmPass( 0.5, 0.5, 1448, false );

    effectFocus = new THREE.ShaderPass( THREE.FocusShader );

    effectFocus.uniforms[ "screenWidth" ].value = window.innerWidth;
    effectFocus.uniforms[ "screenHeight" ].value = window.innerHeight;

    effectFocus.renderToScreen = true;
    
    effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );



    composer = new THREE.EffectComposer( renderer );

    composer.addPass( renderModel );
    //composer.addPass( effectBloom );
    composer.addPass( effectFXAA );
    //composer.addPass( effectFilm );
    composer.addPass( effectFocus );



    container.appendChild(renderer.domElement);

    container.addEventListener('mousedown', onMouseDown, false);

    container.addEventListener('mousewheel', onMouseWheel, false);

    document.addEventListener('keydown', onDocumentKeyDown, false);

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mouseover', function() {
      overRenderer = true;
    }, false);

    container.addEventListener('mouseout', function() {
      overRenderer = false;
    }, false);
  }

  addData = function(data, opts) {
    var lat, lng, size, color, i, step, colorFnWrapper;

    c_scale = d3.scale.linear()
                    .domain([MIN, MAX])
                    .range([0.0, 0.25]);

    opts.animated = opts.animated || false;
    this.is_animated = opts.animated;
    opts.format = opts.format || 'magnitude'; // other option is 'legend'

    colorFnWrapper = function(total) { return colorFn(c_scale(total)); };
    
    if (opts.animated) {
      if (this._baseGeometry === undefined) {
        this._baseGeometry = new THREE.Geometry();
        for (i = 0; i < data.length; i ++) {
          lat = parseFloat(data[i].lat);
          lng = parseFloat(data[i].lng);
          color = colorFnWrapper(parseFloat(data[i].total));
          size = 0;
          addPoint(lat, lng, size, color, this._baseGeometry);
        }
      }
      if(this._morphTargetId === undefined) {
        this._morphTargetId = 0;
      } else {
        this._morphTargetId += 1;
      }
      opts.name = opts.name || 'morphTarget'+this._morphTargetId;
    }

    var subgeo = new THREE.Geometry();
    for (i = 0; i < data.length; i++) {
      lat = parseFloat(data[i].lat);
      lng = parseFloat(data[i].lng);
      color = colorFnWrapper(parseFloat(data[i].total));
      size = parseFloat(data[i].total);
      size = size/5000;
      
      addPoint(lat, lng, size, color, subgeo);

      //addPoint(lat, lng, size, color, opts.name,subgeo);
    }

    //console.log(subgeo);
    
    if (opts.animated) {

      this._baseGeometry.morphTargets.push({'name': opts.name, vertices: subgeo.vertices});
      this._baseGeometry.morphColors.push({'name': opts.name, colors: subgeo.colors});
    } else {
      this._baseGeometry = subgeo;
    }

  };




  function createPoints() {
    if (this._baseGeometry !== undefined) {
      if (this.is_animated === false) {
        //console.log(this._baseGeometry);
        this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
              color: 0xffffff,
              vertexColors: THREE.FaceColors,
              morphTargets: false
            }));
      } else {
        console.log("is_animated != false");
        if (this._baseGeometry.morphTargets.length < 8) {
          console.log('t l',this._baseGeometry.morphTargets.length);
          var padding = 8-this._baseGeometry.morphTargets.length;
          console.log('padding', padding);
          for(var i=0; i<=padding; i++) {
            console.log('padding',i);
            this._baseGeometry.morphTargets.push({'name': 'morphPadding'+i, vertices: this._baseGeometry.vertices});
            this._baseGeometry.morphColors.push({ 'name': 'morphPadding'+i, colors: this._baseGeometry.colors})
          }
        }
        this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
              color: 0xffffff,
              attributes: {},
              vertexColors: THREE.FaceColors,
              //blending: THREE.AdditiveBlending, 
              transparent: true,
              opacity:0.6,
              morphTargets: true
            }));
      }      
      scene.add(this.points);
    }
  }
  
  function PointPosition(lat, lng, r) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (180 - lng) * Math.PI / 180;

    point.position.x = r * Math.sin(phi) * Math.cos(theta);
    point.position.y = r * Math.cos(phi);
    point.position.z = r * Math.sin(phi) * Math.sin(theta);

  }


  function addPoint(lat, lng, size, color, subgeo) {

    PointPosition(lat,lng,R);

    point.lookAt(mesh.position);

    point.scale.x = 0.2;
    point.scale.y = 0.2;

    point.scale.z = Math.max( size, 0.1 ); // avoid non-invertible matrix
    point.updateMatrix();

    for (var i = 0; i < point.geometry.faces.length; i++) {
      point.geometry.faces[i].color = color;
      subgeo.colors.push(color);
    }
      
    THREE.GeometryUtils.merge(subgeo, point);  
  }

  function onMouseDown(event) {
    event.preventDefault();

    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
    container.addEventListener('mouseout', onMouseOut, false);

    mouseOnDown.x = - event.clientX;
    mouseOnDown.y = event.clientY;

    targetOnDown.x = target.x;
    targetOnDown.y = target.y;

    container.style.cursor = 'move';
  }

  function onMouseMove(event) {
    mouse.x = - event.clientX;
    mouse.y = event.clientY;

    var zoomDamp = distance/1000;

    target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
    target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

    target.y = target.y > PI_HALF ? PI_HALF : target.y;
    target.y = target.y < - PI_HALF ? - PI_HALF : target.y;
  }

  function onMouseUp(event) {
    container.removeEventListener('mousemove', onMouseMove, false);
    container.removeEventListener('mouseup', onMouseUp, false);
    container.removeEventListener('mouseout', onMouseOut, false);
    container.style.cursor = 'auto';
  }

  function onMouseOut(event) {
    container.removeEventListener('mousemove', onMouseMove, false);
    container.removeEventListener('mouseup', onMouseUp, false);
    container.removeEventListener('mouseout', onMouseOut, false);
  }

  function onMouseWheel(event) {
    event.preventDefault();
    if (overRenderer) {
      zoom(event.wheelDeltaY * 0.3);
    }
    return false;
  }


  function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
  }

  function zoom(delta) {
    distanceTarget -= delta;
    distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
    distanceTarget = distanceTarget < 210 ? 210 : distanceTarget;
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    zoom(curZoomSpeed);

    rotation.x += (target.x - rotation.x) * 0.1;
    rotation.y += (target.y - rotation.y) * 0.1;
    distance += (distanceTarget - distance) * 0.3;

    camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
    camera.position.y = distance * Math.sin(rotation.y);
    camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

    //33.65   84.42  Atlanta,GA
    var c = {lat:33.34, lng: -97.1927};

    var phi_c = (90 - c.lat) * Math.PI / 180;
    var theta_c = (180 - c.lng) * Math.PI / 180;

    point.position.x = 150 * Math.sin(phi_c) * Math.cos(theta_c);
    point.position.y = 150 * Math.cos(phi_c);
    point.position.z = 150 * Math.sin(phi_c) * Math.sin(theta_c);
    //center of us lat: 39.8282 lng:98.5795

    camera.lookAt(point.position);
    //composer.render( 0.01 );
    //renderer.render(scene, camera);

    renderer.clear();
    composer.render(0.001);
  }

  init();
  this.animate = animate;
  this.render = render;



    this.__defineGetter__('time', function() {
    return this._time || 0;
  });

  this.__defineSetter__('time', function(t) {

    ///////////////////
    //update geometry//
    ///////////////////

    var validMorphs = [];
    var morphDict = this.points.morphTargetDictionary;
    for(var k in morphDict) {
      if(k.indexOf('morphPadding') < 0) {
        validMorphs.push(morphDict[k]);
      }
    }
    validMorphs.sort();
    var l = validMorphs.length;
    var scaledt = t*l+1;
    if(scaledt >= test) return;
    var index = Math.floor(scaledt);
   
    for (i = 0; i < validMorphs.length; i++) {
      this.points.morphTargetInfluences[validMorphs[i]] = 0;
    }

    var lastIndex = index - 1;
    var leftover = scaledt - index;
    if (lastIndex >= 0) {
      this.points.morphTargetInfluences[lastIndex] = 1 - leftover;
    }
    this.points.morphTargetInfluences[index] = leftover;
    
    ////////////////
    //update color//
    ////////////////

    var cl = this.points.geometry.faces.length;
    if(lastIndex >= 0){
      for (var c = 0; c < cl; c++){
          var ori_h = this.points.geometry.morphColors[lastIndex].colors[c].getHSL().h
          var color_distance = this.points.geometry.morphColors[index].colors[c].getHSL().h - ori_h;
          var color_delta = color_distance * leftover;
          this.points.geometry.faces[c].color.setHSL(ori_h+color_delta,1.0,0.5);
      } 
    }
    this.points.geometry.colorsNeedUpdate = true;

    /////////////////
    //update slider//
    /////////////////
    d3.select("#dot")
      .transition()
      
      .attr("cx",x_scale(d_scale(t*l)))
      .ease("linear")
      .duration(0); 

    d3.select("#date")
      .transition()
      
      .attr("transform", "translate(" + x_scale(d_scale(t*l)) + ", 20)")
      .ease("linear")
      .duration(0);

    $("#date").text(format_date(new Date(d_scale(t*l))));
       
    this._time = t;

  });

  this.addData = addData;
  this.addParticle = addParticle;
  this.createPoints = createPoints;
  this.renderer = renderer;
  this.scene = scene;
  this.colorFn = colorFn;

  return this;

};



