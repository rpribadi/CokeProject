//particle.js

function create_particle(){
	var t = globe.time;
	var current_day = Math.floor(t*test+1);
	var consumption_all = all_day[current_day];
	var consumption_top = [];
	
	top10.forEach(function(d){
		
		var machine_c = consumption_all[top10_dict[d]];
		//consumption_top.push(machine_c);
		globe.addParticle(machine_c);

	})
	
}

addParticle = function(data){
	var total = 200;
	var lat, lng, size, color, i, step, colorFnWrapper;
	colorFnWrapper = function(total) { return globe.colorFn(c_scale(total)); };
	var size = parseFloat(data.total)/5000;
	lat = parseFloat(data.lat);
	lng = parseFloat(data.lng);

	var color = colorFnWrapper(parseFloat(data.total));

	var geometry = new THREE.Geometry();

	for( i = 0; i < total; i++ ){
	  
	  var x, y, z;
	  var r = size * Math.random() + R;
	  var delta = 0.2 / (2 * Math.PI * r)*360;

	  var lat_t = lat + delta * (Math.random() - 0.5);
	  var lng_t = lng + delta * (Math.random() - 0.5);

	  var phi = (90 - lat_t) * Math.PI / 180;
	  var theta = (180 - lng_t) * Math.PI / 180;

	  x = r * Math.sin(phi) * Math.cos(theta);
	  y = r * Math.cos(phi);
	  z = r * Math.sin(phi) * Math.sin(theta);
	  //generate random location based on lat lng and size

	  var vertice_temp = new THREE.Vector3(x,y,z);
	  geometry.vertices[i] = vertice_temp;
	}

	var particles = new THREE.ParticleSystem( geometry, new THREE.ParticleSystemMaterial( { size: 0.3, color: color } ) );
	globe.scene.add(particles);
	//console.log(geometry);
}