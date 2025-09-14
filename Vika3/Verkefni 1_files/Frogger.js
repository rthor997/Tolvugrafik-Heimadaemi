///////////////////////////////////////////////////////////////////
//    Tölvugrafík Verkefni 1 
//     Frogger 
//
//    Rúnar Þór Árnason September 2025
///////////////////////////////////////////////////////////////////
var gl;
var points;
var vPosition;
var uColor;
var bufferId;
var frogVertices;
var frogX = 0.0;
var frogY = -0.95;
var frogSize = 0.05;
var frogFacingUp = true;
var topGrass = 0.22;
var bottomGrass = 0.22;

var cars = [
    { x: -1.2, y: -0.75, w: 0.3, h: 0.15, speed: 0.02, color: [0.8, 0.0, 0.0, 1.0] },
    { x: 1.2, y: -0.4,  w: 0.3, h: 0.15, speed: -0.017, color: [0.2, 0.8, 0.2, 1.0] },
    { x: 1.2, y: -0.09, w: 0.2, h: 0.2,  speed: 0.02, color: [0.1, 0.4, 0.1, 1.0] },
    { x: 0.3, y: -0.09, w: 0.2, h: 0.2,  speed: 0.02, color: [0.5, 0.5, 0.1, 1.0] },
    { x: 0.3, y: 0.26,  w: 0.2, h: 0.2,  speed: 0.04, color: [0.3, 0.7, 0.1, 1.0] },
    { x: 0.3, y: 0.62,  w: 0.2, h: 0.2,  speed: -0.02, color: [0.7, 0.1, 0.4, 1.0] },
    { x: 1.2, y: 0.62,  w: 0.2, h: 0.2,  speed: -0.02, color: [0.1, 0.1, 0.8, 1.0] }
];


window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    

    // Associate shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );

    uColor = gl.getUniformLocation(program, "uColor");

    render();
};

function rect(x, y, w, h) {
    return new Float32Array([
        x, y,
        x+w, y,
        x, y+h,
        x, y+h,
        x+w, y,
        x+w, y+h
    ]);
}

function drawRect(x, y, w, h, color) {
    var vertices = rect(x, y, w, h);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(uColor, color);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function updateFrogVertices(facingUp = true) {
    if (facingUp) {
        frogVertices = new Float32Array([
            frogX - frogSize, frogY,
            frogX + frogSize, frogY,
            frogX, frogY + 2*frogSize
        ]);
    } else { // snúið niður
        frogVertices = new Float32Array([
            frogX - frogSize, frogY + 2*frogSize,
            frogX + frogSize, frogY + 2*frogSize,
            frogX, frogY
        ]);
    }
}


window.addEventListener("keydown", function(event){
    var step = 0.18;

    switch(event.key) {
        case "ArrowUp":
            frogY += step;
            break;
        case "ArrowDown":
            frogY -= step;
            break;
        case "ArrowRight":
            frogX += step;
            break;
        case "ArrowLeft":
            frogX -= step;
            break;     
    }
    frogX = Math.max(-1 + frogSize, Math.min(1 - frogSize, frogX));
    frogY = Math.max(-1 + frogSize, Math.min(1 - 3*frogSize, frogY));

    updateFrogVertices(); // uppfæra þríhyrninginn
    
} ); 

function updateCarPosition(car) {
    car.x += car.speed;
    if (car.speed > 0 && car.x > 1.2) { // ef bílinn fer til hægri
        car.x = -1.2;
    } else if (car.speed < 0 && car.x < -1.2) { // ef bílinn fer til vinstri
        car.x = 1.2;
    }
}

function checkCollision(frog, car) {
    return frog.x < car.x + car.w &&
            frog.x + frog.w > car.x &&
            frog.y <car.y + car.h &&
            frog.y + frog.h > car.y
}



function drawCar(car) {
    drawRect(car.x, car.y, car.w, car.h, car.color);
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // --- Grass neðst og efst ---
    drawRect(-1.0, -1.0, 2.0, 0.22, [0.3, 0.6, 0.2, 1.0]); // neðst
    drawRect(-1.0, 0.78, 2.0, 0.42, [0.3, 0.6, 0.2, 1.0]); // efst

    // --- Brautir og hvítar línur ---
    let roadHeight = 0.32;
    let lineHeight = 0.02;

    // Braut 1
    drawRect(-1.0, -0.78, 2.0, roadHeight, [0.2,0.2,0.2,1]);
    drawRect(-1.0, -0.544, 2.0, lineHeight, [1,1,1,1]);

    // Braut 2
    drawRect(-1.0, -0.524, 2.0, roadHeight, [0.3,0.3,0.3,1]);
    drawRect(-1.0, -0.188, 2.0, lineHeight, [1,1,1,1]);

    // Braut 3
    drawRect(-1.0, -0.168, 2.0, roadHeight, [0.2,0.2,0.2,1]);
    drawRect(-1.0, 0.168, 2.0, lineHeight, [1,1,1,1]);

    // Braut 4
    drawRect(-1.0, 0.188, 2.0, roadHeight, [0.3,0.3,0.3,1]);
    drawRect(-1.0, 0.524, 2.0, lineHeight, [1,1,1,1]);

    // Braut 5
    drawRect(-1.0, 0.53, 2.0, roadHeight, [0.2,0.2,0.2,1]);



    // --- Bílar og collision ---

    var frogBox = {
        x: frogX - frogSize,
        y: frogY,
        w: 2 * frogSize,
        h: 2 * frogSize
    };

    for (let i = 0; i < cars.length; i++) {
        updateCarPosition(cars[i]);
        drawCar(cars[i]);
    
        if (checkCollision(frogBox, cars[i])) {
            console.log("Collision!");
            // t.d. reset frog
            frogX = 0.0;
            frogY = -0.95;
            frogFacingUp = true;
            break;
        }
    }

    if (frogY + 2*frogSize >= 1 - topGrass) {
        frogFacingUp = false; 
    } else if (frogY <= -1 + bottomGrass) {
        frogFacingUp = true; 
    }

    // --- Fríða (þríhyrningur) ---
    updateFrogVertices(frogFacingUp);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, frogVertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(uColor, [1.0, 0.2, 0.2, 1]); 
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimFrame(render);

}



