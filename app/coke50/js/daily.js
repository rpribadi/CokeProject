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
var camera_target = null;
var ptc = {opacity:1};

var center = null;
var composer, effectFocus;
var rotation = null; 

var target = { x: 0, y: 0 };
var R = 200;
var zoom_out = false;
//var distanceTarget = 100000;

var imgDir = '/coke50/image/';

var bc_dict = {
    "coke": new THREE.Color().setHSL( 0.95, 1.0, 0.5 ),
    "dietcoke": new THREE.Color().setHSL( 0.75, 1.0, 0.5 ),
    "sprite": new THREE.Color().setHSL( 0.41, 1.0, 0.5 ),
    "drpepper": new THREE.Color().setHSL( 0.91, 1.0, 0.5 ),
    "fanta": new THREE.Color().setHSL( 0.083, 1.0, 0.5 )
  }

//set camera zoom in trajectory
var trajectory = [
  {dist : 385,
    targ: {x: 3.237756980030839, y: 0.5955732709320553}},

  {dist : 202,
    targ: {x: 3.2393961763606662, y: 0.5938913293721974}},

  {dist : 440,
    targ: {x: 4.191986204907064, y: 0.4085451142172577}},

  {dist : 380,
    //targ: {x: 3.4179666184175876, y: 0.622148411504521}},
    targ: {x: 3.947151443628726, y: 0.4518695587474739}},

  {dist : 340,
    targ: {x: 2.548388980384689, y: 0.6935987755982989}},

  {dist : 400,
    targ: {x:3.0023889803846893, y:0.7635987755982989}}

]

//location of the 4 machines
var m_center = [
  
  {lat:40.777715, lng:-73.954374, dist : 274, targ: {x: 3.4220969176815896, y: 0.7113109771166259}},//new york

  {lat:33.837247,lng:-84.368601, dist : 335,targ: {x: 3.239385918403759, y: 0.5907986745148809}},//georgia tech

  {lat:35.080653,lng:-106.619192, dist : 335, targ:  {x: 2.8518628047064984, y: 0.6127090407012672}},//albuque
  {lat: 33.780171, lng: -84.383646, dist : 385, targ: {x: 3.239385918403759, y: 0.5897886745148809}}//atlanta
]

stop_tween =  function(){
    var t = parseInt(globe.time * tween_length); // get current globe time;
    cam_tweens[t+1].stop();
}
//{x: 2.255880835756043, y: 0.5066305977916148}
//442
// Press keyboard "a" to start camera zoom in onto earth

lat_to_coor = function(lat, lng, r){

    var phi = (90 - lat) * Math.PI / 180;
    var theta = (180 - lng) * Math.PI / 180;

    var x = r * Math.sin(phi) * Math.cos(theta);
    var y = r * Math.cos(phi);
    var z = r * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3( x, y, z );
}
zoom_to_top10 = function(duration,m){
  var zoom_dict = ['ny', 'gt', 'al', 'at'];

  stop_tween();
  
  //c_dist.dist = 400;
  var n_center = lat_to_coor(m_center[m].lat,m_center[m].lng,150);
  var tween_0 = new TWEEN.Tween(camera_target).to({x: n_center.x,y: n_center.y, z : n_center.z},duration).start();
  //particle to 0.4
  var tween_p_0 = new TWEEN.Tween(this.particleSystem.material).to({opacity: 0.4},duration/2);
  //var p1 = duration/Math.abs(m_center[m].dist - distanceTarget) * 2

  if (zoom_out == true) {
    //particle to 1
    var tween_p_s = new TWEEN.Tween(this.particleSystem_select.material).to({opacity: 0},duration/2).start();
     var tween_p_1 = new TWEEN.Tween(this.particleSystem.material).to({opacity: 1},duration/2).start();
     tween_p_1.chain(tween_p_0);
     

  }  else {
     tween_p_0.start(); 
  }

  var tween_dist_0 = new TWEEN.Tween(globe).to({ distanceTarget : m_center[m].dist},duration).start();
  var tween_target_0 = new TWEEN.Tween(target).to({ x : m_center[m].targ.x, y : m_center[m].targ.y},duration).start();

  //move camera target to new center
  
  globe.create_particle(four_ids[zoom_dict[m]]);
  
  var tween_1 = new TWEEN.Tween(globe.points.material).to({opacity: 0.4},duration/2).easing(TWEEN.Easing.Cubic.EaseOut).start();
  var tween_2 = new TWEEN.Tween(globe.points.material).to({opacity: 0.1},duration).easing(TWEEN.Easing.Cubic.EaseOut);
  var tween_3 = new TWEEN.Tween(globe.points_top.material).to({opacity: 0},duration).easing(TWEEN.Easing.Cubic.EaseOut);
  
  tween_1.chain(tween_2);
  tween_2.chain(tween_3);



    //var p2 = duration/Math.abs(202 - distanceTarget) * 2
    //camera_move(m_center[m].targ,202,-2,p2);
  var tween_dist_1 = new TWEEN.Tween(globe).to({ distanceTarget : 202},duration);

  var tween_p_2 = new TWEEN.Tween(this.particleSystem.material).to({opacity: 0},duration);

  tween_dist_0.chain(tween_dist_1);
  tween_p_0.chain(tween_p_2);
  zoom_out = true;  


}

