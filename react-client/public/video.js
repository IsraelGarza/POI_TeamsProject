window.onload = function() {

    //add constraints object
    var constraints = { audio: true,
                        video: true};

    //call getUserMedia, then the magic
    navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream){
        var video = document.querySelector('video');
        video.srcObject = mediaStream;
        video.play();
    }).catch(function(err){
        console.log("Error al solicitar la cámara." + err.message);
    });

}