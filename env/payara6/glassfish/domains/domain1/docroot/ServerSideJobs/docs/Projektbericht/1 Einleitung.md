# Einleitung

Wir haben uns im Modul Web Engineering mit dem Projekt ServerSideJobs befasst.
Dabei geht es um eine Administrierungsoberfläche für wiederkehrende Aufgaben/
Programme nachfolgend auch Jobs genannt. Die Idee dahinter war es, eine
Alternative zu den systemeigenen Cronjobs darzustellen.

Aktuell werden in den Forschungsprojekten des IFE viele Daten aus
unterschiedlichen Datenquellen gesammelt. Teilweise werden diese von Programmen
in Datenbanken importiert und teilweise über eine REST-Schnittstelle empfangen.
Das Anstoßen der Importer-Programme erfolgt dabei oft über System-Cronjobs.

Cronjobs sind eine einfache Möglichkeit, um Programme immer wieder zu einer
festen Zeit auszuführen.

Sobald man aber zusätzliche Funktionalitäten haben möchte, z. B. will man beim
Fehlschlag informiert werden, dann muss man immer ein Skript schreiben, dass
die Funktionalität hat.

Hier setzt unser Projekt an. Es vereinfacht die Administration genau solcher
Aufgaben. Dabei unterstützen wir die Verkettung von Jobs. Dadurch kann man auf
Fehlschläge von Jobs reagieren und z. B. einen Administrator per E-Mail
informieren. Aber auch im Erfolgsfall kann man einen zweiten Job nutzen, um mit
den Daten aus dem ersten Job zu arbeiten. Somit kann man Daten im ersten Job
verarbeiten und Sie dann im zweiten Job in eine Datenbank speichern.

Ein weiterer großer Aspekt auf den wir großen Wert gelegt haben ist, dass unser
Programm später leicht von einem anderen Entwickler erweitert werden kann. Er
soll sich nicht erst durch den Code der anderen Jobs durcharbeiten müssen um zu
verstehen, wie die Kommunikation funktioniert. Er kann auf definierte
Schnittstellen setzten und kann sich dadurch auf seine eigentliche Aufgabe
konzentrieren.

Vorher musste man durch die einzelnen Log Dateien der Skripte gehen, falls es
überhaupt welche gab, um Fehler in der Ausführung zu finden. Bei uns werden die
Fehler zentral in einem Log gesichert und zur einfachen Übersicht dargestellt.

