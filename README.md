asdfThe Coke Project
================

Installation
------------
To run app:

1. Open terminal
2. Go to project's root folder
3. Type <code>node server.js</code> in the terminal
4. Open web browser and type <code>http://localhost:5555/</code> or <code>http://localhost:5555/daily.html</code>

Export Canvas Animation to Images
---------------------------------
To export canvas animation to images, simply add url param <code>record=true</code>, for example:
- Go to <code>http://localhost:5555/daily.html?record=true</code> url

Convert Exported Images to Video
--------------------------------
To convert images to video:

1. Open terminal
2. Go to <code>screenshots</code> folder
3. Type <code>./ffmpeg -r 10 -pattern_type glob -i '*.png' -c:v libx264 -pix_fmt yuv420p out.mp4</code>


Working Progress
----------------
Last update:
Daily.html
 - Showing daily consumption animation 

For animation, work with daily.html and daily.js

in daily.html, wait till animation is over and press "a" to start camera zoom in. (if press "a" before animation stops, the default camera animation will override the zoom in)
