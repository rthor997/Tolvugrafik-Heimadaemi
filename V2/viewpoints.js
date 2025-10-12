////////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//    Byggt á sýnisforriti í C fyrir OpenGL, höfundur óþekktur.
//
//    Bíll sem keyrir í hringi í umhverfi með húsum.  Hægt að
//    breyta sjónarhorni áhorfanda með því að slá á 0,1, 2, ..., 9.
//    Einnig hægt að breyta hæð áhorfanda með upp/niður örvum.
//    Leiðrétt útgáfa fyrir réttan snúning í MV.js
//
//    Rúnar Þór Árnason, Oktober 2025
////////////////////////////////////////////////////////////////////
var canvas;
var gl;

// position of the track
var TRACK_RADIUS = 100.0;
var TRACK_INNER = 90.0;
var TRACK_OUTER = 110.0;
var TRACK_PTS = 100;

var BLUE = vec4(0.0, 0.0, 1.0, 1.0);
var RED = vec4(1.0, 0.0, 0.0, 1.0);
var GRAY = vec4(0.4, 0.4, 0.4, 1.0);
var DARKGRAY = vec4(0.2, 0.2, 0.2, 1.0);
var YELLOW = vec4(1.0, 1.0, 0.0, 1.0);
var DARKBLUE  = vec4(0.0, 0.3, 0.5, 1.0);
var CYAN = vec4(0.0, 1.0, 1.0, 1.0);
var GREEN = vec4(0.0, 0.7, 0.4, 1.0);
var BROWN = vec4(0.8, 0.4, 0.2, 1.0);

var numCubeVertices  = 36;
var numTrackVertices  = 2*TRACK_PTS + 2;

// viewpoint 0
var playerPos = vec2(0.0, 0.0);
var playerDir = vec2(1.0, 0.0);
var playerAngle = 0.0;

// variables for moving car
var carDirection = 0.0;
var carXPos = 100.0;
var carYPos = 0.0;
var height = 0.0;

var carDirection2 = 0.0;
var carXPos2 = 100.0;
var carYPos2 = 0.0;

// variables for plane
var planeAngle = 0.0;
var planeSpeed = 0.02;   
var planeA = 100.0;      // stærð áttaferils
var planeHeight = 40.0;  
var planeX = 0.0;
var planeY = 0.0;
var planeZ = planeHeight;
var planeDir = 0.0;


// current viewpoint
var view = 1;

var colorLoc;
var mvLoc;
var pLoc;
var proj;

var cubeBuffer;
var trackBuffer;
var vPosition;

// the 36 vertices of the cube
var cVertices = [
    // front side:
    vec3( -0.5,  0.5,  0.5 ), vec3( -0.5, -0.5,  0.5 ), vec3(  0.5, -0.5,  0.5 ),
    vec3(  0.5, -0.5,  0.5 ), vec3(  0.5,  0.5,  0.5 ), vec3( -0.5,  0.5,  0.5 ),
    // right side:
    vec3(  0.5,  0.5,  0.5 ), vec3(  0.5, -0.5,  0.5 ), vec3(  0.5, -0.5, -0.5 ),
    vec3(  0.5, -0.5, -0.5 ), vec3(  0.5,  0.5, -0.5 ), vec3(  0.5,  0.5,  0.5 ),
    // bottom side:
    vec3(  0.5, -0.5,  0.5 ), vec3( -0.5, -0.5,  0.5 ), vec3( -0.5, -0.5, -0.5 ),
    vec3( -0.5, -0.5, -0.5 ), vec3(  0.5, -0.5, -0.5 ), vec3(  0.5, -0.5,  0.5 ),
    // top side:
    vec3(  0.5,  0.5, -0.5 ), vec3( -0.5,  0.5, -0.5 ), vec3( -0.5,  0.5,  0.5 ),
    vec3( -0.5,  0.5,  0.5 ), vec3(  0.5,  0.5,  0.5 ), vec3(  0.5,  0.5, -0.5 ),
    // back side:
    vec3( -0.5, -0.5, -0.5 ), vec3( -0.5,  0.5, -0.5 ), vec3(  0.5,  0.5, -0.5 ),
    vec3(  0.5,  0.5, -0.5 ), vec3(  0.5, -0.5, -0.5 ), vec3( -0.5, -0.5, -0.5 ),
    // left side:
    vec3( -0.5,  0.5, -0.5 ), vec3( -0.5, -0.5, -0.5 ), vec3( -0.5, -0.5,  0.5 ),
    vec3( -0.5, -0.5,  0.5 ), vec3( -0.5,  0.5,  0.5 ), vec3( -0.5,  0.5, -0.5 )
];

