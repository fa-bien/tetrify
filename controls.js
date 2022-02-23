if (! window.FileReader) {
    alert('FileReader not supported');
}

function cancelEvent(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}
document.addEventListener('dragover', cancelEvent, false);
document.addEventListener('drop', cancelEvent, false);

function acceptable(file) {
    var acceptableTypes= document.getElementById('inputBtn').accept.split(',');
    return (acceptableTypes.indexOf(file.type) >= 0);
}

function handleFileSelect(evt) {
    var f = evt.target.files[0];
    tryToProcessFile(f);
}

document.getElementById('inputBtn').addEventListener('change',
                                                     handleFileSelect, false);

function handleFileDrop(evt) {
    // prevent default behaviour to open the image in the browser
    evt.stopPropagation();
    evt.preventDefault();
    var f = evt.dataTransfer.files[0];
    tryToProcessFile(f);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

var dropArea = document.getElementById('dropArea');
dropArea.addEventListener('dragover', handleDragOver, false);
dropArea.addEventListener('drop', handleFileDrop, false);

function tryToProcessFile(file) {
    if (acceptable(file)) {
        document.getElementById('fileInfo').innerHTML = '';
        processImage(file);
    } else {
        document.getElementById('fileInfo').innerHTML = 'File ' + file.name +
            ' cannot be tetrified, please provide a jpeg or png file.';
    }
}

function processImage(file) {
    var fr = new FileReader();
    fr.onload = function(evt) {
        dataLoaded(evt.target.result);
    }
    // console.log(file.type);
    fr.readAsDataURL(file);
    currentImageType = file.type;
}

function dataLoaded(dataURL) {
    var image = new Image();
    image.onload = function() {
        tetrifyImage(image);
    }
    image.src = dataURL;
}

currentImageType = undefined;

function addCanvasToDocument(canvas) {
    // replace content of dropArea with the new image
    document.getElementById('dropArea').innerHTML =
        ['<img id="output" class="droppedImage" src="',
         canvas.toDataURL(currentImageType),
         '" title="tetrified"/>'].join('');
}
