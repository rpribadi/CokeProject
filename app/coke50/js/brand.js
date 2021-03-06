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

var target = { x: 0, y: 0 };
var R = 200;
//var distanceTarget = 100000;

var imgDir = '/coke50/image/';

//set camera zoom in trajectory
var trajectory = [
  {dist : 385,
    targ: {x: 3.237756980030839, y: 0.5955732709320553}},

  {dist : 202,
    targ: {x: 3.2393961763606662, y: 0.5938913293721974}},

 {dist : 440,
    targ: {x: 4.191986204907064, y: 0.4085451142172577}},

]

stop_tween =  function(){
    var t = parseInt(globe.time * test *2); // get current globe time;
    //console.log("globe.time =" + globe.time);
    //console.log("t=" +t);

    cam_tweens[t+1].stop();
}
//{x: 2.255880835756043, y: 0.5066305977916148}
//442
// Press keyboard "a" to start camera zoom in onto earth
zoom_to_top10 = function(duration){

  var p1 = duration/Math.abs(trajectory[0].dist - distanceTarget) * 5
  camera_move(trajectory[0].targ,trajectory[0].dist,-5,p1);

  stop_tween();

  //console.log(cam_tweens);
  //event.preventDefault();
  var tween = new TWEEN.Tween(globe.s.material).to({opacity: 0.4},duration/2).easing(TWEEN.Easing.Cubic.EaseOut).start();
  
  setTimeout(function(){
    var p2 = duration/Math.abs(trajectory[1].dist - distanceTarget) * 5
    camera_move(trajectory[1].targ,trajectory[1].dist,-5,p2);
    var tween = new TWEEN.Tween(globe.points.material).to({opacity: 0.1},duration*2).easing(TWEEN.Easing.Cubic.EaseOut).delay(1000).start();
    var tween = new TWEEN.Tween(globe.points_top.material).to({opacity: 0.1},duration*2).easing(TWEEN.Easing.Cubic.EaseOut).delay(1000).start();
    
  }, duration*3);

  // world_3.jpg width is 6144 pixels, too wide for macbook pro
  //var image = THREE.ImageUtils.loadTexture(imgDir+'world_3.jpg');

  // Use 4096 pixel instead
 //var image = THREE.ImageUtils.loadTexture(imgDir+'world_3_4096.jpg');

/*
  setTimeout(function(){

      mesh_globe.material.uniforms.texture.value = image;
  },duration + 1500);  
  */
}


zoom_to_water = function(duration){

  var p1 = duration/Math.abs(trajectory[2].dist - distanceTarget) * 5
  camera_move(trajectory[2].targ,trajectory[2].dist,-5,p1);

  //remove camera tween:

  stop_tween();
  /*
  console.log(cam_tweens);

  //event.preventDefault();
  var tween = new TWEEN.Tween(globe.points.material).to({opacity: 0.3},duration/2).easing(TWEEN.Easing.Cubic.EaseOut).start();
  
  setTimeout(function(){
    var p2 = duration/Math.abs(trajectory[1].dist - distanceTarget) * 5
    camera_move(trajectory[1].targ,trajectory[1].dist,-5,p2);
    var tween = new TWEEN.Tween(globe.points.material).to({opacity: 0},duration*2).easing(TWEEN.Easing.Cubic.EaseOut).start();
    var tween = new TWEEN.Tween(globe.points_top.material).to({opacity: 0},duration*2).easing(TWEEN.Easing.Cubic.EaseOut).start();    
  }, duration+500);
*/
}