var h_tak = 0.45;  // hæð þaks
var triVertices = [
    // Vinstri þakflötur (tvö þríhyrningalög)
    vec3(-0.5, -0.5, 0.0), vec3(0.0, -0.5, h_tak), vec3(-0.5, 0.5, 0.0),
    vec3(-0.5, 0.5, 0.0), vec3(0.0, -0.5, h_tak), vec3(0.0, 0.5, h_tak),

    // Hægri þakflötur (tvö þríhyrningalög)
    vec3(0.5, -0.5, 0.0), vec3(0.5, 0.5, 0.0), vec3(0.0, -0.5, h_tak),
    vec3(0.5, 0.5, 0.0), vec3(0.0, 0.5, h_tak), vec3(0.0, -0.5, h_tak),

    // Framgafl
    vec3(-0.5, -0.5, 0.0), vec3(0.5, -0.5, 0.0), vec3(0.0, -0.5, h_tak),

    // Afturgafl
    vec3(-0.5, 0.5, 0.0), vec3(0.5, 0.5, 0.0), vec3(0.0, 0.5, h_tak)
];

var numTriangleVertices = triVertices.length; // 18
var triangleBuffer;



var rampVertices = [
    // Botn (fjórhyrningur)
    vec3(-0.5, 0.0, 0.0),
    vec3( 0.5, 0.0, 0.0),
    vec3( 0.5, 1.0, 0.0),
    vec3(-0.5, 1.0, 0.0),

    // Topp (þríhyrningur)
    vec3(-0.5, 0.0, 0.0),
    vec3( 0.5, 0.0, 0.0),
    vec3( 0.0, 1.0, 1.0)
];
var numRampVertices = rampVertices.length;
var rampBuffer;



