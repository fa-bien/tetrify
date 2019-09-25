points = {
    'L1': [ [ [0, 0], [1, 0], [2, 0], [0, 1] ],  
            [ [0, 0], [0, 1], [0, 2], [1, 2] ],
            [ [0, 1], [1, 1], [2, 1], [2, 0] ],  
            [ [0, 0], [1, 0], [1, 1], [1, 2] ] ],
    'L2': [ [ [0, 0], [1, 0], [2, 0], [2, 1] ],
            [ [0, 0], [1, 0], [0, 1], [0, 2] ],
            [ [0, 0], [0, 1], [1, 1], [2, 1] ],
            [ [1, 0], [1, 1], [1, 2], [0, 2] ] ],
    'I': [ [ [0, 0], [1, 0], [2, 0], [3, 0] ],
            [ [0, 0], [0, 1], [0, 2], [0, 3] ] ],
    'S': [ [ [0, 0], [0, 1], [1, 0], [1, 1] ] ],
    'T': [ [ [0, 0], [1, 0], [2, 0], [1, 1] ],
            [ [0, 0], [0, 1], [0, 2], [1, 1] ],
            [ [0, 1], [1, 1], [2, 1], [1, 0] ],
            [ [1, 0], [1, 1], [1, 2], [0, 1] ] ],
    'Z1': [ [ [0, 0], [1, 0], [1, 1], [2, 1] ],
            [ [1, 0], [1, 1], [0, 1], [0, 2] ] ],
    'Z2':  [ [ [0, 1], [1, 1], [1, 0], [2, 0] ],
             [ [0, 0], [0, 1], [1, 1], [1, 2] ] ]
};

contour = {
    'L1': [ [ [0, 0], [3, 0], [3, 1], [1, 1], [1, 2], [0, 2] ],
            [ [0, 0], [0, 3], [2, 3], [2, 2], [1, 2], [1, 0] ],
            [ [0, 1], [2, 1], [2, 0], [3, 0], [3, 2], [0, 2] ],
            [ [0, 0], [2, 0], [2, 3], [1, 3], [1, 1], [0, 1] ] ],
    'L2': [ [ [0, 0], [3, 0], [3, 2], [2, 2], [2, 1], [0, 1] ],
            [ [0, 0], [2, 0], [2, 1], [1, 1], [1, 3], [0, 3] ],
            [ [0, 0], [1, 0], [1, 1], [3, 1], [3, 2], [0, 2] ],
            [ [1, 0], [2, 0], [2, 3], [0, 3], [0, 2], [1, 2] ] ],
    'I': [ [ [0, 0], [4, 0], [4, 1], [0, 1] ],
           [ [0, 0], [1, 0], [1, 4], [0, 4] ]],
    'S': [ [ [0, 0], [2, 0], [2, 2], [0, 2] ]],
    'T': [ [ [0, 0], [3, 0], [3, 1], [2, 1], [2, 2], [1, 2], [1, 1], [0, 1] ],
           [ [0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [1, 2], [1, 3], [0, 3] ],
           [ [0, 1], [1, 1], [1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [0, 2] ],
           [ [1, 0], [2, 0], [2, 3], [1, 3], [1, 2], [0, 2], [0, 1], [1, 1] ]],
    'Z1': [ [ [0, 0], [2, 0], [2, 1], [3, 1], [3, 2], [1, 2], [1, 1], [0, 1] ], 
            [ [1, 0], [2, 0], [2, 2], [1, 2], [1, 3], [0, 3], [0, 1], [1, 1] ]],
    'Z2': [ [ [0, 1], [1, 1], [1, 0], [3, 0], [3, 1], [2, 1], [2, 2], [0, 2] ],
            [ [0, 0], [1, 0], [1, 1], [2, 1], [2, 3], [1, 3], [1, 2], [0, 2] ]]
};

nRotations = { 'L1': 4, 'L2': 4, 'I': 2, 'S': 1, 'T': 4, 'Z1': 2, 'Z2': 2 };

function Shape(family, rotation) {
    this.family = family;
    this.rotation = rotation;
    this.x = undefined;
    this.y = undefined;
    this.nRotations = function() { return nRotations[this.family]; };
    this.points = function() { return points[this.family][this.rotation]; };
    this.contour = function() { return contour[this.family][this.rotation]; };
    this.rotate = function(newR) { this.rotation = newR; };
    // return bounding box as [ xmin, ymin, xmax, ymax ]
    this.getBox = function() {
        var box = [ 5, 5, -5, -5 ];
        for (var p=0; p < points[this.family][this.rotation].length; p++) {
            var u = points[this.family][this.rotation][p][0];
            var v = points[this.family][this.rotation][p][1];
            if (u < box[0]) {
                box[0] = u;
            }
            if (u > box[2]) {
                box[2] = u;
            }
            if (v < box[1]) {
                box[1] = v;
            }
            if (v > box[3]) {
                box[3] = v;
            }
        }
        return box;
    };
    this.addToMatrix = function(matrix, x, y) {
        this.x = x;
        this.y = y;
        for (var p=0; p < points[this.family][this.rotation].length; p++) {
            var u = points[this.family][this.rotation][p][0];
            var v = points[this.family][this.rotation][p][1];
            matrix[x+u][y+v] = 1;
        }
    };
    this.removeFromMatrix = function(matrix, x, y) {
        for (var p=0; p < points[this.family][this.rotation].length; p++) {
            var u = points[this.family][this.rotation][p][0];
            var v = points[this.family][this.rotation][p][1];
            matrix[x+u][y+v] = 0;
        }
    };
    // see if and how it fits in the given matrix
    this.fit = function(matrix, x, y) {
        var fit = 0;
        for (var p=0; p < points[this.family][this.rotation].length; p++) {
            var u = points[this.family][this.rotation][p][0];
            var v = points[this.family][this.rotation][p][1];
            if ( x + u < 0 || x + u >= matrix.length ||
                 y + v < 0 || y + v >= matrix[x].length ||
                 matrix[x+u][y+v] != 0 ) {
                return 0;
            } else {
                if (x + u - 1 < 0 || matrix[x+u-1][y+v] != 0) {
                    fit += 1;
                }
                if (x + u + 1 >= matrix.length || matrix[x+u+1][y+v] != 0) {
                    fit += 1;
                }
                if (y + v - 1 < 0 || matrix[x+u][y+v-1] != 0) {
                    fit += 1;
                }
                if (y + v + 1 < 0 || matrix[x+u][y+v+1] != 0) {
                    fit += 1;
                }
            }
        }
        // now we try to actually put it there and see if that's viable
        this.addToMatrix(matrix, x, y);
        var viable = true;
        if (fit > 1) {
            viable = viableFreeAreas(matrix);
        }
        // in any case, undo the putting it there
        this.removeFromMatrix(matrix, x, y);
        // now if it fits, return the fit
        if (fit == 0 || ! viable ) {
            return 0;
        }
        return fit;
    }
}

allShapes = [
    new Shape('L1', 0), new Shape('L1', 1),
    new Shape('L1', 2), new Shape('L1', 3),
    new Shape('L2', 0), new Shape('L2', 1),
    new Shape('L2', 2), new Shape('L2', 3),
    new Shape('I', 0),  new Shape('I', 1),
    new Shape('S', 0),
    new Shape('T', 0),  new Shape('T', 1), new Shape('T', 2), new Shape('T', 3),
    new Shape('Z1', 0), new Shape('Z1', 1), 
    new Shape('Z2', 0), new Shape('Z2', 1)
];
