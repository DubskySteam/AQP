import SWAC from '../../swac.js';
import View from '../../View.js';
import Msg from '../../Msg.js';

/**
 * Sample component for development of own components
 */
export default class Speech extends View {

    constructor(options = {}) {
        super(options);
        this.name = 'Speech';
        this.desc.text = 'This component allows speec input and output on supported browsers.';
        this.desc.developers = 'Florian Fehring';
        this.desc.license = '(c) by Florian Fehring';

        this.desc.templates[0] = {
            name: 'default',
            desc: 'Default template.'
        };
        this.desc.reqPerSet[0] = {
            name: 'id',
            desc: 'The attribute id is required for the component to work properly.'
        };
        this.desc.opts[0] = {
            name: 'lang',
            desc: 'Language to use.',
            example: 'en'
        };
        if (!options.lang)
            this.options.lang = null;
        this.desc.opts[1] = {
            name: 'commands',
            desc: 'A map of commands and corosponding actions.'
        };
        if (!options.commands)
            this.options.commands = new Map();
        this.desc.opts[2] = {
            name: 'pitch',
            desc: 'The pitch used for speak.'
        };
        if (!options.pitch)
            this.options.pitch = 1.0;
        this.desc.opts[3] = {
            name: 'rate',
            desc: 'The rate used for speak.'
        };
        if (!options.rate)
            this.options.rate = 1.0;
        this.desc.opts[4] = {
            name: 'startword',
            desc: 'A word that is needed to prefly commands.',
            example: 'Computer'
        };
        if (!options.startword)
            this.options.startword = null;
        this.desc.opts[5] = {
            name: 'sources',
            desc: 'Array of sources where to send spoken words to and recive an answer from.',
            example: [{
                    url: 'https://api.openai.com/v1/chat/completions',
                    auth: 'myOoepnAI authtoken',
                    method: 'POST',
                    body: '{"messages": [{"role": "user", "content": "%words%"}],"temperature": 0.6, "model": "gpt-3.5-turbo"}',
                    jpath: 'choices/0/message/content'
                }]
        };
        if (!options.sources)
            this.options.sources = [];
        if (!options.showWhenNoData)
            this.options.showWhenNoData = true;

        // Internal attributes
        this.browserlng = null;
        this.recognition = null;
        this.reco_stoped = false;
        this.synth = window.speechSynthesis;
        this.voice = null;
    }

    /*
     * This method will be called when the component is complete loaded
     * At this thime the template code is loaded, the data inserted into the
     * template and even plugins are ready to use.
     */
    init() {
        return new Promise((resolve, reject) => {
            // User browser lang if no lang defined
            if (!this.options.lang) {
                this.browserlng = navigator.language || navigator.userLanguage;
                if (!this.browserlng.includes('-')) {
                    this.browserlng = this.browserlng + '-' + this.browserlng.toUpperCase();
                }
                if (this.options.lang && !this.options.lang.includes('-')) {
                    this.options.lang = this.options.lang + '-' + this.options.lang.toUpperCase();
                }
            }

            // Build speech recognition
            this.startRecognition();
            // Build speech synth
            let voices = this.synth.getVoices();
            for (let curVoice of voices) {
                if (curVoice.lang === this.options.lang) {
                    this.voice = curVoice;
                }
            }
            if (!this.voice) {
                Msg.view('Speech', window.swac.lang.dict.Speech.nooutput, this.requestor, 'warn');
            }

            resolve();
        });
    }

    /**
     * Method thats called before adding a dataset
     * This overrides the method from View.js
     *
     * @param {Object} set Object with attributes to add
     * @returns {Object} (modified) set
     */
    beforeAddSet(set) {
        // You can check or transform the dataset here
        return set;
    }

    afterAddSet(set, repeateds) {
        return;
    }

    /**
     * Start the recoginition
     */
    startRecognition() {
        // Check browser support
        let SpeechRecognition;
        let SpeechGrammarList;
        let SpeechRecognitionEvent;
        if (SpeechRecognition) {
            SpeechRecognition = SpeechRecognition;
            SpeechGrammarList = SpeechGrammarList;
            SpeechRecognitionEvent = SpeechRecognitionEvent;
        } else if (typeof webkitSpeechRecognition !== 'undefined') {
            SpeechRecognition = webkitSpeechRecognition;
            SpeechGrammarList = webkitSpeechGrammarList;
            SpeechRecognitionEvent = webkitSpeechRecognitionEvent;
        } else {
            Msg.view('Speech', window.swac.lang.dict.Speech.nosupportrecognition, this.requestor, 'error');
            return;
        }

        // Get commands for language
        let commands = this.options.commands[this.options.lang];

        let cmdwords = [this.options.startword];
        if (commands) {
            for (let curWord of Object.keys(commands)) {
                cmdwords.push(curWord);
            }
        }
        let grammar = '#JSGF V1.0; grammar colors; public <color> = ' + cmdwords.join(' | ') + ' ;'
        this.recognition = new SpeechRecognition();
        // Add gramar
        let speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);

        // Setting recognition options
        this.recognition.grammars = speechRecognitionList;
        this.recognition.continuous = true;
        this.recognition.lang = this.options.lang;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        this.recognition.start();
        Msg.flow('Speech', window.swac.lang.dict.Speech.recognitionstarted, this.requestor);

