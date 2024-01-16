var speech_example1_options = {
    lang: 'de-DE',
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