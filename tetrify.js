function tetrifyImage(image) {
    var newDim = preprocessImage(image);
    var canvas = document.createElement('canvas');
    canvas.width = newDim[0];//image.width;
    canvas.height = newDim[1];//image.height;
    var x0 = (image.width - canvas.width) / 2.0;
    var y0 = (image.height - canvas.height) / 2.0;
    // var context = canvas.getContext('2d');
    // context.drawImage(image, x0, y0, canvas.width, canvas.height);
    // tetrify that image
    var w = canvas.width / squareSize;
    var h = canvas.height / squareSize;
    var matrix = createMatrix(w, h);
    var shapes = makeTiling(matrix, w, h);
    // now shuffle these shapes
    shuffleShapesToCanvas(shapes, image, x0, y0, canvas);
    // also draw a contour for each shape
    drawContours(canvas, shapes);
    addCanvasToDocument(canvas);
}
//

nTetrominoes = 20;

minSquareSizeRatio = .12;
defaultMinSquareSize = 180;

var strokeStyle = 'black';
var lineWidth = 5;

function preprocessImage(image) {
    var w = image.width;
    var h = image.height;
    //    var minSquareSize = Math.round(Math.min(w, h) * minSquareSizeRatio);
    var minSquareSize = defaultMinSquareSize;
        
    var computeGCD = function(a, b) {
        if ( ! b) {
            return a;
        }
        return computeGCD(b, a % b);
    };
    // console.log('old size:' + w + ' ' + h);
    var gcd = computeGCD(w, h);
    var result = [w, h];
    if (gcd < minSquareSize) {
        var i = 1;
        while (true) {
            var newW = w - i;
            var newH = h - i;
            var newWGCD = computeGCD(newW, h);
            var newHGCD = computeGCD(w, newH);
            if (newWGCD >= newHGCD && newWGCD >= minSquareSize) {
                w = newW;
                result = [newW, h];
                break;
            } else if (newHGCD >= newWGCD && newHGCD >= minSquareSize) {
                h = newH;
                result = [w, newH];
                break;
            } else {
                i += 1;
            }
        }
    }
    // now we set square size
    gcd = computeGCD(w, h);
    var divider = 1;
    while (true) {
        var nSquares = (divider * w / gcd) * (divider * h / gcd);
        if (nSquares / 4 < nTetrominoes || nSquares % 4 > 0) {
            divider += 1;
        } else {
            break;
        }
    }
    squareSize = gcd / divider;
    console.log('square size is ' + squareSize);
    console.log('new canvas size:' + w + ' ' + h);
    console.log('matrix size:' + w/squareSize + ' ' + h/squareSize);
    return result;
}

// (x0, y0) is the origin of the cropped image, i.e. the top left corner
// where we start
function shuffleShapesToCanvas(shapes, image, x0, y0, canvas) {
    var shapesForFamily = { 'L1': [], 'L2': [],
                            'I': [], 'S': [], 'T': [],
                            'Z1': [], 'Z2': [] };
    for (var s=0; s < shapes.length; s++) {
        shapesForFamily[shapes[s].family].push(shapes[s]);
    }
    // create a random assignment within shapes of the same family
    for (var f in shapesForFamily) {
        var indices = [];
        for (var s=0; s < shapesForFamily[f].length; s++) {
            indices.push(s);
        }
        shuffle(indices);
        // now draw each shape to its randomly assigned new position
        for (var s=0; s < shapesForFamily[f].length; s++) {
            var sFrom = shapesForFamily[f][s];
            var sTo = shapesForFamily[f][indices[s]];
            drawShuffledShape(sFrom, sTo, image, x0, y0, canvas);
        }
    }
}

