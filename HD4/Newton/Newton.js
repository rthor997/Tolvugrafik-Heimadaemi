/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Búum til bókstafinn H úr þremur teningum uppfært til að sýna vagga newtons
//
//    Hjálmtýr Hafsteinsson, september 2025
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices  = 36;

var points = [];
var colors = [];

var movement = false;     
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var state = "up1"
var rotation1 = 45;
var rotation2 = 0;
var speed = 1.0;

var matrixLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "transform" );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    //vertex color assigned by the index of the vertex
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
        
    }
}

function update_rotation() {
    switch (state) {
        case "up1":
            rotation1 += speed; 
            if (rotation1 >= 45) {
                state = "down1";
            }
            break;
        case "down1":
            rotation1 -= 1;
            if (rotation1 <= 0) {
                state = "up2"
            }
            break;
        case "up2":
            rotation2  += speed;
            if (rotation2 >= 45) {
                state ="down2"
            }
            break;
        case "down2":
            rotation2 -= speed;
            if (rotation2 <= 0) {
                state ="up1"
            }
            break;
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) ) ;

    update_rotation();
    
    // Vinstri Strengurinn 
    mv1 = mult(mv, translate(-0.125, 0.3, 0.0));   // Festipunktur
    mv1 = mult(mv1, rotateZ(-rotation1));           // Snúa um festipunkt með - til að fara rétta átt
    mv1 = mult(mv1, translate(0.0, -0.5, 0.0));    // Færa miðjuna niður
    mv1 = mult(mv1, scalem(0.01, 1.0, 0.01));      // Skala í streng
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv1));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    
  
    // Hægri Strengurinn
    mv3 = mult(mv, translate(0.125, 0.3, 0.0));
    mv3 = mult(mv3, rotateZ(rotation2));  // snýr öfugt til að sveiflast í hina áttina
    mv3 = mult(mv3, translate(0.0, -0.5, 0.0));
    mv3 = mult(mv3, scalem(0.01, 1.0, 0.01));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv3));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    // Vinstri box 
    mv2 = mult(mv, translate(-0.125, 0.3, 0.0));   // Festipunktur
    mv2 = mult(mv2, rotateZ(-rotation1));           // Snúa um festipunkt
    mv2 = mult(mv2, translate(0.0, -1.0, 0.0));    // Færa niður að botni strengsins
    mv2 = mult(mv2, scalem(0.25, 0.25, 0.25));     // Kassi
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv2));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    // Hægri box
    mv4 = mult(mv, translate(0.125, 0.3, 0.0));
    mv4 = mult(mv4, rotateZ(rotation2));
    mv4 = mult(mv4, translate(0.0, -1.0, 0.0));
    mv4 = mult(mv4, scalem(0.25, 0.25, 0.25));
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv4));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    requestAnimFrame( render );
}

