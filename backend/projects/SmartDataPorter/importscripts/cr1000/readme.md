# Datenlogger für die CR1000 Station
Die CR1000 Station sammelt Daten zu Einstrahlungen, wie direkt- und diffus-Strahlung.

Die Station wurde betrieben vom 12.02.2014 bis zum 28.09.2017 (basierend auf den vorhandenen Rohdateien)

## Import Ablauf
Das Skript ruft die Daten von der Station ab und läd sie auf den Import-Server herunter.
Von dort aus müssen die Daten mitels eines Importer importiert werden.

## Import-Configuration

Die Import-Konfiguration für den SmartDataPorter befindet sich in diesem Verzeichnis.

Hinweise:
- FlagMs7-Dateien wurden nicht importiert
- Es hat den Anschein das die Importe teilweise falsch gelaufen sind, 
da sich die Inhalte der Dateien nicht auf die Tabellen matchen lassen.
Oft gibt es Datensätze wo nur ein Teil der Spalten gefüllt ist. Vermutlich
wurden Daten mal in die eine, mal in die andere Tabelle importiert.
- Die obige Konfiguration importiert die Daten je Datei in eine Tabelle, 
nicht wie es in den vorhandenen Importen ist.

## Testfälle

Ein Testfall für den Importer exisitert im SmartDataPorterTestClient