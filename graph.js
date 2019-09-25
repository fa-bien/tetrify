// given a matrix, determine if each free connected area has a size that is
// a multiple of four
function viableFreeAreas(matrix) {
    // used to track subset of each node. -1 means not tracked yet.
    var subsetFor = [];
    // initialise matrix of subsets
    for (var x=0; x < matrix.length; x++) {
        var row = [];
        for (var y=0; y < matrix[x].length; y++) {
            if (matrix[x][y] == 0) {
                row.push(-1);
            } else {
                row.push(false);
            }
        }
        subsetFor.push(row);
    }
    // amount of nodes in a given subset
    var nForSubset = {};
    function markSuccessors(x, y, number) {
        // mark successors if necessary
        if (x > 0 && subsetFor[x-1][y] == -1) {
            mark(x-1, y, number);
        }
        if (x+1 < matrix.length && subsetFor[x+1][y] == -1) {
            mark(x+1, y, number);
        }
        if (y > 0 && subsetFor[x][y-1] == -1) {
            mark(x, y-1, number);
        }
        if (y+1 < matrix[x].length && subsetFor[x][y+1] == -1) {
            mark(x, y+1, number);
        }
    }
    function mark(x, y, number) {
        subsetFor[x][y] = number;
        if (! number in nForSubset) {
            nForSubset[number] = 1;
        } else {
            nForSubset[number] += 1;
        }
        markSuccessors(x, y, number);
    }
    var toProcess = [];
    // mark all uncovered squares as unmarked or as unmarkable
    for (var x=0; x < matrix.length; x++) {
        subsetFor[x] = [];
        for (var y=0; y < matrix[x].length; y++) {
            if (matrix[x][y] == 0) {
                subsetFor[x][y] = -1;
                toProcess.push([x, y]);
            } else {
                subsetFor[x][y] = false;
            }
        }
    }
    // now for each of them calculate the whole connected area
    var currentSubset = 0;
    for (var i=0; i < toProcess.length; i++) {
        var x = toProcess[i][0];
        var y = toProcess[i][1];
        // has it already been marked? If not: mark it
        if (subsetFor[x][y] == -1) {
            nForSubset[currentSubset] = 0;
            mark(x, y, currentSubset);
            currentSubset += 1;
        }
    }
    // check that each connected area has a size that is a multiple of four
    for (var subset in nForSubset) {
        if (nForSubset[subset] % 4 > 0) {
            return false;
        }
    }
    return true;
}
