
function camera_move(target_final, distance_final, delta_d, time_step){
	
	//calculate target steps:
	var time_step = time_step
	var steps = Math.abs((distance_final - distanceTarget) / delta_d);
	var delta_t = {x: (target_final.x - target.x) / steps, y: (target_final.y - target.y) / steps};

	//distance target
	function camera_increment(delta_t, delta_d, distance_final) {

		if (delta_d < 0) { // zoom in
			if (distanceTarget <= distance_final ) {
				return;
			} else {		
				camera_step_in(delta_t, delta_d);
				//saveFrame();
			}
		} else {
			if (distanceTarget >= distance_final ) { // zoom out
				return;
			} else {
				camera_step_in(delta_t, delta_d);
				//saveFrame();				
			}
		}		
	}

	function camera_step_in(delta_t, delta_d){
			distanceTarget += delta_d;
			target.x += delta_t.x;
			target.y += delta_t.y;
			setTimeout(camera_increment, time_step, delta_t, delta_d, distance_final);		
	}

	camera_increment(delta_t, delta_d, distance_final);
	//rotate
}