// vertices of the track
var tVertices = [];


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.7, 1.0, 0.7, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    createTrack();
    
    // VBO for the track
    trackBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, trackBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(tVertices), gl.STATIC_DRAW );

    // VBO for the cube
    cubeBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cVertices), gl.STATIC_DRAW );

    // VBO fyrir þríhyrning
    triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triVertices), gl.STATIC_DRAW);

    //VBO fyrir þríhyring á brú
    rampBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rampBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(rampVertices), gl.STATIC_DRAW);
    

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );
    
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // set projection
    pLoc = gl.getUniformLocation( program, "projection" );
    proj = perspective( 50.0, 1.0, 1.0, 500.0 );
    gl.uniformMatrix4fv(pLoc, false, flatten(proj));

    document.getElementById("Viewpoint").innerHTML = "1: Fjarlægt sjónarhorn";
    document.getElementById("Height").innerHTML = "Viðbótarhæð: "+ height;

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 48:	// 0: notandi gangandi
                view = 0;
                document.getElementById("Viewpoint").innerHTML = "0: Notandi gangandi";
                break;

            case 49:	// 1: distant and stationary viewpoint
                view = 1;
                document.getElementById("Viewpoint").innerHTML = "1: Fjarlægt sjónarhorn";
                break;
            case 50:	// 2: panning camera inside the track
                view = 2;
                document.getElementById("Viewpoint").innerHTML = "2: Horfa á bílinn innan úr hringnum";
                break;
            case 51:	// 3: panning camera inside the track
                view = 3;
                document.getElementById("Viewpoint").innerHTML = "3: Horfa á bílinn fyrir utan hringinn";
                break;
            case 52:	// 4: driver's point of view
                view = 4;
                document.getElementById("Viewpoint").innerHTML = "4: Sjónarhorn ökumanns";
                break;
            case 53:	// 5: drive around while looking at a house
                view = 5;
                document.getElementById("Viewpoint").innerHTML = "5: Horfa alltaf á eitt hús innan úr bílnum";
                break;
            case 54:	// 6: Above and behind the car
                view = 6;
                document.getElementById("Viewpoint").innerHTML = "6: Fyrir aftan og ofan bílinn";
                break;
            case 55:	// 7: from another car in front
                view = 7;
                document.getElementById("Viewpoint").innerHTML = "7: Horft aftur úr bíl fyrir framan";
                break;
            case 56:	// 8: from beside the car
                view = 8;
                document.getElementById("Viewpoint").innerHTML = "8: Til hliðar við bílinn";
                break;
            case 57:	// 9: looking at the plane
                view = 9;
                document.getElementById("Viewpoint").innerHTML = "9: Við flugvélina";
                break;
            
            case 38:    // up arrow
                height += 2.0;
                document.getElementById("Height").innerHTML = "Viðbótarhæð: "+ height;
                break;
            case 40:    // down arrow
                height -= 2.0;
                document.getElementById("Height").innerHTML = "Viðbótarhæð: "+ height;
                break;
        }
    } );

    window.addEventListener("keydown", function(e) {
        var step = 5.0;
        var stefna = vec2(-playerDir[1], playerDir[0]);

        switch( e.key ) {
            case "W":
            case "w":
                playerPos[0] += playerDir[0] * step;
                playerPos[1] += playerDir[1] * step;
                break;
            case "S":
            case "s":
                playerPos[0] -= playerDir[0] * step;
                playerPos[1] -= playerDir[1] * step;
                break;
            case "A":
            case "a":
                playerPos[0] += stefna[0] * step;
                playerPos[1] += stefna[1] * step;
                break;
            case "D":
            case "d":
                playerPos[0] -= stefna[0] * step;
                playerPos[1] -= stefna[1] * step;
                break;     
        }
    });

    canvas.addEventListener("mousemove", function(e) {
        var speed = 0.01
        playerAngle -= e.movementX* speed;
        playerDir = vec2(Math.cos(playerAngle), Math.sin(playerAngle));
       
    });

    render();
}


// create the vertices that form the car track
function createTrack() {

    var theta = 0.0;
    for( var i=0; i<=TRACK_PTS; i++ ) {
        var p1 = vec3(TRACK_OUTER*Math.cos(radians(theta)), TRACK_OUTER*Math.sin(radians(theta)), 0.0);
        var p2 = vec3(TRACK_INNER*Math.cos(radians(theta)), TRACK_INNER*Math.sin(radians(theta)), 0.0) 
        tVertices.push( p1 );
        tVertices.push( p2 );
        theta += 360.0/TRACK_PTS;
    }
}

function bridge(x, y, size, mv) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    gl.uniform4fv(colorLoc, BROWN);
    
    var mvLeft = mult(mv, translate(x - size, y, size / 2));
    mvLeft = mult(mvLeft, scalem(size * 0.3, size * 2, size));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvLeft));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
    
    var mvRight = mult(mv, translate(x + size, y, size / 2));
    mvRight = mult(mvRight, scalem(size * 0.3, size * 2, size));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvRight));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

    // ---- Brúargólf ----
    gl.uniform4fv(colorLoc, GRAY);

    var mvTop = mult(mv, translate(x, y, size * 1.1));
    mvTop = mult(mvTop, scalem(size * 3, size * 2, size * 0.2));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvTop));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

    // ---- Handrið ----
    gl.uniform4fv(colorLoc, DARKGRAY);

    var mvRail1 = mult(mv, translate(x, y - size * 0.8, size * 1.3));
    mvRail1 = mult(mvRail1, scalem(size * 3, size * 0.1, size * 0.2));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvRail1));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

    var mvRail2 = mult(mv, translate(x, y + size * 0.8, size * 1.3));
    mvRail2 = mult(mvRail2, scalem(size * 3, size * 0.1, size * 0.2));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvRail2));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

    // ---- Rampar ----
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colorLoc, GRAY);
    
    var bridgeHeight = size * 1.1;
    var rampLength = size * 2.0;
    var rampWidth  = size * 2.0;
    var rampHeight = size * 0.5;
    
    // Rampur til vinstri (á -X)
    var rampLeft = mult(mv, translate(x - size * 2.0, y, bridgeHeight - rampHeight));
    rampLeft = mult(rampLeft, rotateY(-25));   // halli niður til vinstri
    rampLeft = mult(rampLeft, scalem(rampLength, rampWidth, rampHeight));
    gl.uniformMatrix4fv(mvLoc, false, flatten(rampLeft));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

    // Rampur til hægri (á +X)
    var rampRight = mult(mv, translate(x + size * 2.0, y, bridgeHeight - rampHeight));
    rampRight = mult(rampRight, rotateY(25));   // halli niður til hægri
    rampRight = mult(rampRight, scalem(rampLength, rampWidth, rampHeight));
    gl.uniformMatrix4fv(mvLoc, false, flatten(rampRight));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}