zoom_out_top10 = function(duration,m){
  //var n_center = lat_to_coor(m_center[m].lat,m_center[m].lng,150);
  var tween_0 = new TWEEN.Tween(camera_target).to({x: center.x,y: center.y, z : center.z},duration).start();
  var tween_p = new TWEEN.Tween(globe.particlematerial).to({opacity: 0.4},duration).start();

  var p1 = duration/Math.abs(m_center[m].dist - distanceTarget) * 2
  camera_move(m_center[m].targ,m_center[m].dist,2,p1);


}


zoom_to_water = function(duration){

  //stop_tween();
 
  var p1 = duration/Math.abs(trajectory[3].dist - distanceTarget) * 1
  camera_move(trajectory[3].targ,trajectory[3].dist,-1,p1);
  stop_tween();

  setTimeout(function(){

    var p2 = duration/Math.abs(trajectory[4].dist - distanceTarget) * 2
    camera_move(trajectory[4].targ,trajectory[4].dist,-2,p2);
  }, duration*4); 

  setTimeout(function(){

    var p3 = duration/Math.abs(trajectory[5].dist - distanceTarget) * 3
    camera_move(trajectory[5].targ,trajectory[5].dist,3,p3);
  }, duration*8); 
  //remove camera tween:

  
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
/*

c_dist.__defineSetter__('dist', function(d) {
  console.log(d);
  distanceTarget = d;
});*/   

DAT.Globe = function(container, colorFn) {

  this.distanceTarget = 500;
  c_close = 400; c_far = 480;

  center = lat_to_coor(33.34,-97.1927,150);
  camera_target = center;

  colorFn = function(x) {
    var c = new THREE.Color();
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
    point_top = new THREE.Mesh(geometry);

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
    var lat, lng, size, color, i, step, colorFnWrapper;

    c_scale = d3.scale.linear()
                    .domain([MIN, MAX])
                    .range([0.0, 0.2]);

                    //0.91 0.99 coke
                    //0.33,0.25

    opts.animated = opts.animated || false;
    this.is_animated = opts.animated;
    opts.format = opts.format || 'magnitude'; // other option is 'legend'

    colorFnWrapper = function(total) { return colorFn(c_scale(total)); };
    
    if (opts.animated) {
      if (this._baseGeometry === undefined) {
        this._baseGeometry = new THREE.Geometry();
        this._topGeometry = new THREE.Geometry();
        
        for (i = 0; i < data.length; i ++) {
          lat = parseFloat(data[i].lat);
          lng = parseFloat(data[i].lng);
          color = colorFnWrapper(parseFloat(data[i].total));
          size = 0;
          addPoint(lat, lng, size, color, this._baseGeometry,this._topGeometry);
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
    var topgeo = new THREE.Geometry();
    
    for (i = 0; i < data.length; i++) {
      lat = parseFloat(data[i].lat);
      lng = parseFloat(data[i].lng);

      if (opts.type == 'brand') {
        color = bc_dict[opts.name];
        size = parseFloat(data[i][opts.name]);
        size = size/4000;
      } else if (opts.type == 'top_brand') {
        color = bc_dict[data[i].topbrand];
        size = parseFloat(data[i].total);
        size = size/1000;
      } else {
        color = colorFnWrapper(parseFloat(data[i].total));
        size = parseFloat(data[i].total);
        
        if (opts.name=="day90" || opts.name=="day91") size = size/10000;//easter
        else  size = size/5000; 
           
      } 

      //onsole.log(lat + lng + color + size);

      
      addPoint(lat, lng, size, color, subgeo, topgeo);
      //addPoint(lat, lng, size, color, opts.name,subgeo);
    }
    //console.log(subgeo);
    
    if (opts.animated) {

      this._baseGeometry.morphTargets.push({'name': opts.name + "-day", vertices: subgeo.vertices});
      this._baseGeometry.morphTargets.push({'name': opts.name + "-night", vertices: this._baseGeometry.vertices});
      this._baseGeometry.morphColors.push({'name': opts.name, colors: subgeo.colors});
       this._baseGeometry.morphColors.push({'name': opts.name, colors: subgeo.colors});
      this._topGeometry.morphTargets.push({'name': opts.name + "-day", vertices: topgeo.vertices})
      this._topGeometry.morphTargets.push({'name': opts.name + "-night", vertices: this._topGeometry.vertices})
    } else {
      this._baseGeometry = subgeo;
      this._topGeometry = topgeo;
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
            this._topGeometry.morphTargets.push({'name': 'morphPadding'+i, vertices: this._topGeometry.vertices});
            this._topGeometry.morphColors.push({ 'name': 'morphPadding'+i, colors: this._topGeometry.colors})
          
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

        this.points_top = new THREE.Mesh(this._topGeometry, new THREE.MeshBasicMaterial({
          color: 0xffffff,
          attributes: {},
          vertexColors: THREE.FaceColors,
          transparent: true,
          opacity:1,
          morphTargets: true
        }));        
      }      
      scene.add(this.points);
      scene.add(this.points_top);
    }
  }



  function create_particle(opt){
    var t = globe.time;
    var current_day = Math.floor(t*tween_length/2+1/2);
    var consumption_all = all_day[current_day];
    var consumption_top = [];
    var total = 500;

    this.particles = []; 
    this.particlematerial = new THREE.ParticleSystemMaterial( { size: 0.2, transparent: true,vertexColors: true,opacity:ptc.opacity } )
    
    if (opt!=null){
       var ids = [opt];
       this.particlematerial_select = new THREE.ParticleSystemMaterial( { size: 0.2, transparent: true,vertexColors: true,opacity:ptc.opacity } )
    } else {
       var ids = top_ids.slice(0);
    }   
    /***
        Use buffergeometry
    ***/
    
    var num = total*ids.length;
    var buffer_geometry = new THREE.BufferGeometry();

    buffer_geometry.addAttribute( 'position', Float32Array, num, 3 );
    buffer_geometry.addAttribute( 'color', Float32Array, num, 3 );

    var positions = buffer_geometry.attributes.position.array;
    var colors = buffer_geometry.attributes.color.array;

   // top_ids.forEach(function(d){
    
    for (var i = 0; i<ids.length; i++){  
        
        var machine_c = consumption_all[top_dict[ids[i]]];
        //console.log(top_dict[ids[i]]);
        addParticle(machine_c,i,positions,colors,total);
        

    }
    //console.log(positions);
    //console.log(colors);
    buffer_geometry.computeBoundingSphere();
    if (opt!=null){
      particleSystem_select = new THREE.ParticleSystem( buffer_geometry, this.particlematerial_select );
      scene.add( particleSystem_select );
    } else {
      particleSystem = new THREE.ParticleSystem( buffer_geometry, this.particlematerial );
      scene.add( particleSystem );
    }  
    

    }

    /***********************/
    
    /*
    if (opt!=null){
      
        var machine_c = consumption_all[top_dict[opt]];
        addParticle(machine_c,groupGeo);
      

    } else {
      top_ids.forEach(function(d){
      
        var machine_c = consumption_all[top_dict[d]];
        addParticle(machine_c,groupGeo);

      })

    }*/



  addParticle = function(data,i,pos,col,total){
    var total = total;
    var lat, lng, size, color, step, colorFnWrapper;
    colorFnWrapper = function(total) { return colorFn(c_scale(total)); };
    var size = parseFloat(data.total)/5000;
    lat = parseFloat(data.lat);
    lng = parseFloat(data.lng);

    var color = colorFnWrapper(parseFloat(data.total));

    //var geometry_p = new THREE.Geometry();

    for( var j = 0; j < total; j++ ){
      
      var count = i * total + j * 3;
      var r = size * Math.random() + R;
      var delta = 0.2 / (2 * Math.PI * r)*360;

      var lat_t = lat + delta * (Math.random() - 0.5);
      var lng_t = lng + delta * (Math.random() - 0.5);


      //geometry_p.vertices[i] = lat_to_coor(lat_t,lng_t,r);
      var vt = lat_to_coor(lat_t,lng_t,r);
      pos[count] = vt.x;
      pos[count+1] = vt.y;
      pos[count+2] = vt.z;

      col[count] = color.r;
      col[count + 1] = color.g;
      col[count + 2] = color.b;
      
      //geometry_p.colors[i] = color;
    }

    //var particles_p = new THREE.ParticleSystem( geometry_p,  globe.particlematerial);
    //scene.add(particles_p);
    //globe.particles.push(particles_p);

  }
  
  PointPosition=function(lat, lng,size,r,opt) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (180 - lng) * Math.PI / 180;

    point.position.x = r * Math.sin(phi) * Math.cos(theta);
    point.position.y = r * Math.cos(phi);
    point.position.z = r * Math.sin(phi) * Math.sin(theta);

    if (opt.top == true) {
      point_top.position.x = (r + size + 1.5) * Math.sin(phi) * Math.cos(theta);
      point_top.position.y = (r + size + 1.5) * Math.cos(phi);
      point_top.position.z = (r + size + 1.5) * Math.sin(phi) * Math.sin(theta);
    }  
  }


  function addPoint(lat, lng, size, color, subgeo, topgeo) {

    PointPosition(lat,lng,size,R,{top:true});

    point.lookAt(mesh.position);
    point_top.lookAt(mesh.position);

    point.scale.x = 0.2;
    point.scale.y = 0.2;

    point.scale.z = Math.max( size, 0.1 ); // avoid non-invertible matrix
    point.updateMatrix();

    point_top.scale.x = 0.3;
    point_top.scale.y = 0.3;
    point_top.scale.z = 0.3;
    point_top.updateMatrix();
    

    for (var i = 0; i < point.geometry.faces.length; i++) {
      point.geometry.faces[i].color = color;
      point_top.geometry.faces[i].color = color;
      subgeo.colors.push(color);
    }
      
    THREE.GeometryUtils.merge(subgeo, point);

    THREE.GeometryUtils.merge(topgeo, point_top);

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
    globe.distanceTarget -= delta;
    globe.distanceTarget = globe.distanceTarget > 1000 ? 1000 : globe.distanceTarget;
    globe.distanceTarget = globe.distanceTarget < 202 ? 202 : globe.distanceTarget;
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    zoom(curZoomSpeed);

    rotation.x += (target.x - rotation.x) * 0.1;
    rotation.y += (target.y - rotation.y) * 0.1;
    distance += (globe.distanceTarget - distance) * 0.3;

    camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
    camera.position.y = distance * Math.sin(rotation.y);
    camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

    camera.lookAt(camera_target);
    renderer.clear();
    renderer.render(scene, camera);
  }

  init();

$.when( $.getJSON("coke50/data/states.geojson.json") ).then(function(data){
        add_states(data);
    });


    add_states = function(data) {
        console.log(data);

        this.geo = new geoConfig();*/
        var states = [];
        var i, j;

        this.line_material = new THREE.LineBasicMaterial({
              color: 0xfadd3f,
              transparent: true
        });

        // convert to threejs meshes
        for (i = 0 ; i < data.features.length ; i++) {//for each state
            var state =  data.features[i].properties.NAME;
            var geoFeature = data.features[i].geometry.coordinates;//coordinates are array of lines
             for (j = 0 ; j < geoFeature.length ; j++) {// for each line

              if(geoFeature[j].length == 1) {
                geoFeature[j].forEach(function(d){
                  var geometry = new THREE.Geometry();
                  d.forEach(function(p){
                    var ver_temp = lat_to_coor (p[1], p[0], 200);
                    geometry.vertices.push(ver_temp);

                  });
                  var line = new THREE.Line( geometry, line_material );
                scene.add( line );

                });
              } else {

                var geometry = new THREE.Geometry();
                //for each points
                geoFeature[j].forEach(function(d){
                  var ver_temp = lat_to_coor (d[1], d[0], 200);

                  geometry.vertices.push(ver_temp);

                });

                var line = new THREE.Line( geometry, line_material );
                scene.add( line );
              }  



        }
        console.log(state+" added!")
    }
    }


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
    
    
    if(scaledt >= tween_length) return;
    var index = Math.floor(scaledt);
   
    for (i = 0; i < l; i++) {
      this.points.morphTargetInfluences[validMorphs[i]] = 0;
      this.points_top.morphTargetInfluences[validMorphs[i]] = 0;
    }

    var lastIndex = index - 1;
    var leftover = scaledt - index;
    if (lastIndex >= 0) {
      this.points.morphTargetInfluences[lastIndex] = 1 - leftover;
      this.points_top.morphTargetInfluences[lastIndex] = 1 - leftover;
    }
    this.points.morphTargetInfluences[index] = leftover;
    this.points_top.morphTargetInfluences[index] = leftover;
    
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
            this.points.geometry.faces[c].color.setHSL(ori_h+color_delta * leftover,1.0, 0.5 - leftover * 0.3);
            
            this.points_top.geometry.faces[c].color.setHSL(ori_h+color_delta,1.0,0.5 - leftover * 0.3);
          } 

          //day
          else {
            this.points.geometry.faces[c].color.setHSL(ori_h+color_delta * leftover,1.0, 0.2 + leftover * 0.3);
            
            this.points_top.geometry.faces[c].color.setHSL(ori_h+color_delta,1.0, 0.2 + leftover * 0.3);

          }  

      } 
    }
    this.points.geometry.colorsNeedUpdate = true;
    this.points_top.geometry.colorsNeedUpdate = true;

    /////////////////
    //update slider//
    /////////////////
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
       
    this._time = t;

  });

  this.addData = addData;
  this.create_particle = create_particle;
  this.createPoints = createPoints;

  this.renderer = renderer;
  this.scene = scene;
  this.colorFn = colorFn;

  return this;

};



