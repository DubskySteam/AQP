/**
 * This component is NOT opensource.
 * Copyright by Florian Fehring
 * 
 * @type type
 */

var MediaplayerFactory = {};
MediaplayerFactory.create = function (config) {
    return new Mediaplayer(config);
};

class Mediaplayer extends Component {

    /*
     * Constructs a new component object and transfers the config to the
     * object
     */
    constructor(options = {}) {
        super(options);
        this.name = 'Mediaplayer';
        this.desc.text = 'The Mediaplayer component creates a view for media files with direct play, download and information possibilities.';
        this.desc.premium = true;
        this.desc.depends[0] = {
            name: 'Mediacode.js',
            path: SWAC_config.swac_root + '/swac/components/Mediaplayer/Mediacode.js',
            desc: 'Class that creates DOM elements for media.'
        };
        this.desc.templates[0] = {
            name: 'slideplay',
            style: 'slideplay',
            desc: 'Displays the media fullsize with playlist and slide effects.'
        };
        this.desc.templates[1] = {
            name: 'medialist',
            style: 'medialist',
            desc: 'Creates a list of media elements with and downloadlink.'
        };

        this.desc.reqPerTpl[0] = {
            selc: 'audio',
            desc: 'Autio tag'
        };
        this.desc.reqPerTpl[1] = {
            selc: '.swac_audioForFile',
            desc: 'Area that is filled for each file'
        };

        this.desc.optPerTpl[0] = {
            selc: '.swac_audioCover',
            desc: 'img element for cover picture'
        };

        this.desc.reqPerSet[0] = {
            name: 'id',
            desc: 'Dataset id for finding associated files'
        };
        this.desc.reqPerSet[1] = {
            name: 'files',
            desc: 'Reference to list of files for this title'
        };

        this.desc.optPerSet[0] = {
            name: 'cover',
            desc: 'Path to cover file, if given the cover image is shown.'
        };
        this.desc.optPerSet[1] = {
            name: 'coverwidth',
            desc: 'Widht of the cover file'
        };
        this.desc.optPerSet[2] = {
            name: 'coverwidth',
            desc: 'Height of the cover file'
        };

        this.desc.opts[0] = {
            name: "defaultDuration",
            desc: "The default length in seconds a media should be displayed, if it has no duration information."
        };
        // Setting a default value, only applying when the options parameter does not contain this option
        if (!options.defaultDuration)
            this.options.defaultDuration = 10;

        this.desc.opts[1] = {
            name: "commentRequestor",
            desc: "Requestor used for showing comments on the media. Comments must contain the mediaid, timepoint and comment attributes."
        };
        if (!options.commentRequestor)
            this.options.commentRequestor = null;

        this.desc.opts[2] = {
            name: "stopOnStartComment",
            desc: "If set to true playback is stoped as soon as a user enters the comment textfield."
        };
        if (!options.stopOnStartComment)
            this.options.stopOnStartComment = false;

        this.desc.opts[3] = {
            name: "pathattr",
            desc: "Name of the attribute that contains the path to the data"
        };
        if (!options.pathattr)
            this.options.pathattr = 'path';

        this.desc.opts[4] = {
            name: "overlayclass",
            desc: "Name of the css class to apply as default overlay layout. Can be overwritten by overlay definition useing attribute overlayclass."
        };
        if (!options.overlayclass)
            this.options.overlayclass = 'swac_mediaplayer_overlay_default';

        // Load language file for mediacode
        SWAC_language.loadTranslationFile('../swac/components/Mediaplayer/langs/mediacode', 'Mediacode');

        // Internal attributes
        this.playlist = new Map();
        this.currentSlide = 0;
        // Element references of efficent accces
        this.progressElem = null;
        this.curtimeElems = null;
        this.slideshowElem = null;
        this.commentPoint = null;
        this.commentMediaId = null;
        this.comments = new Map(); // Map of comments with second as key
        this.lastoverlayclass = null; // Last used layout for overlay
    }

