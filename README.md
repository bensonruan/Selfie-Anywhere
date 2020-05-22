# Selfie Anywhere – Person Segmentation
 Instance segmentation to separate person body with background. Put youself inside beautiful natural scenes by changing the background of a selfie in real-time.

 
 ## Live Demo
**[https://bensonruan.com/selfie-anywhere-person-segmentation-with-bodypix/](https://bensonruan.com/selfie-anywhere-person-segmentation-with-bodypix/)**

![body-pix-background-change](https://bensonruan.com/wp-content/uploads/2020/05/body-pix-demo.png)

## Installing
Clone this repository to your local computer
``` bash
git https://github.com/bensonruan/Selfie-Anywhere.git
```
Point your localhost to the cloned root directory

Browse to http://localhost/index.html 

## Start Playing
* Turn on the Webcam switch and allowing the browser to access your webcam 
* You would see yourself inside beautiful travel scene in the background of a selfie
* Choose your favorite scene
* Take a selfie by pressing the camera button
* Download the selfie by pressing the download button

## Notes
Please note that on iOS Safari, cameras can only be accessed via the https protocol 

## Regerence
* [jquery](https://code.jquery.com/jquery-3.3.1.min.js) - JQuery
* [tfjs-models/body-pix](https://github.com/tensorflow/tfjs-models/tree/master/body-pix) - Person and body part segmentation in the browser using TensorFlow.js
* [html2canvas](https://html2canvas.hertzen.com) - Javascript library allows you to take screenshots of webpages or parts of it, directly on the users browser
