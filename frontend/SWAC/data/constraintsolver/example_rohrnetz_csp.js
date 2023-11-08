var example_rohrnetz_csp = [
    {
        col: 'Rohr',
        source: 'rohr',
        desc: '',
        typ: 'Rohr',
        avail: true,
        din: ['10217', '10220', '10255'],
        durchmesser: ['DN32', 'DN40', 'DN50', 'DN65', 'DN80', 'DN100', 'DN125', 'DN150', 'DN200', 'DN250', 'DN300', '1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"'],
        abgeklebt: [true, false],
        abschluss_links: ['Sägeschnitt'], // Hier nur die Möglichkeit, die sich nicht aus den combinations ergibt (ist aber auch kein Problem hier alle aufzulisten)
        abschluss_rechts: ['Sägeschnitt'],
        beschichtung: ['grundiert (Handarbeit)', 'Pulverbeschichtung', 'Lakierung'], // Muss nicht angegeben werden, da in den combinations enthalten, soll aber auch nicht schaden
        combinations: [
            {
                // Constraints 1.1 und 1.3
                laenge: [{min: 50, max: 7800}],
                beschichtung: ['Pulverbeschichtung']
            },
            {
                // Constraint 1.2
                laenge: [{min: 50, max: 7800}, {min: 50, max: 10500}],
                beschichtung: ['grundiert (Handarbeit)', 'Lakierung']
            },
            {
                beschichtung: ['grundiert (Handarbeit)', 'Lakierung'],
                farbe: ['1x rot-braun', '2x rot-braun', '1x grau', '2x grau', 'RAL3000', 'RAL9006 (grau)', 'RAL9002 (weiß)']
            },
            {
                beschichtung: ['Pulverbeschichtung', 'Lakierung'],
                farbe: ['RAL3000', 'RAL9006 (grau)', 'RAL9002 (weiß)']
            },
            {
                abschluss_links: ['Nut'],
                durchmesser: ['DN32', 'DN40', 'DN50', 'DN65', 'DN80', 'DN100', 'DN125', 'DN150', 'DN200', 'DN250', 'DN300']
            },
            {
                abschluss_rechts: ['Nut'],
                durchmesser: ['DN32', 'DN40', 'DN50', 'DN65', 'DN80', 'DN100', 'DN125', 'DN150', 'DN200', 'DN250', 'DN300']
            },
            {
                abschluss_links: ['Gewinde'],
                durchmesser: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"']
            },
            {
                abschluss_rechts: ['Gewinde'],
                durchmesser: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"']
            },
            {
                abschluss_links: ['Endboden, geschweißt'],
                durchmesser: ['DN32', 'DN40', 'DN50', 'DN65', 'DN80', 'DN100', 'DN125', 'DN150', 'DN200', 'DN250', 'DN300']
            },
            {
                abschluss_rechts: ['Endboden, geschweißt'],
                durchmesser: ['DN32', 'DN40', 'DN50', 'DN65', 'DN80', 'DN100', 'DN125', 'DN150', 'DN200', 'DN250', 'DN300']
            },
            {
                abschluss_links: ['Gewinde-Kappe Nr. 300, n. GF-Katalog'],
                durchmesser: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"']
            },
            {
                abschluss_rechts: ['Gewinde-Kappe Nr. 300, n. GF-Katalog'],
                durchmesser: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"']
            }
        ]
    },
    {
        col: 'Verbindung Rohr-Abgang',
        typ: 'Connection',
        desc: '',
        avail: true,
        parent: [{typ: 'Rohr'}],
        child: [{typ: 'Abgang'}],
        functions: [
            // Constraint 3.2
            {
                vars: ['parent.durchmesser','child.durchmesser'],
                func: function (rohr, abgang) {
                    return abgang.durchmesser <= rohr.durchmesser;
                }
            },
            // Constraint 3.3
            {
                vars: ['parent.posx','child.posx'],
                func: function (rohr, abgang) {
                    if (rohr.posx + rohr.length > (abgang.posx + abgang.durchmesser / 2 + 100))
                        return false;
                    if (rohr.posx < (abgang.posx - abgang.durchmesser / 2 - 100))
                        return false;
                }
            },
            // Constraint 3.4
            {
                vars: ['parent.posx','child.posx'],
                func: function (rohr, abgang) {
                    if (rohr.nextSibling(abgang).posx > (abgang.posx + abgang.durchmesser / 2 + 100))
                        return false;
                    if (rohr.prevSibling(abgang).posx < (abgang.posx - abgang.durchmesser / 2 - 100))
                        return false;
                }
            },
            // Constraint 3.5
            {
                vars: ['parent.posx','child.posx'],
                func: function (rohr, abgang) {
                    if (rohr.nextSibling(abgang).posx > (abgang.posx + 40000))
                        alert('Warnung: Sprinkler sollten nicht weiter als 4m außeinander liegen');
                    if (rohr.prevSibling(abgang).posx < (abgang.posx + 40000))
                        alert('Warnung: Sprinkler sollten nicht weiter als 4m außeinander liegen');
                    return true;
                }
            }
        ]
    },
    {
        col: 'Schweissmuffe',
        source: 'anbauteile',
        typ: 'Abgang',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Sägeschnitt', 'Nut', 'Gewinde'],
        anschluss: ['geschweisst'],
        durchmesser: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"'],
        // Constraint 2.3
        laenge: [{min: 0, max: 30}]
    },
    {
        col: 'Spezialschweissmuffe',
        source: 'anbauteile',
        typ: 'Abgang',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Sägeschnitt', 'Nut', 'Gewinde'],
        anschluss: ['geschweisst'],
        durchmesser: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"'],
        laenge: [{min: 0, max: 3000}]
    },
    {
        col: 'Nutstutzen',
        source: 'anbauteile',
        typ: 'Abgang',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Nut'],
        anschluss: ['geschweisst'],
        durchmesser: ['DN32', 'DN40', 'DN50', 'DN65', 'DN80', 'DN100', 'DN125', 'DN150', 'DN200', 'DN250'],
        // Constraints 2.1 und 2.2
        laenge: [{min: 75, max: 150}]
    },
    {
        col: 'Anbohrschelle mit Nut-Abgang',
        source: 'anbauteile',
        typ: 'Abgang',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Nut'],
        anschluss: ['geklemmt'],
        durchmesser: ['DN32', 'DN40', 'DN50', 'DN65']
    },
    {
        col: 'Anbohrschelle mit Gewinde-Abgang',
        source: 'anbauteile',
        typ: 'Abgang',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Gewinde'],
        anschluss: ['geklemmt'],
        durchmesser: ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"']
    },
    {
        col: 'Verbindung zwischen Rohren und Anbauteilen',
        typ: 'Verbindung',
        desc: '',
        avail: true,
        parent: [{typ: 'Rohr'}],
        child: [{typ: 'Anbauteile'}],
        functions: [
            // Constraint 3.1
            {
                vars: ['parent.durchmesser','child.durchmesser'],
                func: function (rohr, anbauteil) {
                    if (anbauteil.istAmEndeVon(rohr) || anbauteil.istAmAnfangVon(rohr))
                        return anbauteil.durchmesser === rohr.durchmesser;
                    else
                        return anbauteil.durchmesser <= rohr.durchmesser;
                }
            }
        ]
    },
    {
        col: 'Schweissreduzierung (konzentrisch)',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Sägeschnitt', 'Nut', 'Gewinde'],
        anschluss: ['geschweisst'],
        durchmesser: ['DN300-DN250', 'DN300-DN200', 'DN250-DN200', 'DN250-DN150',
            'DN200-DN125', 'DN150-DN125', 'DN150-DN100', 'DN125-DN100',
            'DN125-DN80', 'DN100-DN80', 'DN100-DN65', 'DN80-DN65', 'DN80-DN50',
            'DN65-DN50', 'DN65-DN40', 'DN50-DN40', 'DN50-DN32',
            'DN250-DN300', 'DN200-DN300', 'DN200-DN250', 'DN150-DN250',
            'DN125-DN200', 'DN125-DN150', 'DN100-DN150', 'DN100-DN125',
            'DN80-DN125', 'DN80-DN100', 'DN65-DN100', 'DN65-DN80', 'DN50-DN80',
            'DN65-DN50', 'DN40-DN65', 'DN40-DN50', 'DN32-DN50']
    },
    {
        col: 'Schweissreduzierung (exzentrisch)',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Sägeschnitt', 'Nut', 'Gewinde'],
        anschluss: ['geschweisst'],
        durchmesser: ['DN300-DN250', 'DN300-DN200', 'DN250-DN200', 'DN250-DN150',
            'DN200-DN125', 'DN150-DN125', 'DN150-DN100', 'DN125-DN100',
            'DN125-DN80', 'DN100-DN80', 'DN100-DN65', 'DN80-DN65', 'DN80-DN50',
            'DN65-DN50', 'DN65-DN40', 'DN50-DN40', 'DN50-DN32',
            'DN250-DN300', 'DN200-DN300', 'DN200-DN250', 'DN150-DN250',
            'DN125-DN200', 'DN125-DN150', 'DN100-DN150', 'DN100-DN125',
            'DN80-DN125', 'DN80-DN100', 'DN65-DN100', 'DN65-DN80', 'DN50-DN80',
            'DN65-DN50', 'DN40-DN65', 'DN40-DN50', 'DN32-DN50']
    },
    {
        col: 'Schweissbogen 90° (3s, normaler Radius mit Nutende L=100mm)',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschlussi: ['Nut'],
        anschluss: ['geschweisst'],
        durchmesser: ['DN300', 'DN250', 'DN200', 'DN150', 'DN125', 'DN100', 'DN80', 'DN65', 'DN50', 'DN40', 'DN32']
    },
    {
        col: 'Schweissbogen 45° (3s, normaler Radius mit Nutende L=100mm)',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Nut'],
        anschluss: ['geschweisst'],
        durchmesser: ['DN300', 'DN250', 'DN200', 'DN150', 'DN125', 'DN100', 'DN80', 'DN65', 'DN50', 'DN40', 'DN32']
    },
    {
        col: 'Schweissbogen 33° (3s, normaler Radius mit Nutende L=100mm)',
        source: 'anbauteile',
        typ: 'Anbauteile',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Nut'],
        anschluss: ['geschweisst'],
        durchmesser: ['DN300', 'DN250', 'DN200', 'DN150', 'DN125', 'DN10', 'DN80', 'DN65', 'DN50', 'DN40', 'DN32']
    },
    {
        col: 'Schweissbogen 90° (3s, normaler Radius ohne Nutende)',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Sägeschnitt'],
        anschluss: ['geschweisst'],
        durchmesser: ['DN300', 'DN250', 'DN200', 'DN150', 'DN125', 'DN100', 'DN80', 'DN65', 'DN50', 'DN40', 'DN32']
    },
    {
        col: 'Schweissbogen 45° (3s, normaler Radius ohne Nutende)',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Sägeschnitt'],
        anschluss: ['geschweisst'],
        durchmesser: ['DN300', 'DN250', 'DN200', 'DN150', 'DN125', 'DN100', 'DN80', 'DN65', 'DN50', 'DN40', 'DN32']
    },
    {
        col: 'Schweissbogen 33° (3s, normaler Radius ohne Nutende)',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Sägeschnitt'],
        anschluss: ['geschweisst'],
        durchmesser: ['DN300', 'DN250', 'DN200', 'DN150', 'DN125', 'DN100', 'DN80', 'DN65', 'DN50', 'DN40', 'DN32']
    },
    {
        col: 'Gewinde-Reduzierungen (Muffenverbindung Gewinde innen-innen)',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Gewinde'],
        anschluss: ['Gewinde'],
        durchmesser: ['3"-2 1/2"', '2 1/2"-2"', '2 1/2"-1 1/2"', '2"-1 1/4"',
            '1 1/2"-1 1/4"', '1 1/2"-1"', '1"-3/4"', '1"-1/2"', '3/4"-1/2"',
            '2 1/2"-3"', '2"-2 1/2"', '1 1/2"-2"', '1 1/4"2"', '1 1/2"-1 1/2"',
            '1"-1 1/2"', '3/4"-1"', '1/2"-1"', '1/2"-4/4"']
    },
    {
        col: 'Gewinde-Winkel 90° (innen-innen Nr.90 n. GF-Katalog)',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Gewinde'],
        anschluss: ['Gewinde'],
        durchmesser: ['3"', '2 1/2"', '2"', '1 1/2"', '1 1/4"', '1"', '3/4"', '1/2"']
    },
    {
        col: 'Gewinde-Winkel 90° (innen-innen Nr.92 n. GF-Katalog)',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        winkel: [{min: 0, max: 360}],
        abschluss: ['Gewinde'],
        anschluss: ['Gewinde'],
        durchmesser: ['3"', '2 1/2"', '2"', '1 1/2"', '1 1/4"', '1"', '3/4"', '1/2"']
    },
    {
        col: 'Nutstück',
        source: 'anbauteile',
        typ: 'Anbauteil',
        desc: '',
        avail: true,
        laenge: [{min: 100, max: 100}],
        winkel: [{min: 0, max: 360}],
        abschluss: ['Nut'],
        anschluss: ['Geschweisst'],
        durchmesser: ['3"', '2 1/2"', '2"', '1 1/2"', '1 1/4"', '1"', '3/4"', '1/2"',
            'DN300', 'DN250', 'DN200', 'DN150', 'DN125', 'DN100', 'DN80', 'DN65', 'DN50', 'DN40', 'DN32']
    },
    {
        col: 'Verbindung zweier Positionen',
        source: 'rohr_rohr',
        typ: 'Connection',
        desc: '',
        avail: true,
        parent: [{typ: 'Rohr'}],
        child: [{typ: 'Rohr'}],
        functions: [
            // Constraint 5.1
            {
                vars: ['parent.durchmesser','child.durchmesser'],
                func: function (rohr_a, rohr_b) {
                    return rohr_a.durchmesser === rohr_b.durchmesser;
                }
            },
            // Constraint 5.2
            {
                vars: ['parent.beschichtung','child.beschichtung'],
                func: function (rohr_a, rohr_b) {
                    return rohr_a.beschichtung === rohr_b.beschichtung;
                }
            },
            // Constraint 5.3.
            {
                vars: ['parent.farbe','child.farbe'],
                func: function (rohr_a, rohr_b) {
                    return rohr_a.farbe === rohr_b.farbe;
                }
            }
        ]
    }
];
// Constraint 4.1 wird durch Verzicht auf die Auswahlmöglichkeit der Farbe garantiert