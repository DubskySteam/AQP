var explaincomponent_options = {
    componentName: 'Contentin'
};

var contentin_example1_options = {
    sourcedefs: [
        {
            id: 1,
            urls: ["https://de.wiktionary.org/wiki/extrahiere","https://de.wiktionary.org/wiki/extrahieren"],
            data: [
                {
                    name: "type",
                    csspath: 'a[title="Hilfe:Wortart"]',
                    type: "plaintext"
                },
                {
                    name: "syl",
                    csspath: 'p[title="Trennungsmöglichkeiten am Zeilenumbruch"] + dl',
                    type: "plaintext"
                },
                {
                    name: "syn",
                    csspath: 'p[title="bedeutungsgleich gebrauchte Wörter"] + dl',
                    type: "plaintext"
                }
            ]
        }
    ]
};