// draw a house in location (x, y) of size size
function house(x, y, size, mv) {
    // ----- veggir -----
    gl.uniform4fv(colorLoc, YELLOW);

    var mvHouse = mult(mv, translate(x, y, size/2.0));
    mvHouse = mult(mvHouse, scalem(size, size, size));

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvHouse));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

    // ----- þak -----
    gl.uniform4fv(colorLoc, RED);

    var mvRoof = mult(mvHouse, translate(0.0, 0.0, 0.5));

    mvRoof = mult(mvRoof, scalem(1.05, 1.05, 1.0));

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvRoof));
    gl.drawArrays(gl.TRIANGLES, 0, numTriangleVertices);
}


// blokk 
function tallhouse( x, y, size, mv ) {
    gl.uniform4fv(colorLoc, DARKBLUE );

    var mvHouse = mult(mv, translate(x, y, 0.0));

    mvHouse = mult(mvHouse, translate(0.0, 0.0, 0.5*size*5));
    mvHouse = mult(mvHouse, scalem(size*1.2, size*1.2, size*5));

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvHouse));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}


// lítin kofa
function smallhouse( x, y, size, mv ) {

    gl.uniform4fv( colorLoc, CYAN );
    
    mv = mult( mv, translate( x, y, size/2 ) );
    mv = mult( mv, scalem( size, size, size*0.8 ) );

    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );

    gl.uniform4fv(colorLoc, RED);

    var mvRoof = mult(mv, translate(0.0, 0.0, 0.5));

    mvRoof = mult(mvRoof, scalem(1.05, 1.05, 1.0));

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvRoof));
    gl.drawArrays(gl.TRIANGLES, 0, numTriangleVertices);
}

function tree(x, y, size, mv) {
    // ----- Stafn (trunk) -----
    gl.uniform4fv(colorLoc, BROWN);

    var mvTrunk = mult(mv, translate(x, y, size*0.5));
    mvTrunk = mult(mvTrunk, scalem(size*0.3, size*0.3, size));

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvTrunk));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

    // ----- Króna (crown) -----
    gl.uniform4fv(colorLoc, GREEN);

    var mvCrown = mult(mv, translate(x, y, size*1.5)); 
    mvCrown = mult(mvCrown, scalem(size, size, size));

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvCrown));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}
    