        // Register event handlers
        this.recognition.onresult = this.recogOnresult.bind(this);
        this.recognition.onspeechend = this.recogOnspeechend.bind(this);
        this.recognition.onnomatch = this.regocOnnomatch.bind(this);
        this.recognition.onerror = this.recogOnerror.bind(this);
    }

    async recogOnresult(event) {
        let words = event.results[event.results.length - 1][0].transcript;
        console.log('Result received: ' + words + '.');
        console.log('Confidence: ' + event.results[0][0].confidence);

        if (this.options.startword && !words.startsWith(this.options.startword))
            return;

        const cmdwords = words.replace(this.options.startword, '').replace('.', '').toLowerCase().trim();
        // Search commands
        let command;
        if (this.options?.commands[this.options.lang])
            command = this.options.commands[this.options.lang][cmdwords];
        let done = 0;
        // Search commands at components
        if (!command) {
            let comps = document.querySelectorAll('[swa]');
            for (let curComp of comps) {
                let res = curComp.swac_comp.speechCommand(cmdwords);
                if (res) {
                    this.speak(res);
                    done++;
                }
            }
        }
        if (this.reco_stoped) {
            if (command.startlistening) {
                this.reco_stoped = false;
                this.speak(window.swac.lang.dict.Speech.startlistening);
            }
        } else {
            // Command unknown
            if (!command && done === 0) {
                let answer = await this.requestSources(cmdwords);
                if (answer) {
                    var regex = /((http|https|ftp):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?)/g;
                    var results = answer.match(regex);

                    console.log('urls: ', results);

                    this.speak(answer);
                } else {
                    // Say that it is not recognised
                    let txt = window.swac.lang.dict.Speech.noreco;
                    txt = window.swac.lang.replacePlaceholders(txt, 'word', cmdwords);
                    this.speak(txt);
                }
                return;
            }

            if (command.speak) {
                this.speak(command.speak);
                done++;
            }
            if (command.execute) {
                command.execute(cmdwords);
                done++;
            }
            if (command.stoplistening) {
                this.reco_stoped = true;
            }
            if (done === 0) {
                this.speak(window.swac.lang.dict.Speech.notask);
            }
        }
    }

    async requestSources(words) {
        if (this.options.sources.length < 1) {
            Msg.info('Speech', 'There are no sources for speech detection registered.', this.requestor);
        }

        // Try send to sources
        for (let curSource of this.options.sources) {
            const opts = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            if (curSource.auth)
                opts.headers['Authorization'] = curSource.auth;
            if (curSource.method === 'POST') {
                opts.method = 'POST',
                        opts.body = curSource.body.replace('%words%', words)
            }
            const response = await fetch(curSource.url, opts);
            if (response.status >= 200 && response.status < 400) {
                const jsonData = await response.json();
                if (curSource.jpath) {
                    let jsonPath = curSource.jpath.replace(/^\/|\/$/g, '');
                    let val = jsonData;
                    for (let curPath of jsonPath.split('/')) {
                        // Check if curPath is index number
                        if (Array.isArray(val)) {
                            curPath = parseInt(curPath);
                        }
                        val = val[curPath];
                    }
                    return val;
                }
            } else {
                Msg.error('Speech', 'Error getting answer from >' + curSource.url + '<: ' + response.statusText);
            }
        }
    }

    recogOnspeechend() {
        // Go on listening
        if (!this.isSpeaking) {
            this.startRecognition();
        } else {
            console.log('do not restart reco computer is talking...');
        }
    }

    regocOnnomatch(event) {
        console.log('I didnt recognize that color.');
    }

    recogOnerror(event) {
        console.log('Error occurred in recognition: ' + event.error);
        console.log(event);
    }

    /**
     * Speaks the words if available
     * 
     * @param {String} words Words to speak
     */
    speak(words) {
        if (!this.voice) {
            Msg.warn('Speech', 'Speak is not available because there is no voice.', this.requestor);
        }
        console.log('speaking: ' + words);
        this.isSpeaking = true;
        this.recognition.stop();
        var utterThis = new SpeechSynthesisUtterance(words);
        utterThis.voice = this.voice;
        utterThis.pitch = this.options.pitch;
        utterThis.rate = this.options.rate;
        let res = this.synth.speak(utterThis);
        utterThis.onboundary = this.speakOnboundary.bind(this);
        utterThis.onend = this.speakOnend.bind(this);
        utterThis.onerror = this.speakOnerror.bind(this);
        utterThis.onmark = this.speakOnmark.bind(this);
        utterThis.onpause = this.speakOnpause.bind(this);
        utterThis.onresume = this.speakOnresume.bind(this);
        utterThis.onstart = this.speakOnstart.bind(this);
        console.log('test', res);
    }

    speakOnboundary(evt) {
        console.log('on boundary');
        console.log(evt);
    }

    speakOnend(evt) {
        console.log('on end');
        console.log(evt);
        this.isSpeaking = false;
        this.startRecognition();
    }

    speakOnerror(evt) {
        console.log('on error');
        console.log(evt);
    }

    speakOnmark(evt) {
        console.log('on mark');
        console.log(evt);
    }

    speakOnpause(evt) {
        console.log('on pause');
        console.log(evt);
    }

    speakOnresume(evt) {
        console.log('on resume');
        console.log(evt);
    }

    speakOnstart(evt) {
        console.log('on start');
        console.log(evt);
    }
}


