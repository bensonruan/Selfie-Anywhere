const webcamElement = document.getElementById('webcam');
const webcam = new Webcam(webcamElement, 'user');
const canvasPerson = document.getElementById("canvasPerson");
const multiplier = 0.75;
const outputStride = 16;
const segmentationThreshold = 0.5;
const backgrounds = ["greatwall", "pyramid", "Colosseum", "monchu", "ayers-rock","taj", "easter-island", "moon"];
const backgroundImagesPath =  'images/';
const snapSound = new Audio('audio/snap.wav');

const contextPerson = canvasPerson.getContext("2d");
let net;
let cameraFrame;
let currentBGIndex = 0;

$("#webcam-switch").change(function () {
    if(this.checked){
        $('.md-modal').addClass('md-show');
        webcam.start()
            .then(result =>{
               cameraStarted();
               console.log("webcam started");
               startDetectBody();
            })
            .catch(err => {
                displayError();
            });
    }
    else {        
        cameraStopped();
        webcam.stop();
        cancelAnimationFrame(cameraFrame);
        console.log("webcam stopped");
    }        
});

function displayError(err = ''){
    if(err!=''){
        $("#errorMsg").html(err);
    }
    $("#errorMsg").removeClass("d-none");
}

function cameraStarted(){
    $("#errorMsg").addClass("d-none");
    $('.flash').hide();
    $("#webcam-caption").html("on");
    $("#webcam-control").removeClass("webcam-off");
    $("#webcam-control").addClass("webcam-on");
    $("#canvasPerson").addClass("d-none");
    $(".webcam-container").removeClass("d-none");
    $(".spinner-border").removeClass('d-none');
    $("#wpfront-scroll-top-container").addClass("d-none");
    window.scrollTo(0, 0); 
    $('body').css('overflow-y','hidden');
}

function cameraStopped(){
    $("#errorMsg").addClass("d-none");
    $("#wpfront-scroll-top-container").removeClass("d-none");
    $("#webcam-control").removeClass("webcam-on");
    $("#webcam-control").addClass("webcam-off");
    $(".webcam-container").addClass("d-none");
    $("#webcam-caption").html("Click to Start Camera");
    $('.md-modal').removeClass('md-show');
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelAnimationFrame = (function(){
    return  window.cancelAnimationFrame || window.mozCancelAnimationFrame;
})();


function startDetectBody() {
    bodyPix.load(multiplier)
    .catch(error => {
        console.log(error);
    })
    .then(objNet => {
        $(".spinner-border").addClass('d-none');
        net = objNet;
        cameraFrame = detectBody();
    });
}

function detectBody(){
    net.estimatePersonSegmentation(webcamElement, outputStride, segmentationThreshold)
    .catch(error => {
        console.log(error);
    })
    .then(personSegmentation => {
        drawBody(personSegmentation);
        $("#canvasPerson").removeClass("d-none");
    });
    cameraFrame = requestAnimFrame(detectBody);
}

function drawBody(personSegmentation)
{
    var canvas = document.createElement('canvas');
    canvas.width = webcamElement.width;
    canvas.height = webcamElement.height;
    var context = canvas.getContext('2d');
    context.drawImage(webcamElement, 0, 0);
    var imageData = context.getImageData(0,0, webcamElement.width, webcamElement.height);
    var pixel = imageData.data;
    for (var p = 0; p<pixel.length; p+=4)
    {
      if (personSegmentation.data[p/4] == 0) {
          pixel[p+3] = 0;
      }
    }
    context.imageSmoothingEnabled = true;
    context.putImageData(imageData,0,0);

    var imageObject=new Image();
    imageObject.onload=function(){        
        canvasPerson.width = webcamElement.scrollWidth;
        canvasPerson.height = webcamElement.scrollHeight;
        contextPerson.clearRect(0,0,canvasPerson.width,canvasPerson.height);
        if(webcam.facingMode == 'user'){
            contextPerson.translate(canvasPerson.width, 0);
            contextPerson.scale(-1, 1);
        }
        contextPerson.imageSmoothingEnabled = true;
        contextPerson.drawImage(imageObject, 0, 0, canvasPerson.width, canvasPerson.height);
    }
    imageObject.src=canvas.toDataURL();
}

$("#arrowLeft").click(function () {
    if(currentBGIndex == 0){
        currentBGIndex = backgrounds.length - 1;
    }else{
        currentBGIndex = currentBGIndex -1;
    }
    $('#selfie-anywhere-app').css('background-image', 'url('+ backgroundImagesPath + backgrounds[currentBGIndex] +'.jpg)');
    $('#background-container').css('background-image', 'url('+ backgroundImagesPath + backgrounds[currentBGIndex] +'.jpg)');
});

$("#arrowRight").click(function () {
    if(currentBGIndex == backgrounds.length - 1){
        currentBGIndex = 0;
    }else{
        currentBGIndex = currentBGIndex +1;
    }
    $('#selfie-anywhere-app').css('background-image', 'url('+ backgroundImagesPath + backgrounds[currentBGIndex] +'.jpg)');
    $('#background-container').css('background-image', 'url('+ backgroundImagesPath + backgrounds[currentBGIndex] +'.jpg)');
});

$("#take-photo").click(function () {
    beforeTakePhoto();
    var captureElement= document.getElementById('selfie-container');
    var appendElement= document.getElementById('webcam-container');
    html2canvas(captureElement).then(function(canvas) {
        canvas.id='captureCanvas';
        canvas.style.position = "absolute";
        canvas.style.top = "0px";
        canvas.style.left = "0px";
        appendElement.appendChild(canvas);
        document.querySelector('#download-photo').href = canvas.toDataURL('image/png');
        afterTakePhoto();
    });
});

function beforeTakePhoto(){
    snapSound.play();
    $('.flash')
        .show() 
        .animate({opacity: 0.5}, 1000) 
        .fadeOut(1000)
        .css({'opacity': 1});
    window.scrollTo(0, 0); 
    $('#webcam-control').addClass('d-none');
    $('#arrowLeft').addClass('d-none');
    $('#arrowRight').addClass('d-none');
    $('#cameraControls').addClass('d-none');
}

function afterTakePhoto(){
    webcam.stop();
    cancelAnimationFrame(cameraFrame);
    $('#selfie-container').addClass('d-none');
    $('#take-photo').addClass('d-none');
    $('#exit-app').removeClass('d-none');
    $('#download-photo').removeClass('d-none');
    $('#resume-camera').removeClass('d-none');
    $('#cameraControls').removeClass('d-none');
}

function removeCapture(){
    $('#captureCanvas').remove();
    $('#selfie-container').removeClass('d-none');
    $('#webcam-control').removeClass('d-none');
    $('#arrowLeft').removeClass('d-none');
    $('#arrowRight').removeClass('d-none');
    $('#cameraControls').removeClass('d-none');
    $('#take-photo').removeClass('d-none');
    $('#exit-app').addClass('d-none');
    $('#download-photo').addClass('d-none');
    $('#resume-camera').addClass('d-none');
}

$("#resume-camera").click(function () {
    webcam.stream()
        .then(facingMode =>{
            removeCapture();
            cameraFrame = detectBody();
        });
});

$("#exit-app").click(function () {
    removeCapture();
    $("#webcam-switch").prop("checked", false).change();
});