// draw the circular track and a few houses (i.e. red cubes)
function drawScenery( mv ) {

    // draw track
    gl.uniform4fv( colorLoc, GRAY );
    gl.bindBuffer( gl.ARRAY_BUFFER, trackBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, numTrackVertices );
    


    // draw houses    
    house(-20.0, 50.0, 5.0, mv);
    house(0.0, 70.0, 10.0, mv);
    house(20.0, -10.0, 8.0, mv);
    house(40.0, 120.0, 10.0, mv);
    house(-30.0, -50.0, 7.0, mv);
    house(10.0, -60.0, 10.0, mv);
    house(-20.0, 75.0, 8.0, mv);
    house(-40.0, 140.0, 10.0, mv);
    house(140.0, 70.0, 10.0, mv);
    house(135.0, 40.0, 8.0, mv);
    smallhouse(-120.0, -60.0, 4.5, mv)
    smallhouse(-130.0, -80.0, 5.0, mv)
    smallhouse(-140.0, -50.0, 5.0, mv)
    smallhouse(130.0, -60.0, 4.0, mv)
    smallhouse(140.0, -40.0, 5.0, mv)
    tallhouse(110.0, 60.0, 6.0, mv)
    tallhouse(-110.0, 80.0, 9.0, mv)
    tallhouse(-150.0, 30.0, 11.0, mv)
    tallhouse(-130.0, 130.0, 10.0, mv)
    tree(-130.0, -40.0, 5.0, mv);
    tree(-160.0, -70.0, 5.0, mv);
    tree(-100.0, -80.0, 5.0, mv);
    tree(100.0, -80.0, 5.0, mv);
    tree(120.0, -50.0, 5.0, mv);
    tree(120.0, 45.0, 5.0, mv);
    tree(120.0, 70.0, 5.0, mv);
    tree(-125.0, 70.0, 5.0, mv);
    tree(-125.0, 50.0, 5.0, mv);
    bridge(-100.0, 0.0, 10.0, mv);
}


// draw car as two blue cubes
function drawCar( mv ) {

    // set color to blue
    gl.uniform4fv( colorLoc, BLUE );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );

    var mv1 = mv;
    // lower body of the car
    mv = mult( mv, scalem( 10.0, 3.0, 2.0 ) );
    mv = mult( mv, translate( 0.0, 0.0, 0.5 ) );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );

    // upper part of the car
    mv1 = mult( mv1, scalem( 4.0, 3.0, 2.0 ) );
    mv1 = mult( mv1, translate( -0.2, 0.0, 1.5 ) );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, numCubeVertices );
}