    init() {
        return new Promise((resolve, reject) => {
            // Note time ciritcal elements
            this.progressElem = this.requestor.querySelector('.swac_mediaplayer_progress');
            this.curtimeElems = this.requestor.querySelectorAll('.swac_mediaplayer_curtime');
            this.slideshowElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');

            // Create mediaview for each set
            for (let curSource in this.data) {
                for (let curSet of this.data[curSource]) {
                    if (curSet)
                        this.afterAddSet(curSource, curSet);
                }
            }

            // Register functions
            let prevBtn = this.requestor.querySelector('.swac_mediaplayer_prevtitleBtn');
            prevBtn.addEventListener('click', this.onClickPrevTitleBtn.bind(this));
            let nextBtn = this.requestor.querySelector('.swac_mediaplayer_nexttitleBtn');
            nextBtn.addEventListener('click', this.onClickNextTitleBtn.bind(this));
            let playBtn = this.requestor.querySelector('.swac_mediaplayer_playBtn');
            playBtn.addEventListener('click', this.togglePlay.bind(this));
            let muteButton = this.requestor.querySelector('.swac_mediaplayer_muteBtn');
            muteButton.addEventListener('click', this.toggleMute.bind(this));
            let volumeButton = this.requestor.querySelector('.swac_mediaplayer_volume');
            volumeButton.addEventListener('input', this.adjustVolume.bind(this));
            this.progressElem.addEventListener('click', this.onClickTimeline.bind(this));

            let downloadBtn = this.requestor.querySelector('.swac_mediaplayer_downloadBtn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', this.onClickDownloadBtn.bind(this));
            }
            let playListEntries = this.requestor.querySelectorAll('.swac_mediapalyer_playlistentry');
            for (let curPlayListEntry of playListEntries) {
                curPlayListEntry.addEventListener('click', this.onClickPlaylistEntry.bind(this));
            }

            this.slideshowElem.addEventListener('itemshow', this.startSlide.bind(this));

            // Add comment function or hide comment elements
            if (this.options.commentRequestor) {
                let commentBtn = this.requestor.querySelector('.swac_mediaplayer_commentbutton');
                let commentField = this.requestor.querySelector('[name="media_comment"]');
                if (commentBtn) {
                    commentField.addEventListener('click', this.onEnterCommentField.bind(this));
                    commentBtn.addEventListener('click', this.onComment.bind(this));
                }
            } else {
                let commentArea = this.requestor.querySelector('.swac_mediaplayer_commentarea');
                if (commentArea)
                    commentArea.classList.add('swac_dontdisplay');
            }

            // Add function for continue button in overlay
            let closeoverlayBtn = this.requestor.querySelector('.swac_mediaplayer_closeoverlay');
            if (closeoverlayBtn) {
                closeoverlayBtn.addEventListener('click', this.closeOverlay.bind(this));
            }

            resolve();
        });
    }

    afterAddSet(fromName, set) {
        let setId = set.id;
        // If set is an alternative for another use the setId of the alternative
        if (set.alternative) {
            setId = set.alternative;
            // Check if alternative is not the same
            if (set.id === set.alternative) {
                Msg.error('Mediaplayer', 'Media >' + set.id + '< references himself as alternatie.', this.requestor);
                return;
            }
        }

        // Get set area
        let setAreas = this.requestor.querySelectorAll('[swac_setname="' + fromName + '"][swac_setid="' + setId + '"]');
        let mediaAreaFound = false;
        for (let curSetArea of setAreas) {
            let mediaArea = curSetArea.querySelector('.swac_mediaplayer_media');
            if (mediaArea) {
                mediaAreaFound = true;
                let mediaCode = new Mediacode(this.data, set, this.options.pathattr, 'mimetype');
                if (!set.alternative) {
                    // Create first element for media
                    let mediaSubArea = mediaCode.getMediaElement();
                    mediaArea.appendChild(mediaSubArea);
                    // Get media element
                    let mediaElem = mediaArea.querySelector('audio, video');
                    // Get slide no
                    let slideNo = 0;
                    let slideSearchElem = curSetArea;
                    while (slideSearchElem.previousElementSibling) {
                        slideNo++;
                        slideSearchElem = slideSearchElem.previousElementSibling;
                    }
                    // Get media elems that could contain a length
                    if (mediaElem) {
                        mediaElem.setAttribute('uk-height-viewport', '');
                        let thisRef = this;
                        mediaElem.addEventListener('loadedmetadata', function () {
                            set.duration = mediaElem.duration;
                            Msg.warn('Mediaplayer', 'Added media >'
                                    + set.id + '< to playlist with duration from metadata of >'
                                    + set.duration + '< seconds.', this.requestor);
                            thisRef.playlist.set(slideNo, set);
                            // Load comments
                            thisRef.loadComments();
                            thisRef.calculateTimeline();
                        });

                    } else if (set.duration) {
                        Msg.warn('Mediaplayer', 'Added media >'
                                + set.id + '< to playlist with duration from dataset of >'
                                + set.duration + '< seconds.', this.requestor);

                        this.playlist.set(slideNo, set);
                        // Load comments
                        this.loadComments();
                        this.calculateTimeline();
                    } else {
                        Msg.warn('Mediaplayer', 'Added media >'
                                + set.id + '< to playlist with duration from '
                                + 'default option >' + this.options.defaultDuration
                                + '< seconds.', this.requestor);
                        set.duration = this.options.defaultDuration;
                        this.playlist.set(slideNo, set);
                        // Load comments
                        this.loadComments();
                        this.calculateTimeline();
                    }
                } else {
                    let mediaElem = mediaArea.querySelector('audio, video');
                    // Add alternative for media
                    mediaCode.createMediaSource(mediaElem);
                    // Hide original slide
                    let hideAreas = this.requestor.querySelectorAll('[swac_setname="' + fromName + '"][swac_setid="' + set.id + '"]');
                    for (let curHideArea of hideAreas) {
                        curHideArea.parentElement.removeChild(curHideArea);
                    }
                }
            }
        }

        if (!mediaAreaFound) {
            Msg.error(
                    'Mediaplayer',
                    'Mediaarea >.swac_mediaplayer_media< could not be found for set >'
                    + fromName + '[' + set.id + ']<',
                    this.requestor);
        }
    }

    /**
     * Calculates the timeline and displays it.
     * 
     * @returns {undefined}
     */
    calculateTimeline() {
        // Get sum of length
        let lengthSum = 0;
        for (let [key, set] of this.playlist) {
            lengthSum += set.duration;
        }
        let cssrule = 'background: linear-gradient(to right, ';
        let endSec = 0;
        let endPos = 0;
        let colors = ['white', 'black'];
        let i = 0;
        let sortedPlaylist = new Map([...this.playlist.entries()].sort());
        for (let [key, set] of sortedPlaylist) {
            // Set the startpoint to the last endpoint
            set.startsec = Math.round(endSec);
            if (i > 0) {
                cssrule += ', ';
            }
            cssrule += colors[i % 2] + ' ';
            if (endPos > 0) {
                cssrule += endPos + '% ';
            }
            // Get endposition of track in seconds
            endSec = endSec + set.duration;
            // Calculate new endpos
            endPos = Math.round((endSec / lengthSum) * 100);
            cssrule += endPos + '% ';
            i++;
        }
        cssrule += ');';
        // Add style for different browsers
        if ('MozBoxSizing' in document.body.style) {
            this.requestor.swac_view.addCSSRule("input[class='swac_mediaplayer_progress']::-moz-range-track", cssrule);
        } else if (window.chrome) {
            this.requestor.swac_view.addCSSRule("input[class='swac_mediaplayer_progress']::-webkit-slider-runnable-track", cssrule);
        } else {
            this.requestor.swac_view.addCSSRule("input[class='swac_mediaplayer_progress']::-ms-track", cssrule);
        }

        let lengthString = this.formatSecondsToReadable(lengthSum);
        // Output sum of length
        let wholeTimeElems = this.requestor.querySelectorAll('.swac_mediaplayer_wholetime');
        for (let curWholeTimeelem of wholeTimeElems) {
            curWholeTimeelem.innerHTML = lengthString;
        }
        // Set current play position
        for (let curTimeElem of this.curtimeElems) {
            curTimeElem.innerHTML = '0:00';
        }
        // Set max time value
        this.progressElem.setAttribute('max', lengthSum);
    }

    /**
     * Formats a time given in seconds to a more human readable format
     * 
     * @param {Double} seconds Seconds
     * @returns {String}
     */
    formatSecondsToReadable(seconds) {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds - (minutes * 60);
        let remseconds = Math.round(remainingSeconds);
        if (remseconds < 10) {
            remseconds = '0' + remseconds;
        }
        return minutes + ':' + remseconds;
    }

    /**
     * Starts or pauses the play
     * 
     * @param {DOMEvent} evt Event htat is requestion the start or pause, maybe null
     * @returns {undefined}
     */
    togglePlay(evt) {
        if (evt)
            evt.preventDefault();

        // If play is stopped start
        if (!this.interval) {
            this.startPlay();
        } else {
            // Stop play
            this.stopPlay();
        }
    }

    /**
     * Starts the playback
     * 
     * @returns {undefined}
     */
    startPlay() {
        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        // Find media element and stop if available
        let mediaElem = slider.querySelector('audio, video');
        this.interval = setInterval(this.playNextSecond.bind(this), 1000);
        if (mediaElem) {
            mediaElem.play();
        }
    }

    /**
     * Stops the playback
     * 
     * @returns {undefined}
     */
    stopPlay() {
        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        // Find media element and stop if available
        let mediaElem = slider.querySelector('audio, video');
        if (mediaElem) {
            mediaElem.pause();
        }
        clearInterval(this.interval);
        this.interval = null;
    }

    /**
     * Plays the next second of the playlist. Switches slide if neccwssery.
     * 
     * @returns {undefined}
     */
    playNextSecond() {
        let nowSecond = parseInt(this.progressElem.value) + 1;
        // Stop is actual second is beyond max
        if (nowSecond > this.progressElem.max) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.progressElem.value = nowSecond;
        let curTimeStr = this.formatSecondsToReadable(this.progressElem.value);
        for (let curCurTimeElem of this.curtimeElems) {
            curCurTimeElem.innerHTML = curTimeStr;
        }
        // Search if the slide should be changed now
        for (let [key, set] of this.playlist) {
            if (set.startsec === nowSecond) {
                // Switch slide
                let slideElem = this.slideshowElem;
                UIkit.slideshow(slideElem).show(key);
            }
        }
        // Search if there is a comment to show up
        let curComments = this.comments.get(nowSecond);
        if (curComments) {
            for (let curComment of curComments) {
                // Simple comment handling
                if (curComment.comment) {
                    UIkit.notification({
                        message: curComment.comment,
                        pos: 'top-center',
                        timeout: 5000
                    });
                } else if (curComment.media) {
                    // Stop if should stopped
                    if (curComment.stop) {
                        this.stopPlay();
                    }
                    // Register resume
                    if (curComment.resumeafter) {
                        let thisRef = this;
                        thisRef.pausetime = 0;
                        let resumeInterval = setInterval(function () {
                            thisRef.pausetime += 1;
                            if (thisRef.pausetime > curComment.resumeafter) {
                                thisRef.closeOverlay();
                                clearInterval(resumeInterval);
                            }
                        }, 1000);
                    }
                    // Open overlay content
                    this.openOverlay(this.comments.values(), curComment);
                }
            }
        }
    }

    /**
     * This method should be executed when a new slide is opend
     * 
     * @param {UIkit slide event} evt Event that is thrown when the slide is viewed
     * @returns {undefined}
     */
    startSlide(evt) {
        // Exclude template slide
        if (evt.target.hasAttribute('swac_setno')) {
            // Get current slide no
            let slideNo = 0;
            let slideNoElem = evt.target;
            while (slideNoElem.previousElementSibling) {
                slideNo++;
                slideNoElem = slideNoElem.previousElementSibling;
            }
            // Check if slide was called before
            if (this.currentSlide !== slideNo) {
                // Get previous slide
                let slidesElem = this.requestor.querySelector('.swac_mediaplayer_slideshow .uk-slideshow-items');
                // If there was a slide opend before
                if (this.currentSlide) {
                    let prvSlide = slidesElem.children[this.currentSlide];
                    let prevMediaElem = prvSlide.querySelector('audio, video');
                    if (prevMediaElem) {
                        prevMediaElem.pause();
                        prevMediaElem.currentTime = 0;
                        prevMediaElem.muted = false;
                    }
                }

                // Search mediaElem and start play
                let mediaElem = evt.target.querySelector('audio, video');

                this.currentSlide = slideNo;
                if (!this.seekposition) {
                    // Search dataset and set handler on timeline
                    let slideSet = this.playlist.get(slideNo);
                    if (slideSet)
                        this.progressElem.value = slideSet.startsec;
                } else {
                    if (mediaElem) {
                        mediaElem.currentTime = this.seekposition;
                    }
                    this.seekposition = null;
                }
                // check if in playmode
                if (this.interval) {
                    if (mediaElem) {
                        mediaElem.play();
                    }
                }
            }
        }
    }

    /**
     * Jumps to the previous title from playlist
     * 
     * @param {DOMEvent} evt Event that triggers this jump
     * @returns {undefined}
     */
    onClickPrevTitleBtn(evt) {
        evt.preventDefault();
        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        // Get sliders index
        let sliderIndex = 0;
        while (slider.previousElementSibling) {
            slider = slider.previousElementSibling;
            sliderIndex++;
        }
        UIkit.slideshow(slideElem).show(sliderIndex - 1);
    }

    /**
     * Jumps to the next title from playlist
     * 
     * @param {DOMEvent} evt Event that triggers this jump
     * @returns {undefined}
     */
    onClickNextTitleBtn(evt) {
        evt.preventDefault();
        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        // Get sliders index
        let sliderIndex = 0;
        while (slider.previousElementSibling) {
            slider = slider.previousElementSibling;
            sliderIndex++;
        }
        UIkit.slideshow(slideElem).show(sliderIndex + 1);
    }

    /**
     * Triggers the download of the file that is related to the acutal shown slide
     * 
     * @param {DOMElement} evt Click event that calls this function
     * @returns {undefined}
     */
    onClickDownloadBtn(evt) {
        evt.preventDefault();
        // Get actual slide
        let mediaArea = this.requestor.querySelector('.uk-active > .swac_mediaplayer_media');
        let mediaElems = mediaArea.querySelectorAll('audio, video, picture, img');
        let downloadLink;
        // Look at each media element
        for (let curMediaElem of mediaElems) {
            // Exclude cover medias
            if (!curMediaElem.classList.contains('swac_media_cover')) {
                // If there is an direct src
                if (curMediaElem.src) {
                    downloadLink = curMediaElem.src;
                } else {
                    // Get source elements
                    let sourceElems = curMediaElem.querySelectorAll('source');
                    for (let curSourceElem of sourceElems) {
                        //TODO deside which to download
                        downloadLink = curSourceElem.src;
                        break;
                    }
                }
                break;
            }
        }

        // Get filename
        let lastSlashPos = downloadLink.lastIndexOf('/');
        let filename = downloadLink.substring(lastSlashPos);

        // Create downloadlink and click it
        let aElem = document.createElement('a');
        aElem.setAttribute('href', downloadLink);
        aElem.setAttribute('download', filename);
        aElem.style.display = 'none';
        document.body.appendChild(aElem);
        aElem.click();
        document.body.removeChild(aElem);
    }

    /**
     * Function to execute when an playlist entry is clicked. Opens the slider 
     * belongign to the clicked media.
     * 
     * @param {DOMEvent} evt Event calling the method
     * @returns {undefined}
     */
    onClickPlaylistEntry(evt) {
        evt.preventDefault();
        let playlistEntry = evt.target;
        while (!playlistEntry.hasAttribute('swac_setid') && playlistEntry.parentElement) {
            playlistEntry = playlistEntry.parentElement;
        }
        let clickedSetId = playlistEntry.getAttribute('swac_setid');
        // Get slider
        let slider = this.slideshowElem.querySelector('[swac_setid="' + clickedSetId + '"]');

        // Get sliders index
        let sliderIndex = 0;
        while (slider.previousElementSibling) {
            slider = slider.previousElementSibling;
            sliderIndex++;
        }
        UIkit.slideshow(this.slideshowElem).show(sliderIndex);
    }

    /**
     * Executed when clicking on the timeline. Switches in the media
     * 
     * @param {DOMEvent} evt Click event on timeline
     * @returns {undefined}
     */
    onClickTimeline(evt) {
        // Find slide that should be active at this time
        let sortedPlaylist = new Map([...this.playlist.entries()].sort());

        let sliderIndex = null;
        let prevTitleLength = 0;
        let lastTitleLength = 0;
        for (let [key, set] of sortedPlaylist.entries()) {
            if (set.startsec > this.progressElem.value) {
                break;
            }
            sliderIndex = key;
            prevTitleLength += set.duration;
            lastTitleLength = set.duration;
        }
        // Subtract previous title length because the clicked time is somewhere in the title
        prevTitleLength -= lastTitleLength;
        this.seekposition = this.progressElem.value - prevTitleLength;

        // Update shown time
        let curTimeStr = this.formatSecondsToReadable(this.progressElem.value);
        for (let curCurTimeElem of this.curtimeElems) {
            curCurTimeElem.innerHTML = curTimeStr;
        }

        if (sliderIndex !== this.currentSlide) {
            UIkit.slideshow(this.slideshowElem).show(sliderIndex);
        } else {
            // Get current active slide
            let currentSlide = this.slideshowElem.querySelector('.uk-active');
            let mediaElem = currentSlide.querySelector('audio, video');
            if (mediaElem) {
                mediaElem.currentTime = this.seekposition;
            }
            this.seekposition = null;
        }
    }

    /**
     * Toggles mute of the current played media
     * 
     * @param {DOMEvent} evt Event that calls the mute toggle, can be null
     * @returns {undefined}
     */
    toggleMute(evt) {
        if (evt)
            evt.preventDefault();

        let currentSlide = this.slideshowElem.querySelector('.uk-active');
        let mediaElem = currentSlide.querySelector('audio, video');
        if (mediaElem) {
            if (mediaElem.muted) {
                mediaElem.muted = false;
            } else {
                mediaElem.muted = true;
            }
        }
    }

    /**
     * Adjusts the volume of the current media according to the slide element
     * 
     * @param {DOMEvent} evt Event that calls the adjustment
     * @returns {undefined}
     */
    adjustVolume(evt) {
        if (evt)
            evt.preventDefault();
        let volumeButton = this.requestor.querySelector('.swac_mediaplayer_volume');
        let volume = volumeButton.value / 100;
        // Adjust volume at all medias
        let mediaElems = this.requestor.querySelectorAll('audio, video');
        for (let curMediaElem of mediaElems) {
            curMediaElem.volume = volume;
        }
    }

    /**
     * Loads the comments
     * 
     * @returns {undefined}
     */
    loadComments() {
        // Delete prev loaded comments
        this.comments = new Map();
        if (!this.options.commentRequestor) {
            return;
        }
        // Load comments
        let thisRef = this;
        this.options.commentRequestor.requestor = this.requestor;
        SWAC_model.load(this.options.commentRequestor).then(
                function (result) {
                    for (let curComment of result.data) {
                        // Jump over empty sets
                        if (!curComment)
                            continue;
                        // Get media
                        let media;
                        for (let curMedia of thisRef.playlist.values()) {
                            if (curMedia.id === curComment.mediaid) {
                                media = curMedia;
                                break;
                            }
                        }
                        if (!media) {
                            Msg.warn('Mediaplayer',
                                    'Media with id >' + curComment.mediaid
                                    + '< was not found.');
                            break;
                        }
                        let showpoint = media.startsec + curComment.timepoint;
                        // Create commentlist for timepoint
                        if (!thisRef.comments.get(showpoint)) {
                            thisRef.comments.set(showpoint, []);
                        }
                        let commentlist = thisRef.comments.get(showpoint);
                        commentlist.push(curComment);
                        thisRef.comments.set(showpoint, commentlist);
                    }
                }
        ).catch(
                function (error) {
                    Msg.error('Mediaplayer', 'Could not load comments >' + error + '<');
                }
        );
    }

    /*
     * Function executet when a user clicks the comment field. Pauses the playback.
     * 
     * @param {DOMEvent} evt Event that calls the function.
     * @returns {undefined}
     */
    onEnterCommentField(evt) {
        if (evt)
            evt.preventDefault();
        this.commentPoint = this.progressElem.value;
        // Get lengths of previous titles
        // Find slide that should be active at this time
        let sortedPlaylist = new Map([...this.playlist.entries()].sort());
        let prevTitleLength = 0;
        let lastTitleLength = 0;
        for (let [key, set] of sortedPlaylist.entries()) {
            if (set.startsec > this.progressElem.value) {
                break;
            }
            prevTitleLength += set.duration;
            lastTitleLength = set.duration;
        }
        // Subtract previous title length because the clicked time is somewhere in the title
        prevTitleLength -= lastTitleLength;

        this.commentPoint = this.commentPoint - prevTitleLength;

        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        this.commentMediaId = slider.getAttribute('swac_setid');
        // If play is stopped start
        if (this.options.stopOnStartComment && this.interval) {
            // Find media element and stop if available
            let mediaElem = slider.querySelector('audio, video');
            // Stop play
            if (mediaElem) {
                mediaElem.pause();
            }
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Function to execute if the send comment button is pressed. Sends the
     * comment.
     * 
     * @param {DOMEvent} evt Event that calls the function
     * @returns {undefined}
     */
    onComment(evt) {
        evt.preventDefault();
        let commentField = this.requestor.querySelector('[name="media_comment"]');

        // Create data capsle for storing data
        let dataCapsle = {};
        dataCapsle.data = [];
        let dataset = {
            mediaid: this.commentMediaId,
            timepoint: this.commentPoint,
            comment: commentField.innerHTML
        };
        dataCapsle.data.push(dataset);
        dataCapsle.metadata = {};
        // Set target for data saveing
        dataCapsle.metadata.fromSource = SWAC_model.getSetnameFromRefernece(this.options.commentRequestor.fromName);

        // Save data with model
        SWAC_model.save(dataCapsle).then(
                function (result) {
                    commentField.innerHTML = '';
                    this.commentPoint = null;
                    this.commentMediaId = null;
                }
        ).catch(
                function (error) {

                }
        );
    }

    /**
     * Opens an overlay over the media player
     * 
     * @param {Object[]} overlaydata Array containing overlays data
     * @param {Object} overlayset Set with data about the current overlay
     * @returns {undefined}
     */
    openOverlay(overlaydata, overlayset) {
        // Get overlay element
        let overlayElem = this.requestor.querySelector('.swac_mediaplayer_overlay');
        overlayElem.classList.remove('swac_dontdisplay');
        if (overlayset.overlayclass) {
            overlayElem.classList.remove(this.options.overlayclass);
            overlayElem.classList.add(overlayset.overlayclass);
            this.lastoverlayclass = overlayset.overlayclass;
        }
        // Generate media
        let mediaCode = new Mediacode(overlaydata, overlayset, 'media', 'mimetype');
        let contElem = overlayElem.querySelector('.swac_mediaplayer_overlaymedia');
        contElem.appendChild(mediaCode.getMediaElement());
    }

    /**
     * Closes the displayed overlay
     * 
     * @param {DOMEvent} evt Event that calls this method
     * @returns {undefined}
     */
    closeOverlay(evt) {
        if (evt)
            evt.preventDefault();
        // Get overlay element
        let overlayElem = this.requestor.querySelector('.swac_mediaplayer_overlay');
        overlayElem.classList.add('swac_dontdisplay');
        if (this.lastoverlayclass)
            overlayElem.classList.remove(this.lastoverlayclass);
        overlayElem.classList.add(this.options.overlayclass);
        // Remove content
        let contElem = overlayElem.querySelector('.swac_mediaplayer_overlaymedia');
        contElem.innerHTML = '';

        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        // Find media element and stop if available
        let mediaElem = slider.querySelector('audio, video');
        // If play is stopped start
        if (!this.interval) {
            this.interval = setInterval(this.playNextSecond.bind(this), 1000);
            if (mediaElem) {
                mediaElem.play();
            }
        }
    }
}