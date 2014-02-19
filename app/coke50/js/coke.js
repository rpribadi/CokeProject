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
var rotation = null; 
var target = { x: 3.0023889803846893, y: 0.7635987755982989 };
var distanceTarget = 100000;

var target_1 = {x: 2.964955396106033, y: 0.7201028706105379};
var target_2 = {x: 2.964955396106033, y: 0.7201028706105379};
var target_3 = {x: 2.964955396106033, y: 0.7201028706105379};
//var target_2 = {x: 3.3556551396534653, y: 0.4944166519362625};
//var target_3 = {x: 3.254085128246786, y: 0.5582591552116186};
var distanceTarget_1 = 460;
var distanceTarget_2 = 380;
var distanceTarget_3 = 400;


DAT.Globe = function(container, colorFn) {


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

  var imgDir = '/coke50/image/';

  var curZoomSpeed = 0;
  var zoomSpeed = 50;

  var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
      targetOnDown = { x: 0, y: 0 };
  
  rotation = { x: 0, y: 0.0 };
  //target = { x: Math.PI*3/2, y: Math.PI / 6.0 };
  


  var distance = 100000; 
  var padding = 40;
  var PI_HALF = Math.PI / 2;

  function init() {

    container.style.color = '#fff';
    container.style.font = '13px/20px Arial, sans-serif';

    var shader, uniforms, material;
    w = container.offsetWidth || window.innerWidth;
    h = container.offsetHeight || window.innerHeight;

    camera = new THREE.PerspectiveCamera(30, w / h, 1, 10000);
    //camera.position.z = distance;

    scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(200, 40, 30);

    shader = Shaders['earth'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['texture'].value = THREE.ImageUtils.loadTexture(imgDir+'world.jpg');

    
    material = new THREE.ShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        });

    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = Math.PI;
    scene.add(mesh);

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

    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set( 1.1, 1.1, 1.1 );
    scene.add(mesh);

    geometry = new THREE.CubeGeometry(0.75, 0.75, 1);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.5));

    point = new THREE.Mesh(geometry);

    renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true, 
      antialias: true});
    renderer.setSize(w, h);
    renderer.setClearColor( 0x000000, 1 );

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.id = 'canvas';

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
    var max = d3.max(data, function(d) { return parseFloat(d.total);} );

    var min = d3.min(data, function(d) { return parseFloat(d.total);} );

    console.log(min);
    console.log(max);
    var c_scale = d3.scale.linear()
                    .domain([min, max])
                    .range([0.0, 0.2]);

    //min = 1700000                
    if (opts.name == 'machine50') c_scale.domain([1700000, 141000000]);                       

    opts.animated = opts.animated || false;
    this.is_animated = opts.animated;
    opts.format = opts.format || 'magnitude'; // other option is 'legend'
    console.log(opts.format);

    if(opts.name == 'machine') colorFnWrapper = function(total) { return colorFn(c_scale(total));  }
    else colorFnWrapper = function(total) { return colorFn(0.0); }
    //colorFnWrapper = function(total) { return colorFn(c_scale(total)); }

    // if option animated
    
    if (opts.animated) {
      if (this._baseGeometry === undefined) {
        this._baseGeometry = new THREE.Geometry();
        for (i = 0; i < data.length; i ++) {
          lat = parseFloat(data[i].lat);
          lng = parseFloat(data[i].lng);
//        size = data[i + 2];
          color = opts.name == 'machine50'? colorFnWrapper(parseFloat(data[i].ww)):colorFnWrapper(parseFloat(data[i].total));
          //color = colorFn(11);
          size = 0;
          addPoint(lat, lng, size, color, opts.name,this._baseGeometry);
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
      //color = colorFn(11);
      //total = parseFloat(data[i].total)
      color = opts.name == 'machine50'? colorFnWrapper(parseFloat(data[i].ww)):colorFnWrapper(parseFloat(data[i].total));
      //console.log(color);

      size = opts.name == 'machine50'? parseFloat(data[i].ww):parseFloat(data[i].total);
      size = opts.name == 'machine50'? size/1500000:size/1500000;
      


      addPoint(lat, lng, size, color, opts.name, subgeo);
      //addPoint(lat, lng, size, color, opts.name,subgeo);
    }
    //console.log(subgeo);
    
    if (opts.animated) {
      this._baseGeometry.morphTargets.push({'name': opts.name, vertices: subgeo.vertices});
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
          }
        }
        this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
              color: 0xffffff,
              vertexColors: THREE.FaceColors,
              morphTargets: true
            }));
      }      
      scene.add(this.points);
    }
  }
  

  function addPoint(lat, lng, size, color, name, subgeo) {

    
    
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (180 - lng) * Math.PI / 180;

    point.position.x = 200 * Math.sin(phi) * Math.cos(theta);
    point.position.y = 200 * Math.cos(phi);
    point.position.z = 200 * Math.sin(phi) * Math.sin(theta);

    point.lookAt(mesh.position);

    if(name =='machine' || name=='machine_all' || name=='machine50'){
      point.scale.x = 0.3;
      point.scale.y = 0.3;
    } else {
      point.scale.x = 1;
      point.scale.y = 1;
    }
    
    point.scale.z = Math.max( size, 0.1 ); // avoid non-invertible matrix
    point.updateMatrix();

    for (var i = 0; i < point.geometry.faces.length; i++) {

      point.geometry.faces[i].color = color;

    }
      
    THREE.GeometryUtils.merge(subgeo, point);  
    
    /*
    var points = new THREE.Mesh(subgeo, new THREE.MeshBasicMaterial({
          color: 0xffffff,
          vertexColors: THREE.FaceColors,
          morphTargets: false
        }));
    
    //scene.add(point);
    scene.add(points);
*/  
  }
