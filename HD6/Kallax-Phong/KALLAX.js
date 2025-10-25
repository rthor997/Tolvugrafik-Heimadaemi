/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//    Kallax hillueiningu
//
//    Rúnar Þór Árnason, 2025
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices = 36;

var pointsArray = [];
var normalsArray = [];

var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;
var zDist = 3.0;

var modelViewMatrixLoc;
var projectionMatrixLoc;
var normalMatrixLoc;

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) alert("WebGL ekki til staðar!");

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Lýsing + efni
    var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
    var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
    var lightPosition = vec4(2.0, 2.0, 2.0, 1.0);

    var materialAmbient = vec4(0.7, 0.7, 0.7, 1.0);
    var materialDiffuse = vec4(0.8, 0.6, 0.4, 1.0);
    var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
    var materialShininess = 50.0;

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(mult(lightAmbient, materialAmbient)));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(mult(lightDiffuse, materialDiffuse)));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(mult(lightSpecular, materialSpecular)));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    var projectionMatrix = perspective(45, 1.0, 0.1, 10.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Mouse interaction
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
    });
    canvas.addEventListener("mouseup", () => movement = false);
    canvas.addEventListener("mousemove", function(e){
        if(movement){
            spinY += (origX - e.offsetX);
            spinX += (origY - e.offsetY);
            origX = e.offsetX;
            origY = e.offsetY;
        }
    });

    render();
};

function quad(a,b,c,d,n){
    var vertices = [
        vec4(-0.5,-0.5, 0.5,1),
        vec4(-0.5, 0.5, 0.5,1),
        vec4( 0.5, 0.5, 0.5,1),
        vec4( 0.5,-0.5, 0.5,1),
        vec4(-0.5,-0.5,-0.5,1),
        vec4(-0.5, 0.5,-0.5,1),
        vec4( 0.5, 0.5,-0.5,1),
        vec4( 0.5,-0.5,-0.5,1)
    ];

    var normals = [
        vec3(0,0,1),
        vec3(1,0,0),
        vec3(0,-1,0),
        vec3(0,1,0),
        vec3(0,0,-1),
        vec3(-1,0,0)
    ];

    var idx = [a,b,c, a,c,d];
    for(let i of idx){
        pointsArray.push(vertices[i]);
        normalsArray.push(normals[n]);
    }
}

function colorCube(){
    quad(1,0,3,2,0);
    quad(2,3,7,6,1);
    quad(3,0,4,7,2);
    quad(6,5,1,2,3);
    quad(4,5,6,7,4);
    quad(5,4,0,1,5);
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt(
        vec3(0.0, 0.0, zDist),
        vec3(0.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0)
    );

    mv = mult(mv, rotateX(spinX));
    mv = mult(mv, rotateY(spinY));

    var mv1, normalMatrix;

    mv1 = mult(mv, translate(-0.75,0,0));
    mv1 = mult(mv1, scalem(0.12,1.5,0.5));
    normalMatrix = mat3(
        mv1[0][0], mv1[0][1], mv1[0][2],
        mv1[1][0], mv1[1][1], mv1[1][2],
        mv1[2][0], mv1[2][1], mv1[2][2]
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    mv1 = mult(mv, translate(0.75,0,0));
    mv1 = mult(mv1, scalem(0.12,1.5,0.5));
    normalMatrix = mat3(
        mv1[0][0], mv1[0][1], mv1[0][2],
        mv1[1][0], mv1[1][1], mv1[1][2],
        mv1[2][0], mv1[2][1], mv1[2][2]
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    mv1 = mult(mv, translate(0,0,0));
    mv1 = mult(mv1, scalem(0.1,1.5,0.5));
    normalMatrix = mat3(
        mv1[0][0], mv1[0][1], mv1[0][2],
        mv1[1][0], mv1[1][1], mv1[1][2],
        mv1[2][0], mv1[2][1], mv1[2][2]
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    mv1 = mult(mv, translate(0,0,0));
    mv1 = mult(mv1, scalem(1.5,0.1,0.5));
    normalMatrix = mat3(
        mv1[0][0], mv1[0][1], mv1[0][2],
        mv1[1][0], mv1[1][1], mv1[1][2],
        mv1[2][0], mv1[2][1], mv1[2][2]
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    mv1 = mult(mv, translate(0,-0.77,0));
    mv1 = mult(mv1, scalem(1.62,0.1,0.5));
    normalMatrix = mat3(
        mv1[0][0], mv1[0][1], mv1[0][2],
        mv1[1][0], mv1[1][1], mv1[1][2],
        mv1[2][0], mv1[2][1], mv1[2][2]
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    
    mv1 = mult(mv, translate(0,0.77,0));
    mv1 = mult(mv1, scalem(1.62,0.1,0.5));
    normalMatrix = mat3(
        mv1[0][0], mv1[0][1], mv1[0][2],
        mv1[1][0], mv1[1][1], mv1[1][2],
        mv1[2][0], mv1[2][1], mv1[2][2]
    );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    requestAnimFrame(render);
}
