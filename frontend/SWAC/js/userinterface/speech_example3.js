var speech_example3_options = {
    lang: 'de-DE',
	startword: 'Computer',
	    commands: {
        'de-DE': {
            'rede': {
                speak: 'Hallo'
            },
            'zeige': {
                execute: function() { window.alert('Hallo!');}
            }
        },
        'en-EN': {
            'say': {
                speak: 'Hello'
            },
            'show': {
                execute: function() { window.alert('Hello!');}
            }
        }
    }
};