/*
  function generateSprite() {

    var canvas = document.createElement( 'canvas' );
    canvas.width = 16;
    canvas.height = 16;

    var context = canvas.getContext( '2d' );
    var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
    gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
    gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
    gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
    gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );

    return canvas;

  }
*/
  function initAnimation( point, delay ) {

    var point = point;
    var delay = delay !== undefined ? delay : 0;

    particle.position.set( 0, 0, 0 )
    particle.scale.x = particle.scale.y = Math.random() * 32 + 16;

    new TWEEN.Tween( particle )
      .delay( delay )
      .to( {}, 10000 )
      .onComplete( initParticle )
      .start();

    new TWEEN.Tween( particle.position )
      .delay( delay )
      .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 - 2000 }, 10000 )
      .start();

    new TWEEN.Tween( particle.scale )
      .delay( delay )
      .to( { x: 0, y: 0 }, 10000 )
      .start();

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

    renderer.render(scene, camera);
  }

  init();
  this.animate = animate;


  this.__defineGetter__('time', function() {
    return this._time || 0;
  });

  this.__defineSetter__('time', function(t) {
    var validMorphs = [];
    var morphDict = this.points.morphTargetDictionary;
    for(var k in morphDict) {
      if(k.indexOf('morphPadding') < 0) {
        validMorphs.push(morphDict[k]);
      }
    }
    validMorphs.sort();
    var l = validMorphs.length-1;
    var scaledt = t*l+1;
    var index = Math.floor(scaledt);
    for (i=0;i<validMorphs.length;i++) {
      this.points.morphTargetInfluences[validMorphs[i]] = 0;
    }
    var lastIndex = index - 1;
    var leftover = scaledt - index;
    if (lastIndex >= 0) {
      this.points.morphTargetInfluences[lastIndex] = 1 - leftover;
    }
    this.points.morphTargetInfluences[index] = leftover;
    this._time = t;
  });



  this.addData = addData;
  this.createPoints = createPoints;
  this.renderer = renderer;
  this.scene = scene;

  return this;

};

