# Datenlogger für Ertragswerte und Einstrahlung vom FH Dach (Campus Minden)
Die Ertragswerte und Einstrahlungsdaten werden über sunsniffer-Sensoren bezogen.
Es befindet sich ein Sunsniffer Gateway im Wechselrichterraum, die Daten von diesem 
werden mittels RaspyberryPi abgegriffen.
Das Skript ist auf dem RaspberryPi installiert.

Das Skript befindet sich mit im Repositori:
http://git04-ifm-min.ad.fh-bielefeld.de/forschung/pvdaten/Masterarbeit

Der Datenabruf erfolgt seit dem 07.05.2021.

## Import Ablauf
Das Skript ruft die Daten vom Datenverzeichnis des DWD ab und läd sie auf den Import-Server herunter.
Von dort aus müssen die Daten mitels eines Importer importiert werden.

## Import-Configuration

Die Import-Konfiguration für den SmartDataPorter befindet sich in diesem Verzeichnis.

## Testfälle

Es existiert noch kein Testfall