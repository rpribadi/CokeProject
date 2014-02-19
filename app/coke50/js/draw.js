//draw.js



var frameN = 0
function saveFrame () {
  var format = d3.format('010');
  var canvas = document.querySelector('#canvas');
  var context = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});


  var a = document.createElement("a");
    a.download = format(frameN) + ".png";
    a.href = canvas.toDataURL("image/png");
    a.click()
  delete a
  frameN += 1
}