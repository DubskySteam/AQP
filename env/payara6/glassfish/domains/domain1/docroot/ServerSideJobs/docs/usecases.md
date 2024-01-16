# Use Cases
## Hauptprogramm:

### Nutzer:
* Als Nutzer möchte ich vorhandene Jobs übersichtlich angezeigt bekommen, damit ich schnell sehen kann welche Jobs aktiv sind.
* Als Nutzer möchte ich vorhandene Jobs leicht neu konfigurieren können, um Zeit zu sparen.
* Als Nutzer möchte ich eingestellten Jobs eigene Namen geben können, damit ich eine gewisse Übersicht habe.
* Als Nutzer möchte ich wissen, welche Jobs gerade laufen, um Unstimmigkeiten schnell zu erkennen.
* Als Nutzer möchte ich einen Überblick über vorherige Ausführungen von einem Job haben, damit ich nicht erst durch die kompletten Logs gehen muss.
* Als Nutzer möchte ich das Ergebnis eines Programmes wissen (auch wenn es lief während ich nicht mit dem Server verbunden war), damit ich weiß das ob der Job funktioniert.
* Als Nutzer möchte ich Jobs verketten können, um auf das Ergebnis eines Jobs automatisch zu reagieren.
* Als Nutzer möchte ich Jobs beenden können, um schneller auf Fehler zu reagieren.
* Als Nutzer möchte ich in der Übersicht ein Failure sehen, wenn ein ungesehener Fehler in der History vorhanden ist, um mir schnell einen Überblick zu verschaffen.
* Als Nutzer möchte ich Fehler als gesehen markieren, damit Sie mir nicht weiter angezeigt werden.

### Entwickler:
* Als Entwickler möchte ich keine neue UI programmieren müssen für jeden neuen Job, damit ich mich auf das programmieren von Jobs konzentrieren kann.
* Als Entwickler möchte ich eine gute Dokumentation haben, damit ich einfach das Programm erweitern kann.
* Als Entwickler möchte ich neue Jobs hinzufügen können ohne mir vorher den gesamten Code anzusehen, damit ich schneller Jobs programmieren kann.
* Als Entwickler möchte ich Test für die Schnittstelle bekommen, damit ich meine Erweiterungen nicht immer erst deployen muss um zu merken, dass da ein Fehler drin ist.


## Unterprogramme:
### Ping einer Internetadresse:
* Als Nutzer möchte ich beliebige Domains oder IP-Adressen pingen können, damit ich erkenne kann ob ein Service noch läuft.
* Als Nutzer möchte ich über alle Ergebnisse informiert werden, damit ich Fehler in der Verbindung leichter finde.


### Aufrufen eines anderen Programms:
* Als Nutzer möchte ich nach dem Ausführen eines Programmes wissen, ob es erfolgreich lief oder ein Fehler auftrat, damit ich gegensteuern kann wenn ein Programm Fehler produziert.
* Als Nutzer möchte ich alle Rückgaben in einer Datei gesammelt haben, um Sie (automatisch) zu dokumentieren und ggf. zu vergleichen.


### E-Mail versand:
* Als Nutzer möchte ich angenehm E-Mails versenden können, damit ich nicht jedes mal extra mein E-Mail Programm öffnen muss.
* Als Nutzer möchte ich beim Versenden von E-Mails relevante Dateien wie z.B. die Ergebnisse eines vorherigen Jobs einfach anhängen können, um einen umständlichen Download und Re-Upload zu vermeiden.
* Als Nutzer möchte ich automatisch eine Email bekommen wenn ein bestimmter Job fehl schlägt, damit ich darauf reagieren kann.


### Docker:
* Als Nutzer möchte ich wissen, welche Docker-Container gerade laufen.
* Als Nutzer möchte ich Docker Container starten.


### Aufrufen einer REST-Schnittstelle:
* Als Nutzer möchte ich Datein automatisch runterladen können, um mir das manuelle runterladen zu sparen.
* Als Nutzer möchte ich einstellen können welche HTTP Statie als success oder failure gewertet werden, damit ich entscheiden kann wann z.B. eine Weiterleitung in Ordnung ist und wann nicht.
* Als Nutzer möchte ich nicht darauf warten müssen, das ein REST-Job abgeschlossen ist, bevor ich einen neuen starten kann, um unnötige Wartezeiten zu minimieren.
* Als Nutzer möchte ich einen Timeout für jeden Job einzeln einstellen können, damit auch länger andauernden Jobs nicht einfach so in einen Timeout laufen.
* Als Nutzer möchte ich einen generellen Timeout festlegen, der immer dann greift, wenn kein Timeout für den Job eingestellt wurde, damit ich schneller auf vermehrte Timeouts reagieren kann.