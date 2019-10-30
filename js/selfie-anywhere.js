const camera = document.getElementById('webcam');
const canvasPerson = document.getElementById("canvasPerson");
const multiplier = 0.75;
const outputStride = 16;
const segmentationThreshold = 0.5;
const backgrounds = ["greatwall", "eiffel-tower", "louvre", "monchu", "beach","desert", "moon"];
const backgroundImagesPath = 'images/';
const snapSound = new Audio('audio/snap.wav');

let contextPerson = canvasPerson.getContext('2d');
let currentStream;
let deviceIds = [];
let selectedDevice;
let net;
let cameraFrame;
let currentBGIndex = 0;

$(document).ready(function() {    
    $('.flash').hide();  
});
    
$("#webcam-switch").change(function () {
    if(this.checked){
        $('.md-modal').addClass('md-show');
        if (navigator.mediaDevices) {
            navigator.mediaDevices.enumerateDevices().then(function(devices){
              if(getDevices(devices)){
                if(deviceIds.length>1){
                  selectedDevice = deviceIds[1];
                }else{
                  selectedDevice = deviceIds[0];
                }
                startCamera();
              }else{
                alert('No camera detected');
              }
            });
          }else{
            $("#errorMsg").removeClass("d-none");
          }  
    }
    else {        
        $("#webcam-control").removeClass("webcam-on");
        $("#webcam-control").addClass("webcam-off");
        $("#cameraFlip").addClass('d-none');
        $(".webcam-container").addClass("d-none");
        $("#webcam-caption").html("Click to Start Camera");
        $([document.documentElement, document.body]).animate({
            scrollTop: ($("#selfie-anywhere-app").offset().top - 80)
        }, 1000);
        $('.md-modal').removeClass('md-show');
        stopMediaTracks(currentStream);
        cancelAnimationFrame(cameraFrame);

    }        
});

function getDevices(mediaDevices) {
    deviceIds = [];
    let count = 0;
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        deviceIds.push(mediaDevice.deviceId);
        count = count + 1;
      }
    });
    return (count>0);
}
  
function startCamera(){
    if (typeof currentStream !== 'undefined') {
      stopMediaTracks(currentStream);
    }
    const videoConstraints = {};
    if (selectedDevice === '') {
      videoConstraints.facingMode = 'user';
    } else {
      videoConstraints.deviceId = { exact: selectedDevice};
    }
    const constraints = {
      video: videoConstraints,
      audio: false
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        currentStream = stream;
        camera.srcObject = stream;
        camera.play();
        $("#errorMsg").addClass("d-none");
        startDetectBody();
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(getDevices)
      .catch(error => {
        $("#errorMsg").removeClass("d-none");
      });
}

function stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
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
    $("#webcam-caption").html("on");
    $("#webcam-control").removeClass("webcam-off");
    $("#webcam-control").addClass("webcam-on");
    $("#canvasPerson").addClass("d-none");
    $(".webcam-container").removeClass("d-none");
    $(".spinner-border").removeClass('d-none');
    bodyPix.load(multiplier)
    .catch(error => {
        alert("Fail to load model");
    })
    .then(objNet => {
        $(".spinner-border").addClass('d-none');
        net = objNet;
        cameraFrame = detectBody();
        
    });
}

function detectBody(){
    net.estimatePersonSegmentation(camera, outputStride, segmentationThreshold)
    .catch(error => {
        alert("Fail to segment person");
    })
    .then(personSegmentation => {
        drawBody(personSegmentation);
        $("#canvasPerson").removeClass("d-none");
    });
    cameraFrame = requestAnimFrame(detectBody);
}

function drawBody(personSegmentation)
{
    contextPerson.drawImage(camera, 0, 0, camera.width, camera.height);
    var imageData = contextPerson.getImageData(0,0, camera.width, camera.height);
    var pixel = imageData.data;
    for (var p = 0; p<pixel.length; p+=4)
    {
      if (personSegmentation.data[p/4] == 0) {
          pixel[p+3] = 0;
      }
    }
    contextPerson.imageSmoothingEnabled = true;
    contextPerson.putImageData(imageData,0,0);
}

$("#arrowLeft").click(function () {
    if(currentBGIndex == 0){
        currentBGIndex = backgrounds.length - 1;
    }else{
        currentBGIndex = currentBGIndex -1;
    }
    $('#selfie-anywhere-app').css('background-image', 'url('+ backgroundImagesPath + backgrounds[currentBGIndex] +'.jpg)');
    $('.webcam-container').css('background-image', 'url('+ backgroundImagesPath + backgrounds[currentBGIndex] +'.jpg)');
});

$("#arrowRight").click(function () {
    if(currentBGIndex == backgrounds.length - 1){
        currentBGIndex = 0;
    }else{
        currentBGIndex = currentBGIndex +1;
    }
    $('#selfie-anywhere-app').css('background-image', 'url('+ backgroundImagesPath + backgrounds[currentBGIndex] +'.jpg)');
    $('.webcam-container').css('background-image', 'url('+ backgroundImagesPath + backgrounds[currentBGIndex] +'.jpg)');
});

$("#take-photo").click(function () {
    var captureElement= document.body;
    var appendElement= document.getElementById('webcam-container');
    $('#webcam-control').addClass('d-none');
    $('#arrowLeft').addClass('d-none');
    $('#arrowRight').addClass('d-none');
    $('#cameraControls').addClass('d-none');
    html2canvas(captureElement).then(function(canvas) {
        snapSound.play();
        $('.flash')
            .show() 
            .animate({opacity: 0.5}, 300) 
            .fadeOut(300)
            .css({'opacity': 1});
        canvas.id='captureCanvas';
        appendElement.appendChild(canvas);
        document.querySelector('#download-photo').href = canvas.toDataURL('image/png');
        camera.pause();
        cancelAnimationFrame(cameraFrame);
        $('#canvasPerson').addClass('d-none');
        $('#take-photo').addClass('d-none');
        $('#delete-photo').removeClass('d-none');
        $('#download-photo').removeClass('d-none');
        $('#cameraControls').removeClass('d-none');
    });
});

$("#delete-photo, #download-photo").click(function () {
    $( "#captureCanvas" ).remove();
    resumeCamera();
});

function resumeCamera(){
    $('#webcam-control').removeClass('d-none');
    $('#arrowLeft').removeClass('d-none');
    $('#arrowRight').removeClass('d-none');
    $('#cameraControls').removeClass('d-none');
    $('#take-photo').removeClass('d-none');
    $('#delete-photo').addClass('d-none');
    $('#download-photo').addClass('d-none');
    camera.play();
    cameraFrame = detectBody();
}