DAT.Globe = function(container, colorFn) {

  distanceTarget = 500;
  c_close = 450; c_far = 550;

  color_dict = {
    "Coke": new THREE.Color().setHSL( 0.0, 1.0, 0.5 ),
    "DietCoke": new THREE.Color().setHSL( 0.75, 1.0, 0.5 ),
    "Sprite": new THREE.Color().setHSL( 0.5, 1.0, 0.5 ),
    "DrPepper": new THREE.Color().setHSL( 0.91, 1.0, 0.5 ),
    "Fanta": new THREE.Color().setHSL( 0.8, 1.0, 0.5 )
  }

  colorFn = function(x) {
    var c = new THREE.Color();
    //c.setHSL( ( 0.0 + ( x * 20 ) ), 1.0, 0.5 );
    c.setHSL( x, 1.0, 0.5 );
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
    //point_top = new THREE.Mesh(geometry);

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

    //composer = new THREE.EffectComposer( renderer );

    //composer.addPass( renderModel );
    //composer.addPass( effectBloom );
    //composer.addPass( effectFXAA );
    //composer.addPass( effectFilm );
    //composer.addPass( effectFocus );

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
    var lat, lng, size, size_0, bottom, color, i, j,step, colorFnWrapper;

    opts.animated = opts.animated || false;
    this.is_animated = opts.animated;
    opts.format = opts.format || 'magnitude'; // other option is 'legend'
    data.sort(function(a,b){return a.machineId - b.machineId});//sort base on machineId;
    console.log(data);
    
    if (opts.animated) {
      if (this._baseGeometry === undefined) {
        this._baseGeometry = new THREE.Geometry();
        //this._topGeometry = new THREE.Geometry();
        
        for (i = 0; i < data.length; i++) {//for each machine
          size_0 = 0;
          if (m_loc[data[i].machineId] !== undefined && m_dict[data[i].machineId] == 30) {
            for (j = 0; j < data[i].values.length; j++){// for each brand
              lat = parseFloat(m_loc[data[i].machineId].lat);
              lng = parseFloat(m_loc[data[i].machineId].lng);
              color = color_dict[data[i].values[j].type];
              bottom = size_0; 
              size = 0;
              addStackPoint(lat, lng, bottom, size, color, this._baseGeometry);
              size_0 += size;
            }
          } else {
            console.log("can't find location of" + data[i].machineId);
          }
             
        }
      }
      if(this._morphTargetId === undefined) {
        this._morphTargetId = 0;
      } else {
        this._morphTargetId += 2;
      }
      opts.name = opts.name || 'morphTarget'+this._morphTargetId;
    }

    var subgeo = new THREE.Geometry();
    //var topgeo = new THREE.Geometry();
    
    for (i = 0; i < data.length; i++) {

       size_0 = 0;
       if (m_loc[data[i].machineId] !== undefined && m_dict[data[i].machineId] == 30) {
         for (j = 0; j < data[i].values.length; j++){
            lat = parseFloat(m_loc[data[i].machineId].lat);
            lng = parseFloat(m_loc[data[i].machineId].lng);
            color = color_dict[data[i].values[j].type];
            size = data[i].values[j].value;
            size = size/5000;
            bottom = size_0; 
            addStackPoint(lat, lng, bottom, size, color, subgeo);
            size_0 += size;
        }
      } else {
        console.log("can't find location of" + data[i].machineId);
      }
    }
    //console.log(subgeo);
    
    if (opts.animated) {

      this._baseGeometry.morphTargets.push({'name': opts.name + "-day", vertices: subgeo.vertices});
      this._baseGeometry.morphTargets.push({'name': opts.name + "-night", vertices: this._baseGeometry.vertices});
      this._baseGeometry.morphColors.push({'name': opts.name, colors: subgeo.colors});
      this._baseGeometry.morphColors.push({'name': opts.name, colors: subgeo.colors});
      //this._topGeometry.morphTargets.push({'name': opts.name + "-day", vertices: topgeo.vertices})
      //this._topGeometry.morphTargets.push({'name': opts.name + "-night", vertices: this._topGeometry.vertices})
    } else {
      this._baseGeometry = subgeo;
      //this._topGeometry = topgeo;
    }



  };

  function createPoints() {
    if (this._baseGeometry !== undefined) {
      if (this.is_animated === false) {
        this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
              color: 0xffffff,
              vertexColors: THREE.FaceColors,
              morphTargets: false
            }));
      } else {
        if (this._baseGeometry.morphTargets.length < 8) {
          var padding = 8-this._baseGeometry.morphTargets.length;
          for(var i=0; i<=padding; i++) {
            this._baseGeometry.morphTargets.push({'name': 'morphPadding'+i, vertices: this._baseGeometry.vertices});
            this._baseGeometry.morphColors.push({ 'name': 'morphPadding'+i, colors: this._baseGeometry.colors})
            //this._topGeometry.morphTargets.push({'name': 'morphPadding'+i, vertices: this._topGeometry.vertices});
            //this._topGeometry.morphColors.push({ 'name': 'morphPadding'+i, colors: this._topGeometry.colors})
          
          }
        }
        this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
          color: 0xffffff,
          attributes: {},
          vertexColors: THREE.FaceColors,
          transparent: true,
          opacity:0.6,
          morphTargets: true
        }));
        /*
        this.points_top = new THREE.Mesh(this._topGeometry, new THREE.MeshBasicMaterial({
          color: 0xffffff,
          attributes: {},
          vertexColors: THREE.FaceColors,
          transparent: true,
          opacity:1,
          morphTargets: true
        }));  */      
      }      
      scene.add(this.points);
      //scene.add(this.points_top);
    }
  }
  
  function PointPosition(lat, lng,size,r) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (180 - lng) * Math.PI / 180;

    point.position.x = r * Math.sin(phi) * Math.cos(theta);
    point.position.y = r * Math.cos(phi);
    point.position.z = r * Math.sin(phi) * Math.sin(theta);

    //point_top.position.x = (r + size + 1.5) * Math.sin(phi) * Math.cos(theta);
    //point_top.position.y = (r + size + 1.5) * Math.cos(phi);
    //point_top.position.z = (r + size + 1.5) * Math.sin(phi) * Math.sin(theta);

  }


  function addStackPoint(lat, lng, bottom, size, color, subgeo) {

    PointPosition(lat,lng,size,R+bottom);

    point.lookAt(mesh.position);
    // point_top.lookAt(mesh.position);

    point.scale.x = 0.2;
    point.scale.y = 0.2;

    point.scale.z = Math.max( size, 0.1 ); // avoid non-invertible matrix
    point.updateMatrix();

   //point_top.scale.x = 0.3;
    //point_top.scale.y = 0.3;
    //point_top.scale.z = 0.3;
    //point_top.updateMatrix();
    

    for (var i = 0; i < point.geometry.faces.length; i++) {
      point.geometry.faces[i].color = color;
      //point_top.geometry.faces[i].color = color;
      subgeo.colors.push(color);
    }
      
    THREE.GeometryUtils.merge(subgeo, point);

    //THREE.GeometryUtils.merge(topgeo, point_top);

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
    distanceTarget = distanceTarget < 202 ? 202 : distanceTarget;
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
    //var c = {lat:33.65, lng: -84.42};

    var phi_c = (90 - c.lat) * Math.PI / 180;
    var theta_c = (180 - c.lng) * Math.PI / 180;

    point.position.x = 150 * Math.sin(phi_c) * Math.cos(theta_c);
    point.position.y = 150 * Math.cos(phi_c);
    point.position.z = 150 * Math.sin(phi_c) * Math.sin(theta_c);
    //center of us lat: 39.8282 lng:98.5795

    camera.lookAt(point.position);
    //composer.render( 0.01 );
    renderer.clear();
    renderer.render(scene, camera);

    
    //composer.render(0.01);
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
    
    if(scaledt >= test*2) return;
    var index = Math.floor(scaledt);
   
    for (i = 0; i < l; i++) {
      this.points.morphTargetInfluences[validMorphs[i]] = 0;
      //this.points_top.morphTargetInfluences[validMorphs[i]] = 0;
    }

    var lastIndex = index - 1;
    var leftover = scaledt - index;
    if (lastIndex >= 0) {
      this.points.morphTargetInfluences[lastIndex] = 1 - leftover;
      //this.points_top.morphTargetInfluences[lastIndex] = 1 - leftover;
    }
    this.points.morphTargetInfluences[index] = leftover;
    //this.points_top.morphTargetInfluences[index] = leftover;
    
    ////////////////
    //update color//
    ////////////////

    var cl = this.points.geometry.faces.length;
    if(lastIndex >= 0){
      for (var c = 0; c < cl; c++){
          var ori_h = this.points.geometry.morphColors[lastIndex].colors[c].getHSL().h
          var color_distance = this.points.geometry.morphColors[index].colors[c].getHSL().h - ori_h;
          var color_delta = color_distance * leftover;
         
          //night         
          if(index%2 == 1) {
            //this.points.geometry.faces[c].color.setHSL(ori_h+color_delta * leftover,1.0,0.5 + color_delta*5);
            this.points.geometry.faces[c].color.setHSL(ori_h+color_delta * leftover,1.0, 0.5 - leftover * 0.4);
            
            //this.points_top.geometry.faces[c].color.setHSL(ori_h+color_delta,1.0,0.5 - leftover * 0.4);
          } 

          //day
          else {
            this.points.geometry.faces[c].color.setHSL(ori_h+color_delta * leftover,1.0, 0.1 + leftover * 0.4);
            
            //this.points_top.geometry.faces[c].color.setHSL(ori_h+color_delta,1.0, 0.1 + leftover * 0.4);

          }  

      } 
    }
    this.points.geometry.colorsNeedUpdate = true;

    /////////////////
    //update slider//
    /////////////////
    /*
    d3.select("#dot")
      .transition()      
      .attr("cx",x_scale(d_scale(start_day + t*l/2)))
      .ease("linear")
      .duration(0); 

    d3.select("#date")
      .transition()     
      .attr("transform", "translate(" + x_scale(d_scale(start_day + t*l/2 + 0.5)) + ", 20)")
      .ease("linear")
      .duration(0);

    $("#date").text(format_date(new Date(d_scale(start_day + t*l/2 +0.5))));
      */ 
    this._time = t;

  });

  this.addData = addData;
  this.addParticle = addParticle;
  this.createPoints = createPoints;
  this.renderer = renderer;
  this.scene = scene;
  //this.colorFn = colorFn;

  return this;

};