function drawPlane(x, y, z, dir, mv) {
    // ----- Litur -----
    gl.uniform4fv( colorLoc, RED );

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    // Snúa og færa flugvélina á réttan stað
    var mvPlane = mult(mv, translate(x, y, z));
    mvPlane = mult(mvPlane, rotateZ(dir));
    mvPlane = mult(mvPlane, scalem(3.0, 8.0, 1.0)); // búkur
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvPlane));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

    // ----- Vængir -----
    gl.uniform4fv(colorLoc, vec4(0.6, 0.6, 0.6, 1.0));
    var mvWing = mult(mv, translate(x, y, z));
    mvWing = mult(mvWing, rotateZ(dir));
    mvWing = mult(mvWing, translate(0.0, 0.0, 0.5));
    mvWing = mult(mvWing, scalem(10.0, 1.0, 0.2));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvWing));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);

    // ----- Stél -----
    var mvTail = mult(mv, translate(x, y - 3.0, z + 1.0));
    mvTail = mult(mvTail, rotateZ(dir));
    mvTail = mult(mvTail, scalem(1.0, 2.0, 0.5));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvTail));
    gl.drawArrays(gl.TRIANGLES, 0, numCubeVertices);
}

    

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var laneOffset = 5.0;

    carDirection += 1.0;
    if ( carDirection > 360.0 ) carDirection = 0.0;
    carXPos = (TRACK_RADIUS - laneOffset ) * Math.sin( radians(carDirection) );
    carYPos = (TRACK_RADIUS - laneOffset) * Math.cos( radians(carDirection) );
    
    carDirection2 += 1.0;
    if ( carDirection2 > 360.0 ) carDirection2 = 0.0;
    carXPos2 = (TRACK_RADIUS + laneOffset) * Math.sin( radians(-carDirection2) );
    carYPos2 = (TRACK_RADIUS +laneOffset ) * Math.cos( radians(-carDirection2) );

    planeAngle += planeSpeed;
    if (planeAngle > 2 * Math.PI) planeAngle -= 2 * Math.PI;

    planeX = planeA * Math.sin(planeAngle);
    planeY = planeA * Math.sin(planeAngle) * Math.cos(planeAngle);
    planeZ = planeHeight;
    
    // reikna stefnu flugvélarinnar 
    var dx = (planeA * Math.cos(planeAngle)); // dx/dt (uppstreymi einföldun)
    var dy = planeA * (Math.cos(2 * planeAngle) - Math.sin(planeAngle)*Math.sin(planeAngle)); // nálgun
    planeDir = Math.atan2(dy, dx) * 180.0 / Math.PI;


    
    var mv = mat4();
    switch( view ) {
    case 0:
        mv = lookAt( vec3(playerPos[0], playerPos[1], 2.0), vec3(playerPos[0] + playerDir[0], playerPos[1] + playerDir[1], 2.0), vec3(0.0, 0.0, 1.0) );
        drawScenery( mv );

        var mvCar1 = mult( mv, translate(carXPos, carYPos, 0.0) );
	    mvCar1 = mult( mvCar1, rotateZ( -carDirection ) ) ;
	    drawCar( mvCar1 );

        var mvCar2 = mult( mv, translate(carXPos2, carYPos2, 0.0) );
        mvCar2 = mult( mvCar2, rotateZ(carDirection + 180.0));
        drawCar(mvCar2);

        drawPlane(planeX, planeY, planeZ, planeDir, mv);
        break;  
    case 1:
        // Distant and stationary viewpoint
        mv = lookAt( vec3(250.0, 0.0, 100.0+height), vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0) );
        drawScenery( mv );
        // Bíll 1
        var mvCar1 = mult(mv, translate(carXPos, carYPos, 0.0));
        mvCar1 = mult(mvCar1, rotateZ(-carDirection));
        drawCar(mvCar1);

        // Bíll 2 (gagnstæð hreyfing)
        var mvCar2 = mult(mv, translate(carXPos2, carYPos2, 0.0));
        mvCar2 = mult(mvCar2, rotateZ(carDirection2 + 180.0));
        drawCar(mvCar2);

        drawPlane(planeX, planeY, planeZ, planeDir, mv);
        break;

	case 2:
	    // Static viewpoint inside the track; camera follows car
	    mv = lookAt( vec3(75.0, 0.0, 5.0+height), vec3(carXPos, carYPos, 0.0), vec3(0.0, 0.0, 1.0 ) );
	    drawScenery( mv );

	    var mvCar1 = mult( mv, translate(carXPos, carYPos, 0.0) );
	    mvCar1 = mult( mvCar1, rotateZ( -carDirection ) ) ;
	    drawCar( mvCar1 );

        var mvCar2 = mult( mv, translate(carXPos2, carYPos2, 0.0) );
        mvCar2 = mult( mvCar2, rotateZ(carDirection + 180.0));
        drawCar(mvCar2);

        drawPlane(planeX, planeY, planeZ, planeDir, mv);
	    break;
	case 3:
	    // Static viewpoint outside the track; camera follows car
	    mv = lookAt( vec3(125.0, 0.0, 5.0+height), vec3(carXPos, carYPos, 0.0), vec3(0.0, 0.0, 1.0 ) );
	    drawScenery( mv );

	    var mvCar1 = mult( mv, translate(carXPos, carYPos, 0.0) );
	    mvCar1 = mult( mvCar1, rotateZ( -carDirection ) ) ;
	    drawCar( mvCar1 );

        var mvCar2 = mult( mv, translate(carXPos2, carYPos2, 0.0) );
        mvCar2 = mult( mvCar2, rotateZ(carDirection + 180.0));
        drawCar(mvCar2);

        drawPlane(planeX, planeY, planeZ, planeDir, mv);
	    break;
	case 4:
	    // Driver's point of view.
	    mv = lookAt( vec3(-3.0, 0.0, 5.0+height), vec3(12.0, 0.0, 2.0+height), vec3(0.0, 0.0, 1.0 ) );
	    drawCar( mv );
	    var mvCar1 = mult( mv, rotateZ( carDirection ) );
	    mvCar1 = mult( mvCar1, translate(-carXPos, -carYPos, 0.0) );
	    drawScenery( mvCar1 );

        var mvCar2 = mult( mvCar1, translate(carXPos2, carYPos2, 0.0) );
        mvCar2 = mult( mvCar2, rotateZ(carDirection + 180.0));
        drawCar(mvCar2);

        drawPlane(planeX, planeY, planeZ, planeDir, mv);
	    break;
	case 5:
	    // Drive around while looking at a house at (40, 120)
	    mv = rotateY( -carDirection );
	    mv = mult( mv, lookAt( vec3(3.0, 0.0, 5.0+height), vec3(40.0-carXPos, 120.0-carYPos, 0.0), vec3(0.0, 0.0, 1.0 ) ) );
	    drawCar( mv );

	    var mvCar1 = mult( mv, rotateZ( carDirection ) );
	    mvCar1 = mult( mvCar1, translate(-carXPos, -carYPos, 0.0) );
	    drawScenery( mvCar1 );

        var mvCar2 = mult( mvCar1, translate(carXPos2, carYPos2, 0.0) );
        mvCar2 = mult( mvCar2, rotateZ(carDirection + 180.0));
        drawCar(mvCar2);

        drawPlane(planeX, planeY, planeZ, planeDir, mv);
	    break;
	case 6:
	    // Behind and above the car
	    mv = lookAt( vec3(-12.0, 0.0, 6.0+height), vec3(15.0, 0.0, 4.0), vec3(0.0, 0.0, 1.0 ) );
	    drawCar( mv );

	    var mvCar1 = mult( mv, rotateZ( carDirection ) );
	    mvCar1 = mult( mvCar1, translate(-carXPos, -carYPos, 0.0) );
	    drawScenery( mvCar1 );

        var mvCar2 = mult( mvCar1, translate(carXPos2, carYPos2, 0.0) );
        mvCar2 = mult( mvCar2, rotateZ(carDirection + 180.0));
        drawCar(mvCar2);

        drawPlane(planeX, planeY, planeZ, planeDir, mv);
	    break;
	case 7:
	    // View backwards looking from another car
	    mv = lookAt( vec3(25.0, 5.0, 5.0+height), vec3(0.0, 0.0, 2.0), vec3(0.0, 0.0, 1.0 ) );
	    drawCar( mv );

	    var mvCar1 = mult( mv, rotateZ( carDirection ) );
	    mvCar1 = mult( mvCar1, translate(-carXPos, -carYPos, 0.0) );
	    drawScenery( mvCar1 );

        var mvCar2 = mult( mvCar1, translate(carXPos2, carYPos2, 0.0) );
        mvCar2 = mult( mvCar2, rotateZ(carDirection + 180.0));
        drawCar(mvCar2);

        drawPlane(planeX, planeY, planeZ, planeDir, mv);
	    break;
	case 8:
	    // View from beside the car
	    mv = lookAt( vec3(2.0, 20.0, 5.0+height), vec3(2.0, 0.0, 2.0), vec3(0.0, 0.0, 1.0 ) );
	    drawCar( mv );

	    var mvCar1 = mult( mv, rotateZ( carDirection ) );
	    mvCar1 = mult( mvCar1, translate(-carXPos, -carYPos, 0.0) );
	    drawScenery( mvCar1 );

        var mvCar2 = mult( mvCar1, translate(carXPos2, carYPos2, 0.0) );
        mvCar2 = mult( mvCar2, rotateZ(carDirection + 180.0));
        drawCar(mvCar2);

        drawPlane(planeX, planeY, planeZ, planeDir, mv);
	    break;

    case 9:
        mv = lookAt(vec3(planeX - 15 * Math.cos(radians(planeDir)),
                            planeY - 15 * Math.sin(radians(planeDir)),
                            planeZ + 5),
                    vec3(planeX, planeY, planeZ),
                    vec3(0.0, 0.0, 1.0));
        drawScenery(mv);
        drawPlane(planeX, planeY, planeZ, planeDir, mv);
        break;
    }
    
    requestAnimFrame( render );
}