// draw src shape where dest shape is
function drawShuffledShape(sFrom, sTo, image, x0, y0, canvas) {    
    // compute necessary angle
    var angle = (sTo.rotation - sFrom.rotation);
    // or unnecessary angle
    if (angle == 0 && nRotations[sFrom.family] == 1) {
        angle = Math.floor(Math.random() * 4);
    } else if (angle == 0 && nRotations[sFrom.family] == 2) {
        angle = 2 * Math.floor(Math.random() * 2);
    }
    // we want an angle in radians
    if (angle != 0) {
        angle *= Math.PI / 2.0;
    }
    // clip destination path
    var points = sTo.contour();
    var context = canvas.getContext('2d');
    context.save();
    context.beginPath();
    context.moveTo( squareSize * (sTo.x + points[0][0]),
                    squareSize * (sTo.y + points[0][1]) );
    for (var p=1; p < points.length; p++) {
        context.lineTo( squareSize * (sTo.x + points[p][0]),
                        squareSize * (sTo.y + points[p][1]) );
    }
    context.closePath();
    context.clip();
    // finally, draw shape
    // origin box
    var boxFrom = sFrom.getBox();
    var xFrom = x0 + squareSize * sFrom.x;
    var yFrom = y0 + squareSize * sFrom.y;
    var wFrom = squareSize * (1 + boxFrom[2]);
    var hFrom = squareSize * (1 + boxFrom[3]);
    // destination box
    var boxTo = sTo.getBox();
    var wTo = squareSize * (1 + boxTo[2]);
    var hTo = squareSize * (1 + boxTo[3]);
    var xTo = squareSize * sTo.x + wTo / 2.0;
    var yTo = squareSize * sTo.y + hTo / 2.0;
    context.translate(xTo, yTo);
    context.rotate(-angle);
    context.drawImage( image,
                       x0 + squareSize * sFrom.x,
                       y0 + squareSize * sFrom.y,
                       wFrom, hFrom,
                       -wFrom / 2.0, -hFrom / 2.0,
                       wFrom, hFrom );
    context.restore();
}

function createMatrix(w, h) {
    var matrix = [];
    for (var i=0; i < w; i++) {
        var line = [];
        for (var j=0; j < h; j++) {
            line.push(0);
        }
        matrix.push(line);
    }
    return matrix;
}

squareSize = 0;

function tryToFitShape(shape, matrix) {
    var bestFit = 0;
    var bestX = -5;
    var bestY = -5;
    var bestRot = -1;
    for (var rot=0; rot < shape.nRotations(); rot++) {
        shape.rotation = rot;
        for (var x=0; x < matrix.length; x++) {
            for (var y=0; y < matrix[x].length; y++) {
                var fit = shape.fit(matrix, x, y);
                if (fit > bestFit) {
                    bestFit = fit;
                    bestX = x;
                    bestY = y;
                    bestRot = rot;
                }
            }
        }
    }
    return [ bestX, bestY, bestRot ];
}

function makeTiling(matrix, w, h) {
    var nSquares = w * h;
    while(true) {
        // console.log('Trying new sequence');
        // build new sequence
        var sequence = [];
        var nRemaining = nSquares;
        for (var x=0; x < nSquares; x++) {
            newShape = allShapes[Math.floor(Math.random() * allShapes.length)];
            sequence.push(newShape)
        }
        var out = [];
        // clear the matrix in case it isn't
        for (var i=0; i < w; i++) {
            for (var j=0; j < h; j++) {
                matrix[i][j] = 0;
            }
        }
        // iteratively try to fit the shapes
        for (var i=0; i < sequence.length; i++) {
            var coords = tryToFitShape(sequence[i], matrix);
            var x = coords[0];
            var y = coords[1];
            var r = coords[2];
            if (x != -5) {
                // add the shape to the matrix
                sequence[i].rotation = r;
                // add it to the sequence
                var shape = new Shape(sequence[i].family, sequence[i].rotation);
                shape.addToMatrix(matrix, x, y);
                out.push( shape );
                // four less squares to cover
                nRemaining -= 4;
                if (nRemaining == 0) {
                    // console.log('successful tiling');
                    return out;
                }
            }
        }
    }
}

function drawContours(canvas, shapes) {
    // console.log('Drawing contours, squareSize = ' + squareSize);
    var context = canvas.getContext('2d');
    for (var s=0; s < shapes.length; s++) {
        var shape = shapes[s];
        var contour = shape.contour();
        context.strokeStyle = strokeStyle;
        context.lineWidth = lineWidth;
        context.beginPath();
        begin = true;
        for (var p=0; p < contour.length; p++) {
            var u = contour[p][0];
            var v = contour[p][1];
            var i = (shape.x + u) * squareSize;
            var j = (shape.y + v) * squareSize;
            if (begin) {
                context.moveTo(i, j);
                begin = false;
            } else {
                context.lineTo(i, j);
            }
        }
        context.closePath();
        context.stroke();
    }
}
