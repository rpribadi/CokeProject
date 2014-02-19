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
        zoom_to_top10(2000);
        //camera_move(target_1,distanceTarget_1,-3,25);
        event.preventDefault();
        break;
      case 83:
        //press S
        //zoom in to top ones
        //camera_move(target_2,distanceTarget_2,-5,25);
        event.preventDefault();
        break;
      case 68:
        //press D
        //zoom in to ground
        //camera_move(target_3,distanceTarget_3,5,25);
        event.preventDefault();
        break;
      case 68:
        //press q
        //stop
        cc.stop();
        event.preventDefault();
        break; 
      case 68:
        //press w
        //start
        cc.start();
        event.preventDefault();
        break;                   

    }
  }

