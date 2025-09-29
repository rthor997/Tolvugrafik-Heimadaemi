"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 4;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, 1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 ), 
        vec2( -1, -1 )
    ];

    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function square( a, b, c, d )
{
    //fyrsti þríhyrningur
    points.push( a, b, c);
    //annar þríhryningur
    points.push( a, c, d);
}

function divideSquare( a, b, c, d, count )
{
    // check for end of recursion
    if ( count === 0 ) {
        square( a, b, c, d);
    }
    else {

    // Þessi partur var skirfaður af Jón Emil 
    var aab = vec2( a[0] * (2/3) + b[0] * (1/3), a[1] * (2/3) + b[1] * (1/3) )
    var abb = vec2( b[0] * (2/3) + a[0] * (1/3), b[1] * (2/3) + a[1] * (1/3) )
    var bbc = vec2( b[0] * (2/3) + c[0] * (1/3), b[1] * (2/3) + c[1] * (1/3) )
    var bcc = vec2( c[0] * (2/3) + b[0] * (1/3), c[1] * (2/3) + b[1] * (1/3) )
    var ccd = vec2( c[0] * (2/3) + d[0] * (1/3), c[1] * (2/3) + d[1] * (1/3) )
    var cdd = vec2( d[0] * (2/3) + c[0] * (1/3), d[1] * (2/3) + c[1] * (1/3) )
    var dda = vec2( d[0] * (2/3) + a[0] * (1/3), d[1] * (2/3) + a[1] * (1/3) )
    var daa = vec2( a[0] * (2/3) + d[0] * (1/3), a[1] * (2/3) + d[1] * (1/3) )

    
    var A = vec2( a[0] * (2/3) + c[0] * (1/3), a[1] * (2/3) + c[1] * (1/3) )
    var B = vec2( b[0] * (2/3) + d[0] * (1/3), b[1] * (2/3) + d[1] * (1/3) )
    var C = vec2( c[0] * (2/3) + a[0] * (1/3), c[1] * (2/3) + a[1] * (1/3) )
    var D = vec2( d[0] * (2/3) + b[0] * (1/3), d[1] * (2/3) + b[1] * (1/3) )

    
    --count

    
    divideSquare( a, aab, A, daa, count )
    divideSquare( aab, abb, B, A, count )
    divideSquare( abb, b, bbc, B, count )
    divideSquare( B, bbc, bcc, C, count )
    divideSquare( C, bcc, c, ccd, count )
    divideSquare( D, C, ccd, cdd, count )
    divideSquare( dda, D, cdd, d, count )
    divideSquare( daa, A, D, dda, count )
    //
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
