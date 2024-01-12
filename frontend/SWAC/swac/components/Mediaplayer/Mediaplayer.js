/**
 * This component is NOT opensource.
 * Copyright by Florian Fehring
 * 
 * @type type
 */

import SWAC from '../../swac.js';
import View from '../../View.js';
import Msg from '../../Msg.js';
import Model from '../../Model.js';
import Mediacode from './Mediacode.js';

export default class Mediaplayer extends View {

    constructor(options = {}) {
        super(options);
        this.name = 'Mediaplayer';
        this.desc.text = 'The Mediaplayer component creates a view for media files with direct play, download and information possibilities.';
        this.desc.developers = 'Florian Fehring';
        this.desc.license = '(c) by Florian Fehring';

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
        this.desc.reqPerTpl[2] = {
            selc: '.swac_mediaplayer_prevtitleBtn',
            desc: 'Button to jump to previous title'
        }
        this.desc.reqPerTpl[3] = {
            selc: '.swac_mediaplayer_nexttitleBtn',
            desc: 'Button to jump to next title'
        }
        this.desc.reqPerTpl[4] = {
            selc: '.swac_mediaplayer_playBtn',
            desc: 'Button to start playback'
        }
        this.desc.reqPerTpl[5] = {
            selc: '.swac_mediaplayer_muteBtn',
            desc: 'Button to mute output'
        }
        this.desc.reqPerTpl[6] = {
            selc: '.swac_mediaplayer_volume',
            desc: 'Button to adjust volume'
        }

        this.desc.optPerTpl[0] = {
            selc: '.swac_mediaplayer_fullscreen',
            desc: 'Button to enter fullsceen mode'
        };
        this.desc.optPerTpl[1] = {
            selc: '.swac_mediaplayer_progress',
            desc: 'Elemt to show progress of playback'
        }
        this.desc.optPerTpl[2] = {
            selc: '.swac_mediaplayer_slideshow',
            desc: 'Element where the slideshow resides'
        }
        this.desc.optPerTpl[3] = {
            selc: '.swac_mediaplayer_titleoverlay',
            desc: 'Element to lay over the media. Contains additional information'
        }
        this.desc.optPerTpl[4] = {
            selc: '.swac_mediaplayer_removefromlist',
            desc: 'Element that removes the media where it belongs to from playlist'
        }

        this.desc.reqPerSet[0] = {
            name: 'id',
            desc: 'Dataset id for finding associated files'
        };
        this.desc.reqPerSet[1] = {
            name: 'title',
            desc: 'Title for the media file'
        };
        this.desc.reqPerSet[2] = {
            name: 'path',
            desc: 'Path to media file, absolute or relative'
        };
        this.desc.reqPerSet[3] = {
            name: 'mimetype',
            desc: 'Media files mimetype (e.g. audio/mp3, video/mp4, ...)'
        };

        this.desc.optPerSet[0] = {
            name: 'preview',
            desc: 'Path to a preview file.'
        };
        this.desc.optPerSet[1] = {
            name: 'artist',
            desc: 'Medias artist name'
        };
        this.desc.optPerSet[2] = {
            name: 'album',
            desc: 'Medias album'
        };
        this.desc.optPerSet[3] = {
            name: 'license',
            desc: 'Medias license'
        };
        this.desc.optPerSet[4] = {
            name: 'startonkey',
            desc: 'A key on that the media should start'
        };
        this.desc.optPerSet[5] = {
            name: 'stoponkey',
            desc: 'A key on that the media should stop'
        };
        this.desc.optPerSet[6] = {
            name: 'autoplay',
            desc: 'Automatic start playback if slide comes in view'
        };
        this.desc.optPerSet[7] = {
            name: 'autostop',
            desc: 'Automatic stop playback if media is on its end'
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

        this.desc.opts[5] = {
            name: "showFullScreenButton",
            desc: "If true a button for go into fullscreen is shown."
        };
        if (!options.showFullScreenButton)
            this.options.showFullScreenButton = true;

        this.desc.opts[6] = {
            name: "showTitles",
            desc: "If true the media titles are shown as overlay on the media"
        };
        if (!options.showTitles)
            this.options.showTitles = false;

        this.desc.opts[7] = {
            name: 'allowDel',
            desc: 'If true tracks can be deleted from list.'
        };
        if (!options.allowDel)
            this.options.allowDel = false;

        this.desc.opts[8] = {
            name: 'customAfterRemoveSet',
            desc: 'Function to execute after a set was removed. Becomes fromName and setid'
        };
        if (!this.options.customAfterRemoveSet)
            this.options.customAfterRemoveSet = null;

        this.desc.opts[9] = {
            name: 'allowSave',
            desc: 'If true allows to save changes to the dataset.'
        };
        if (!options.allowSave)
            this.options.allowSave = false;

        this.desc.opts[10] = {
            name: 'mediaBasePath',
            desc: 'Base path where to find media files'
        };
        if (!options.mediaBasePath)
            this.options.mediaBasePath = null;

        this.desc.opts[11] = {
            name: 'titleLinkBase',
            desc: 'Base path where to find more information about the title'
        };
        if (!options.titleLinkBase)
            this.options.titleLinkBase = null;

        this.desc.opts[12] = {
            name: 'titleDownload',
            desc: 'If true title download is alowed'
        };
        if (typeof options.titleDownload === 'undefined')
            this.options.titleDownload = true;

        this.desc.opts[13] = {
            name: 'titleDownloadBase',
            desc: 'Base path to a title download page'
        };
        if (!options.titleDownloadBase)
            this.options.titleDownloadBase = null;

        // Load language file for mediacode
        SWAC.lang.loadTranslationFile('../swac/components/Mediaplayer/langs/mediacode', 'Mediacode');

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
        this.isfullscreen = false;
        this.keystartmedias = new Map();
        this.keystopmedias = new Map();
    }

    init() {
        return new Promise((resolve, reject) => {
            // Note time ciritcal elements
            this.progressElem = this.requestor.querySelector('.swac_mediaplayer_progress');
            this.curtimeElems = this.requestor.querySelectorAll('.swac_mediaplayer_curtime');
            this.slideshowElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');

            // Register functions
            let fullBtn = this.requestor.querySelector('.swac_mediaplayer_fullscreen');
            if (!fullBtn) {
                // Function deactivated nothing todo
            } else if (this.options.showFullScreenButton) {
                fullBtn.addEventListener('click', this.onClickFullBtn.bind(this));
            } else {
                fullBtn.remove();
            }
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
            if (this.progressElem)
                this.progressElem.addEventListener('click', this.onClickTimeline.bind(this));

            // Key control
            document.addEventListener("keydown", this.onKeydown.bind(this));
            let downloadBtn = this.requestor.querySelector('.swac_mediaplayer_downloadBtn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', this.onClickDownloadBtn.bind(this));
            }

            if (this.slideshowElem)
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

            // Add function for save playlist
            let saveBtns = this.requestor.querySelectorAll('.swac_mediaplayer_save');
            if (this.options.allowSave) {
                for (let curBtn of saveBtns) {
                    curBtn.addEventListener('click', this.saveData.bind(this));
                }
            } else {
                for (let curBtn of saveBtns) {
                    curBtn.classList.add('swac_dontdisplay');
                }
            }

            let thisRef = this;
            // Add control over mediaAPI
            const actionHandlers = [
                ['play', (evt) => {
                        evt.preventDefault();
                        thisRef.startPlay()
                    }],
                ['pause', (evt) => {
                        evt.preventDefault();
                        thisRef.stopPlay();
                    }],
                ['previoustrack', (evt) => {
                        evt.preventDefault();
                        thisRef.playPrevTitle()
                    }],
                ['nexttrack', (evt) => {
                        evt.preventDefault();
                        thisRef.playNextTitle()
                    }],
                ['stop', (evt) => {
                        evt.preventDefault();
                        thisRef.stopPlay()
                    }],
//                ['seekbackward',  (details) => { /* ... */ }],
//                ['seekforward',   (details) => { /* ... */ }],
//                ['seekto',        (details) => { /* ... */ }],
                /* Presenting slides actions */
                ['previousslide', () => {
                        thisRef.playPrevTitle()
                    }],
                ['nextslide', () => {
                        thisRef.playNextTitle()
                    }],
            ];

            for (const [action, handler] of actionHandlers) {
                try {
                    navigator.mediaSession.setActionHandler(action, handler);
                } catch (error) {
                    console.log(`The media session action "${action}" is not supported yet.`);
                }
            }

            resolve();
        });
    }

