//Mouse events



function onDocumentKeyDown(event) {
    switch (event.keyCode) {
      case 38:
        zoom(2);
        event.preventDefault();
        break;
      case 40:
        zoom(-2);
        event.preventDefault();
        break;
      case 65:
        //press A
        //zoom in to us
        zoom_to_top10(frame_speed_zoom,1);
        //camera_move(target_1,distanceTarget_1,-3,25);
        event.preventDefault();
        break;
      case 83:
        //press S
        //zoom in to top ones
        globe.create_particle(null);
        event.preventDefault();
        break;
      case 68:
        //press D
        //zoom in to ground
        zoom_to_water(frame_speed_zoom);
        event.preventDefault();
        break;
      case 78:
        //press n
        //zoom to ny
        zoom_to_top10(frame_speed_zoom,0);
        event.preventDefault();
        break;
      case 76:
        //press l
        //zoom to albuqukey
        zoom_to_top10(frame_speed_zoom,2);
        event.preventDefault();
        break;
      case 84:
        //press t
        //zoom to atlanta
        zoom_to_top10(frame_speed_zoom,3);
        event.preventDefault();
        break;                                
      case 71:
        //press g
        //zoom to georgiatech
        zoom_to_top10(frame_speed_zoom,1);
        event.preventDefault();
        break; 
    }
  }

