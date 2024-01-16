/* 
 * Scripts and definitions for media upload
 */

window['upload_media_options'] = {
    uploadTargetURL: '/SmartFile/smartfile/file/' + new URL(window.location.href).searchParams.get('collection_media'),
    docroot: '../../../',
    dbname: 'SmartMonitoring',
    storeobjectname: new URL(window.location.href).searchParams.get('collection_media'),
};

window.addEventListener('load', () => {

    // get elements
    const media_upload = document.querySelector('.media-upload');
    const info_noselect = document.querySelector('.info_noselect');
    const info_notavail = document.querySelector('.info_notavail');

    // get url params
    const id = new URL(window.location.href).searchParams.get('id');
    const collection_media = new URL(window.location.href).searchParams.get('collection_media');

    // display elements depending on url params
    if (collection_media && id) {
        info_noselect.remove();
        info_notavail.remove();
        document.addEventListener('swac_components_complete', () => {
            displayMediaUpload();
        })
    } else if (!collection_media && id) {
        media_upload.remove();
        info_noselect.remove();
    } else {
        media_upload.remove();
        info_notavail.remove();
    }
})

/**
 * Set up all elements and event listeners for media upload
 */
function displayMediaUpload() {
    // current video stream
    let currentStream;
    // current media recorder
    let recorder;

    // get elements
    const recording_stream = document.querySelector('.recording-stream');
    const video = document.querySelector('.media-cam');
    const media_device_list = document.querySelector('.media-device-list');
    const recording_canvas = document.querySelector('.recording-canvas');
    const actions = document.querySelector('.media-cam-actions');
    const upload_swac = document.querySelector('.upload-media')?.swac_comp;
    const tabs = document.querySelector('.tabs');
    // hide elements
    recording_canvas.style = 'display: none';
    video.style = 'display: none';
    actions.style = 'display: none';


    const take_picture = document.querySelector('.take-picture');
    const record_video = document.querySelector('.record-video');

    // add event listeners
    take_picture.addEventListener('click', takepicture);

    record_video.addEventListener('click', (e) => {
        recorder.ondataavailable = (e) => {
            const name = Date.now().toString() + '-video.mp4';
            const type = 'video/mp4';
            const file = new File([e.data], name, { type: type})
            upload_swac.addFile(file);
        }
        if (recorder.state === 'recording') {
            recorder.stop();
            record_video.textContent = 'Record Video';
            UIkit.notification({
                message: window.swac.lang.dict.app ? window.swac.lang.dict.app.media_upload_capture_video_saved : 'Video saved',
                status: 'sucess',
                pos: 'top-center',
                timeout: 2500
            });
            UIkit.tab(tabs).show(0);
        } else {
            recorder.start();
            record_video.textContent = 'Stop';
            UIkit.notification({
                message: window.swac.lang.dict.app ? window.swac.lang.dict.app.media_upload_capture_video_started : 'Video capture started',
                status: 'sucess',
                pos: 'top-center',
                timeout: 2500
            });
        }
    })

    media_device_list.addEventListener('change', () => {
        const videoConstraints = {};
        if (media_device_list.value == '')
            videoConstraints.facingMode = 'environment';
        else
            videoConstraints.deviceId = { exact: media_device_list.value };

        const mediaConstraints = {
            video: videoConstraints,
            audio: false,
        }

        selectMediaDevice(mediaConstraints);
    });

    navigator.mediaDevices.enumerateDevices().then(getDevices);
        
    /**
     * Select a media device with given constraints
     * @param {} mediaConstraints 
     */
    function selectMediaDevice(mediaConstraints) {
        if (typeof currentStream !== 'undefined') {
            stopMediaTracks(currentStream);
        }

        video.style = 'display: none';
        actions.style = 'display: none';

        const spinner = document.createElement('div');
        spinner.setAttribute('uk-spinner', 'ratio: 4.5');
        recording_stream.appendChild(spinner);


        navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then(stream => { 
            spinner.remove();
            video.style = 'display: block';
            actions.style = '';
            currentStream = stream;
            video.srcObject = stream;
            recorder = new MediaRecorder(stream);
            return navigator.mediaDevices.enumerateDevices();
        })
        .then(getDevices)
        .catch(err => { 
            console.error('Error accessing the media device',err) 
            UIkit.notification({
                message: window.swac.lang.dict.app ? window.swac.lang.dict.app.media_upload_device_list_error: 'Error while loading media devices',
                status: 'error',
                pos: 'top-center',
                timeout: 5000
            });
        })
        .finally(() => {
            spinner.remove();
        })
    }

    /**
     * Stop media device
     * @param {} stream 
     */
    function stopMediaTracks(stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    /**
     * Gets the media devices and adds them to the media device list
     * @param {*} mediaDevices 
     */
    function getDevices(mediaDevices) {
        const device_id = media_device_list.value;
        media_device_list.innerHTML = '';
        media_device_list.appendChild(document.createElement('option'));
        let count = 1;
        mediaDevices.forEach(mediaDevice => {
            if (mediaDevice.kind === 'videoinput') {
                const option_elem = document.createElement('option');
                option_elem.value = mediaDevice.deviceId;
                option_elem.textContent = mediaDevice.label || `Camera ${count++}`;
                media_device_list.appendChild(option_elem);
            }
        })
        if (device_id !== '') {
            media_device_list.value = device_id;
        }
    }


    /**
     * Take a picture and add it to the upload component
     * @returns {void}
     */
    function takepicture() {
        const context = recording_canvas.getContext('2d');
        context.drawImage(video, 0, 0, recording_canvas.width, recording_canvas.height);
        const name = Date.now().toString() + '-picture.jpeg';
        const type = 'image/jpeg';
        recording_canvas.toBlob((blob) => {
            const file = new File([blob], name, { type: type});
            upload_swac.addFile(file);
        },'image/jpeg');
        UIkit.tab(tabs).show(0);
    }
}