    //Inheritted
    afterAddSet(set, repeateds) {
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
        let setAreas = this.requestor.querySelectorAll('[swac_fromname="' + set.swac_fromName + '"][swac_setid="' + setId + '"]');
        let mediaAreaFound = false;
        for (let curSetArea of setAreas) {
            let titlelinkElem = curSetArea.querySelector('.swac_mediaplayer_info');
            if (this.options.titleLinkBase && titlelinkElem) {
                let aText = SWAC.lang.dict.Mediaplayer.titlepage;
                let aElem = document.createElement('a');
                aElem.href = this.options.titleLinkBase + set.id;
                aElem.setAttribute('swac_lang', 'Mediaplayer.titlepage');
                aElem.innerHTML = aText;
                aElem.target = 'titlepage';
                aElem.onclick = function (e) {
                    e.stopPropagation()
                };
                titlelinkElem.appendChild(aElem);
            }

            let basepath = this.options.mediaBasePath;
            let path = set[this.options.pathattr];
            // Use absolute path if given
            if (path.startsWith('/') || path.startsWith('http') || path.startsWith('.') || path.startsWith('data:'))
                basepath = '';
            else if (!this.options.mediaBasePath) {
                // Use path of index file as root if no basepath is set
                let lastslash = set.swac_fromName.lastIndexOf('/');
                basepath = set.swac_fromName.substring(0, lastslash) + '/';
            }
            let titleDownloadLink = curSetArea.querySelector('.swac_mediaplayer_title_download');
            if (!this.options.titleDownload && titleDownloadLink) {
                titleDownloadLink.style = 'display:none;';
            } else if (this.options.titleDownloadBase && titleDownloadLink) {
                // Call download page
                if (!titleDownloadLink.hasGoToDownload) {
                    titleDownloadLink.hasGoToDownload = true;
                    let thisRef = this;
                    titleDownloadLink.addEventListener('click', function (evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        window.open(thisRef.options.titleDownloadBase + set.id);
                    });
                }
            } else if (titleDownloadLink) {
                // Direct download link
                titleDownloadLink.href = basepath + set.path;
                titleDownloadLink.setAttribute('download', set.title);
                if (!titleDownloadLink.hasGoToDownload) {
                    titleDownloadLink.hasGoToDownload = true;
                    titleDownloadLink.addEventListener('click', function (evt) {
                        evt.stopPropagation();
                    });
                }
            }

            let mediaArea = curSetArea.querySelector('.swac_mediaplayer_media');
            if (mediaArea) {
                let slideArea = curSetArea;
                mediaAreaFound = true;

                let mediaCode = new Mediacode(this.data, set, this.options.pathattr, 'mimetype', basepath);
                if (!set.alternative && !set.startonkey && !set.stoponkey) {
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
                    // Show first slide
                    if (slideNo === 1) {
                        let thisRef = this;
                        setTimeout(function () {
                            let slideElem = thisRef.requestor.querySelector('.swac_mediaplayer_slideshow');
                            let t = UIkit.slideshow(slideElem).show(1);
                        }, 1000);
                    }
                    // Hide title overlay
                    if (!this.options.showTitles) {
                        let titleoverlay = slideArea.querySelector('.swac_mediaplayer_titleoverlay');
                        if (titleoverlay)
                            titleoverlay.classList.add('swac_dontdisplay');
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
                } else if (set.alternative) {
                    let mediaElem = mediaArea.querySelector('audio, video');
                    // Add alternative for media
                    mediaCode.createMediaSource(mediaElem);
                    // Hide original slide
                    let hideAreas = this.requestor.querySelectorAll('[swac_fromname="' + set.swac_fromName + '"][swac_setid="' + set.id + '"]');
                    for (let curHideArea of hideAreas) {
                        curHideArea.parentElement.removeChild(curHideArea);
                    }
                } else {
                    let keymediaArea = this.requestor.querySelector('.swac_mediaplayer_keymedias');
                    let keymediaRepeat = keymediaArea.querySelector('.swac_repeatForKeymedia').cloneNode(true);
                    keymediaRepeat.classList.remove('swac_repeatForKeymedia');
                    keymediaRepeat.classList.add('swac_repeatedForKeymedia');
                    keymediaArea.appendChild(keymediaRepeat);
                    let keymediacard = keymediaRepeat.querySelector('.swac_mediaplayer_keymediacard');
                    let keymediakey = keymediaRepeat.querySelector('.swac_mediaplayer_keymediakey');
                    keymediakey.innerHTML = set.startonkey;
                    if (set.stoponkey)
                        keymediakey.innerHTML += '-' + set.stoponkey;
                    let keymediatitle = keymediaRepeat.querySelector('.swac_mediaplyer_keymediatitle');
                    keymediatitle.innerHTML = set.title;
                    let keymediadesc = keymediaRepeat.querySelector('.swac_mediaplayer_desc');
                    keymediadesc.innerHTML = set.desc;

                    if (set.mimetype.includes('audio')) {
                        let audioElem = document.createElement('audio');
                        audioElem.setAttribute('id', 'keymedia_' + set.id);
                        audioElem.setAttribute('controls', 'controls');
                        let sourceElem = document.createElement('source');
                        sourceElem.setAttribute('src', basepath + set.path);
                        sourceElem.setAttribute('type', set.mimetype);
                        audioElem.appendChild(sourceElem);
                        keymediacard.appendChild(audioElem);
                        // Add to key list
                        if (set.startonkey) {
                            if (!this.keystartmedias.has(set.startonkey)) {
                                this.keystartmedias.set(set.startonkey, []);
                            }
                            this.keystartmedias.get(set.startonkey).push(set);
                        }
                        if (set.stoponkey) {
                            if (!this.keystopmedias.has(set.stoponkey)) {
                                this.keystopmedias.set(set.stoponkey, []);
                            }
                            this.keystopmedias.get(set.stoponkey).push(set);
                        }
                    }
                }
            }
            // Add event listener for media list
            if (!set.alternative && curSetArea.classList.contains('swac_mediapalyer_playlistentry')) {
                curSetArea.addEventListener('click', this.onClickPlaylistEntry.bind(this));
                let removeElem = curSetArea.querySelector('.swac_mediaplayer_removefromlist');
                if (removeElem) {
                    if (this.options.allowDel) {
                        removeElem.addEventListener('click', this.onClickRemove.bind(this));
                    } else {
                        removeElem.classList.add('swac_dontdisplay');
                    }
                }
            }
        }

        if (!mediaAreaFound) {
            Msg.error(
                    'Mediaplayer',
                    'Mediaarea >.swac_mediaplayer_media< could not be found for set >'
                    + set.swac_fromName + '[' + set.id + ']<',
                    this.requestor);
        }
    }

    afterRemoveSet(fromName, setid) {
        // Search playlist entry for remove
        let found = false;
        for (let curEntry of this.playlist.entries()) {
            let curId = curEntry[0];
            let curVal = curEntry[1];
            if (curVal.id === setid && curVal.swac_fromName === fromName) {
                this.playlist.delete(curId);
                found = true;
            }
        }
        // Return if media is not available
        if (!found)
            return;

        this.calculateTimeline();
        // Reset to first entry
        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        let firstSlide = slideElem.querySelector('.swac_repeatedForSet');
        firstSlide.classList.add('uk-active');
        // Reset time
        this.progressElem.value = 0;
        if (this.options.customAfterRemoveSet) {
            this.options.customAfterRemoveSet(fromName, setid);
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
        let sortedPlaylist = new Map([...this.playlist.entries()].sort((a, b) => parseInt(a) - parseInt(b)));
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
        // Disable old sheet
        for (let i = 0; i < document.styleSheets.length; i++) {
            let curSheet = document.styleSheets[i];
            if (!curSheet.href) {
                if (curSheet.cssRules[0] && curSheet.cssRules[0].cssText.includes('swac_mediaplayer_progress')) {
//                    console.log('disable sheet:',document.styleSheets[i].cssRules[0].cssText);
                    document.styleSheets[i].disabled = true;
                }
            }
        }

        // Add style for different browsers
        if ('MozBoxSizing' in document.body.style) {
            this.addCSSRule("input[class='swac_mediaplayer_progress']::-moz-range-track", cssrule);
        } else if (window.chrome) {
            this.addCSSRule("input[class='swac_mediaplayer_progress']::-webkit-slider-runnable-track", cssrule);
        } else {
            this.addCSSRule("input[class='swac_mediaplayer_progress']::-ms-track", cssrule);
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
        let mediaElem;
        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        // Find media element and stop if available
        mediaElem = slider.querySelector('audio, video');
        if (!this.interval)
            this.interval = setInterval(this.playNextSecond.bind(this), 1000);
        if (mediaElem) {
            if (slider.swac_dataset.fadein && mediaElem.currentTime === 0) {
                this.fadein(mediaElem, slider.swac_dataset.fadein);
            } else {
                try {
                    mediaElem.play();
                } catch (e) {
                    Msg.error('Mediaplayer','Error while start playing: ' + e, this.requestor);
                }
            }
        }
        let setid = slider.getAttribute('swac_setid');
        let playElem = this.requestor.querySelector('.swac_mediaplayer_playing');
        if (playElem)
            playElem.classList.remove('swac_mediaplayer_playing');
        let playlistElem = this.requestor.querySelector('#swac_mediaplayer_playlist [swac_setid="' + setid + '"]');
        playlistElem.classList.add('swac_mediaplayer_playing');

        // Change icon and description of play buttons
        let playBtns = this.requestor.querySelectorAll('.swac_mediaplayer_playBtn');
        for (let curPlayBtn of playBtns) {
            curPlayBtn.setAttribute('uk-icon', 'ban');
            curPlayBtn.setAttribute('uk-tooltip', SWAC.lang.dict.Mediaplayer.pause);
        }
        // Update media metadata
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: slider.swac_dataset.title,
                artist: slider.swac_dataset.artist,
                album: slider.swac_dataset.album,
                artwork: [
                    {src: slider.swac_dataset.image, sizes: 'any', type: 'image/jpg'},
                ]
            });
            navigator.mediaSession.playbackState = 'playing';
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
        // Change icon and description of play buttons
        let playBtns = this.requestor.querySelectorAll('.swac_mediaplayer_playBtn');
        for (let curPlayBtn of playBtns) {
            curPlayBtn.setAttribute('uk-icon', 'play');
            curPlayBtn.setAttribute('uk-tooltip', SWAC.lang.dict.Mediaplayer.play);
        }

        // Update media metadata
        if ("mediaSession" in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    }

    /**
     * Starts / restarts the playback with fadein effect
     * 
     * @returns {undefined}
     */
    fadeinPlay() {
        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        // Find media element and stop if available
        let mediaElem = slider.querySelector('audio, video');
        if (!this.interval)
            this.interval = setInterval(this.playNextSecond.bind(this), 1000);
        if (mediaElem) {
            if (slider.swac_dataset.fadein) {
                this.fadein(mediaElem, slider.swac_dataset.fadein);
            } else {
                mediaElem.play();
            }
        }
    }

    /**
     * Stops the playback
     * 
     * @returns {undefined}
     */
    fadeoutPlay() {
        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        // Find media element and stop if available
        let mediaElem = slider.querySelector('audio, video');
        if (mediaElem) {
            if (slider.swac_dataset.fadeout) {
                let thisRef = this;
                this.fadeout(mediaElem, slider.swac_dataset.fadeout);
                setTimeout(function () {
                    clearInterval(thisRef.interval);
                    thisRef.interval = null;
                    thisRef.playNextTitle();
                }, slider.swac_dataset.fadeout * 1000);
            } else {
                mediaElem.pause();
                clearInterval(this.interval);
                this.interval = null;
                this.playNextTitle();
            }
        }
    }

    /**
     * Plays the next second of the playlist. Switches slide if neccwssery.
     * 
     * @returns {undefined}
     */
    playNextSecond() {
        let nowSecond = parseInt(this.progressElem.value) + 1;
        // Stop if actual second is beyond max
        if (nowSecond > this.progressElem.max) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.progressElem.value = nowSecond;
        let curTimeStr = this.formatSecondsToReadable(this.progressElem.value);
        for (let curCurTimeElem of this.curtimeElems) {
            curCurTimeElem.innerHTML = curTimeStr;
        }
        // Get slides element
        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        let curset = slider.swac_dataset;
        // Search if the slide should be changed now
        for (let [key, set] of this.playlist) {
            if (curset.autostop && set.startsec === nowSecond) {
                this.stopPlay();
            } else if (set.startsec === nowSecond) {
                // Switch slide
                let slideElem = this.slideshowElem;
                UIkit.slideshow(slideElem).show(key);
                // Remove old playing marker
                let playElem = this.requestor.querySelector('.swac_mediaplayer_playing');
                if (playElem)
                    playElem.classList.remove('swac_mediaplayer_playing');
                // Mark playlist entry
                let playlistElem = this.requestor.querySelector('#swac_mediaplayer_playlist [swac_setid="' + set.id + '"]');
                playlistElem.classList.add('swac_mediaplayer_playing');
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
        if (evt.target.hasAttribute('swac_setid')) {
            let set = evt.target.swac_dataset;
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
                    if (prvSlide) {
                        let prevMediaElem = prvSlide.querySelector('audio, video');
                        if (prevMediaElem) {
                            prevMediaElem.pause();
                            prevMediaElem.currentTime = 0;
                            prevMediaElem.muted = false;
                        }
                    }
                }

                // Search mediaElem and start play
                let mediaElem = evt.target.querySelector('audio, video');

                this.currentSlide = slideNo;
                if (!this.seekposition) {
                    if (set)
                        this.progressElem.value = set.startsec;
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
    }

    /**
     * Jump to prev title
     */
    playPrevTitle() {
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
        this.playNextTitle();
    }

    /**
     * Jump to next title
     */
    playNextTitle() {
        let slideElem = this.requestor.querySelector('.swac_mediaplayer_slideshow');
        // Get actual slide
        let slider = slideElem.querySelector('.uk-active');
        // Stop playback if should be stopped after slide
        if (slider.swac_dataset.autostop)
            this.stopPlay();
        // Get sliders index
        let sliderIndex = 0;
        while (slider.previousElementSibling) {
            slider = slider.previousElementSibling;
            sliderIndex++;
        }
        let thisRef = this;
        let slideProm = UIkit.slideshow(slideElem).show(sliderIndex + 1);
        slideProm.then(function () {
            slider = slideElem.querySelector('.uk-active');
            // Autoplay if intended
            if (slider.swac_dataset?.autoplay) {
                thisRef.startPlay();
            }
            // If next slider is for a title that should be started on key move forward
            if (slider.swac_dataset && slider.swac_dataset.startonkey) {
                thisRef.playNextTitle();
            }
        });
    }

    /**
     * Called when clicking the remove media button in a playlist. Removes the 
     * medie from playlist and playback.
     * 
     * @param {DOMEvent} evt Event that calls the method
     */
    onClickRemove(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        // Stop playback
        this.stopPlay();
        let repElem = this.findRepeatedForSet(evt.target);
        this.removeSet(repElem.getAttribute('swac_fromname'), repElem.getAttribute('swac_setid'));
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
        let playElem = this.requestor.querySelector('.swac_mediaplayer_playing');
        if (playElem)
            playElem.classList.remove('swac_mediaplayer_playing');
        let playlistEntry = evt.target;
        while (!playlistEntry.hasAttribute('swac_setid') && playlistEntry.parentElement) {
            playlistEntry = playlistEntry.parentElement;
        }
        playlistEntry.classList.add('swac_mediaplayer_playing');
        let clickedSetId = playlistEntry.getAttribute('swac_setid');
        // Get slider
        let slider = this.slideshowElem.querySelector('[swac_setid="' + clickedSetId + '"]');
        // Get sliders index
        let sliderIndex = 0;
        while (slider.previousElementSibling) {
            slider = slider.previousElementSibling;
            sliderIndex++;
        }
        let t = UIkit.slideshow(this.slideshowElem).show(sliderIndex);
        // When now slide change return
        if (!t) {
            if (!this.interval) {
                this.startPlay();
            }
            return;
        }
        let thisRef = this;
        t.then(function () {
            if (!thisRef.interval) {
                thisRef.startPlay();
            }
        });
    }

    /**
     * Executed when clicking on the timeline. Switches in the media
     * 
     * @param {DOMEvent} evt Click event on timeline
     * @returns {undefined}
     */
    onClickTimeline(evt) {
        // Find slide that should be active at this time
        let sortedPlaylist = new Map([...this.playlist.entries()].sort((a, b) => parseInt(a) - parseInt(b)));

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
     * When the fullscreen button is clicked
     */
    onClickFullBtn(evt) {
        evt.preventDefault();
        let playerElem = this.requestor; //.querySelector('.swac_mediaplayer_container');
        if (playerElem.requestFullscreen) {
            playerElem.requestFullscreen();
        } else if (playerElem.webkitRequestFullscreen) { /* Safari */
            playerElem.webkitRequestFullscreen();
        } else if (playerElem.msRequestFullscreen) { /* IE11 */
            playerElem.msRequestFullscreen();
        }
        let prevElem = this.requestor.querySelector('[uk-slidenav-previous]');
        prevElem.classList.add('swac_dontdisplay');
        prevElem.setAttribute('style', 'display: none;');
        let nextElem = this.requestor.querySelector('[uk-slidenav-next]');
        nextElem.classList.add('swac_dontdisplay');
        nextElem.setAttribute('style', 'display: none;');
        document.addEventListener('fullscreenchange', this.onFullscreenchange.bind(this), false);
        document.addEventListener('MSFullscreenChange', this.onFullscreenchange.bind(this), false);
    }

    /**
     * When fullscreen mode is left
     */
    onFullscreenchange(evt) {
        if (this.isfullscreen) {
            let prevElem = this.requestor.querySelector('[uk-slidenav-previous]');
            prevElem.classList.remove('swac_dontdisplay');
            prevElem.setAttribute('style', 'display: block;');
            let nextElem = this.requestor.querySelector('[uk-slidenav-next]');
            nextElem.classList.remove('swac_dontdisplay');
            nextElem.setAttribute('style', 'display: block;');
            this.isfullscreen = false;
        } else {
            this.isfullscreen = true;
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
     * Starts the media and fades in
     * 
     * @param {DOMElement} mediaElem Media element that should be faded out
     * @param {int} seconds Seconds to fade out
     */
    fadein(mediaElem, seconds) {
        mediaElem.play();
        mediaElem.volume = 0;
        let fadepercentage = (100 / seconds / 4) / 100;
        let fadeintval = setInterval(function () {
            mediaElem.volume += fadepercentage;
        }, 250);
        setTimeout(function () {
            clearInterval(fadeintval);
        }, seconds * 1000);
    }

    /**
     * Fades the media out and jumps to next title
     * 
     * @param {DOMElement} media Media element that should be faded out
     * @param {int} seconds Seconds to fade out
     */
    fadeout(mediaElem, seconds) {
        let fadepercentage = (100 / seconds / 4) / 100;
        let fadeouttval = setInterval(function () {
            if (mediaElem.volume - fadepercentage > 0)
                mediaElem.volume -= fadepercentage;
            else {
                clearInterval(fadeouttval);
                mediaElem.pause();
            }
        }, 250);
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
        Model.load(this.options.commentRequestor).then(
                function (data) {
                    for (let curComment of data) {
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
        let sortedPlaylist = new Map([...this.playlist.entries()].sort((a, b) => parseInt(a) - parseInt(b)));
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
        let dataCapsle = {
            data: [],
            fromName: Model.getSetnameFromRefernece(this.options.commentRequestor.fromName)
        };
        let dataset = {
            mediaid: this.commentMediaId,
            timepoint: this.commentPoint,
            comment: commentField.innerHTML
        };
        dataCapsle.data.push(dataset);

        // Save data with model
        Model.save(dataCapsle).then(function (dataCaps) {
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

    /**
     * Performed when a key was pressed.
     */
    onKeydown(evt) {
        evt.preventDefault();
        // When space pressed start play (keycode 166: Play button from pointer)
        if (evt.keyCode === 32 || evt.keyCode === 116) {
            // If play is stopped start
            if (!this.interval) {
                this.startPlay();
            } else {
                // Stop play
                this.stopPlay();
            }
            // Keycode: 87 white screen button from pointer
        } else if (evt.keyCode === 37 || evt.keyCode === 87) {
            // Jump to prev title
            this.playPrevTitle();
            // Keycode 66: black screen button from pointer)
        } else if (evt.keyCode === 39 || evt.keyCode === 66) {
            // Jump to next title
            this.playNextTitle();
        } else if (evt.keyCode === 38) {
            // Fade in
            this.fadeinPlay();
            // Keycode: 69: Erease button from pointer
        } else if (evt.keyCode === 40 || evt.keyCode === 69) {
            // Fade out
            this.fadeoutPlay();
        } else if (evt.keyCode === 27) {
            this.onClickFullBtn(evt);
        } else {
            let char = String.fromCharCode(evt.keyCode);
            Msg.warn('Mediaplayer', 'Unknown keycode >' + evt.keyCode + '< char (' + char + ') pressed.', this.requestor);
            // Get medias to start
            let startms = this.keystartmedias.get(char);
            if (startms) {
                for (let curSet of startms) {
                    let curElem = this.requestor.querySelector('#keymedia_' + curSet.id);
                    if (!curElem)
                        Msg.error('Mediaplayer', 'Could not find keymedia for >' + curSet.swac_fromName + '[' + curSet.id + ']<', this.requestor);
                    if (curSet.fadein) {
                        this.fadein(curElem, curSet.fadein);
                    } else {
                        curElem.play();
                    }
                }
            }

            // Get medias to stop
            let stopms = this.keystopmedias.get(char);
            if (stopms) {
                for (let curSet of stopms) {
                    let curElem = this.requestor.querySelector('#keymedia_' + curSet.id);
                    if (!curElem)
                        Msg.error('Mediaplayer', 'Could not find keymedia for >' + curSet.swac_fromName + '[' + curSet.id + ']<', this.requestor);
                    if (curSet.fadeout) {
                        this.fadeout(curElem, curSet.fadeout);
                    } else {
                        curElem.pause();
                    }
                }
            }
        }
    }
}