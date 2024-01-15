# Code-Ausschnitte

## Job-Controller

Der Job-Controller hat die Methode `scheduleJob()`, um einen Job zu
schedulen. Diese wird vom Job-Controller selbst
ausgeführt, wenn ein Job hinzugefügt wird bzw. um einen Job erneut zu
schedulen (siehe Z. 18). In der Methode wird die ermittelt, wann der Job
das nächste mal ausgeführt werden soll, und dann entsprechend mittels
eines `Timer`s gescheduled. Der Code im Timer ist nur 5 Zeilen lang (und
enthält keine langen Methodenaufrufe), damit der Timer nicht blockiert
wird, daher findet das eigentliche Ausführen des Jobs in einem eigenen
Thread statt.

```java
protected synchronized void scheduleJob(JobStruct job) {
    if (job == null) {
        return;
    }
    if (job.getJob().endTime() != null && job.getJob().endTime().after(new Date())) {
        return;
    }
    long nextTime = IntervalHelpers.nextTime(job.getJob().interval(), job.getJob().startTime(), job.getJob().endTime());
    if (nextTime < 0) {
        return;
    }
    timer.schedule(new RescheduleTimerTask(job) {
        @Override
        public void run() {
            if (!job.getJob().isCanceled()) {
                JobRunner runner = new JobRunner(job);
                runner.start();
                JobController.getInstance().scheduleJob(this.jobStruct);
            }
        }
    }, nextTime);
}
```

Der Job-Controller bietet die Methode `scheduleJobOnce()` an, um einen
Job manuell zu starten.

## Job-Runner

Der Job-Runner erbt von `Thread`, dementsprechend wird der Job in der
`run()`-Methode ausgeführt. Damit eine Job-Instanz nicht 2 mal gleichzeitig
ausgeführt wird, muss der Job-Runner zunächst eine Ausführung mit
`requestRun()` beantragen. Falls das gelingt, wird eine Timer gestartet, um den
Job nach dessen Timeout abzubrechen (falls der Job kein Timeout hat, wird auch
kein Timer gestartet). Danach kommt die eigentliche Ausführung vom Job: Dessen
`run()`-Methode wird aufgerufen und das Ergebnis gespeichert und anschließend
in die Datenbank geschrieben. Da der Job jetzt erneut ausgeführt werden könnte,
wird das dem `JobStruct` mit `registerFinished()` mitgeteilt. Als Letztes wird,
falls vorhanden, der nächste Job ausgeführt, welcher die Parameter vom
vorherigen erhält. Die Ausführung des nächsten Jobs passiert im gleichen
Thread, indem erneut die `run()`-Methode vom Job-Runner aufgerufen wird.

```java
public void run() {
    if (jobStruct.requestRun(this)) {
        if (jobStruct.getJob().hasTimeout() && jobStruct.getJob().getTimeout() > 0) {
            timer = new Timer();
            timer.schedule(new TimerTask() {
                @Override
                public void run() {
                    jobStruct.getJob().abort();
                    Log newLog = new Log(new Date(), jobStruct.getJob(), false, "Aborted job: timeout");
                    DBHandler.getInstance().writeLog(newLog);
                }
            }, jobStruct.getJob().getTimeout());
        }
        JobResult result = jobStruct.getJob().run();
        jobStruct.registerFinished(this);
        if (timer != null) {
            timer.cancel();
            timer = null;
        }
        DBHandler.getInstance().writeResult(result, jobStruct.getJob().id, jobStruct.getJob().getName());
        Job nextJob;
        if (result.hasSucceded()) {
            nextJob = jobStruct.getJob().nextOnSuccess();
        } else {
            nextJob = jobStruct.getJob().nextOnFailure();
        }
        if (nextJob != null) {
            nextJob.setParametersFromJob(result.getParams());
            this.jobStruct = JobController.getInstance().getStructForJob(nextJob);
            this.run();
        }
    }
}
```

## Job-Struct

Mit dem `JobStruct` wird sichergestellt, dass eine Job-Instanz nur einmal
gleichzeitig läuft. Dazu hat `JobStruct` die Methoden `requestRun()` und
`registerFinished()`. Damit es zu keinen Problemen trotz Multithreading kommt,
sind beide `synchronized`. Beim `JobStruct` kann so eine Ausführung vom Job
beantragt werden. Damit das `JobStruct` weiß, dass ein Job erneut ausgeführt
werden kann, ist die `registerFinished()` notwendig. Als zusätzliche Sicherheit
merkt sich `JobStruct`, wer eine Ausführung beantragt hat.

```java
public synchronized boolean requestRun(JobRunner requester) {
    if (!isRunning) {
        isRunning = true;
        this.requester = requester;
        return true;
    } else {
        return false;
    }
}
```

```java
public synchronized void registerFinished(JobRunner requester) {
    if (this.requester != null && requester.equals(this.requester)) {
        isRunning = false;
    }
}
```

## Ping-Job

Der Ping-Job benutzt die Java-Standard-Methode `isReachable()`, um einen Host
zu pingen. Da diese nur ICMP benutzt, wenn die JVM das Recht dazu hat (z. B. wenn
die JVM mit Administrator-Rechten läuft) und ansonsten TCP benutzt, wird auf
den `ping`-Befehl zurückgegriffen sollte `isReachable()` fehlschlagen. So wird
sichergestellt, dass der Ping-Job den Erwartungen entspricht und nicht etwa
fehlschlägt, obwohl der Host auf ICMP-Pakete antworten würde. Je nach
Betriebssystem verhält sich der `ping`-Befehl anders, unter Windows wird `-n`
und unter Linux `-c` für die Anzahl der Pakete benutzt.

```java
InetAddress inetAddress = InetAddress.getByName(address);
int pingTimeout = (int) ((this.hasTimeout())? this.timeout : DEFAULT_TIMEOUT);
pingSuccess = inetAddress.isReachable(pingTimeout);
if (pingSuccess) {
    status = 0;
    return new JobResult(true, "Successfully pinged " + address + ".");
}
if (status == 3) {
    status = 0;
    return new JobResult(false, "Aborted by user.");
}
Runtime runtime = Runtime.getRuntime();
Process process;
if (System.getProperty("os.name").toLowerCase().contains("win")) {
    process = runtime.exec("ping -n 1 \"" + address + "\"");
} else {
    process = runtime.exec("ping -c 1 \"" + address + "\"");
}
```

## Command-Job

Wie beim Ping-Job nutzt der Command-Job `Runtime`, um Kommandos auszuführen. Im
Listing ist gezeigt, wie der Command-Job einen Prozess erstellt, auf diesen
wartet und anschließend die Ausgabe des Befehls einliest und als `JobResult`
zurück liefert.

```java
Runtime runtime = Runtime.getRuntime();
Process process;
process = runtime.exec(cmd.toString());
process.waitFor();
boolean success = process.exitValue() == 0;
StringBuilder message = new StringBuilder();
InputStreamReader reader = new InputStreamReader(process.getInputStream());
char[] buffer = new char[1024];
int charsRead;
while((charsRead = reader.read(buffer, 0, buffer.length)) > 0) {
    message.append(buffer, 0, charsRead);
}
status = 0;
return new JobResult(success, message.toString());
```

## REST-Job

Mit dem REST-Job können Anfragen an REST-Schnittstellen gesendet werden und die
Antworten gespeichert werden. Mit einer `HttpsURLConnection` wird die Anfrage
gestellt. Die Antwort wird im `JobResult` (und somit der Datenbank) gespeichert
(falls nicht leer) und zusätzlich als Parameter für den nächsten Job (z. B.
E-Mail-Job) bereitgestellt. Je nach HTTP-Status-Code wird die Anfrage als
Erfolg oder Misserfolg verbucht.  Hier ist zwar nur die HTTPS-Variante gezeigt,
aber ggf. wird HTTP benutzt.

```java
HttpsURLConnection httpsConnection = (HttpsURLConnection) url.openConnection();
httpsConnection.setRequestMethod(requestMethod);
if (status == 3) {
    status = 0;
    return new JobResult(false, "Aborted by user.");
}
StringBuilder response = new StringBuilder();
try (BufferedReader br = new BufferedReader(new InputStreamReader(httpsConnection.getInputStream()))) {
    String line;
    while ((line = br.readLine()) != null) {
        response.append(line);
    }
}
int httpStatus = httpsConnection.getResponseCode();
boolean success = (httpStatus >= 200 && httpStatus < 400);
if (response.length() != 0) {
    String type = httpsConnection.getContentType();
    String filename = "REST response " + Jobs.RFC3339_FORMATTER.format(new Date());
    httpsConnection.disconnect();
    JobParameter[] outputParams = new JobParameter[1];
    outputParams[0] = new JobParameter("attachment", response.toString().getBytes(), "text/plain");
    status = 0;
    return new JobResult(success, "Got " + httpStatus, response.toString().getBytes(), type, filename, outputParams);
}
httpsConnection.disconnect();
status = 0;
return new JobResult(success, "Got " + httpStatus);
```
## HibernateUtil

Hibernate bietet die Möglichkeit die Konfiguration zur Laufzeit durchzuführen,
statt Sie in eine Konfigurationsdatei zu schreiben. Das hat für uns den
Vorteil, dass man Klassen zur Laufzeit hinzufügen kann und diese dann Hibernate
bekannt gemacht werden können. 

```java
public static void init(java.lang.Class classList[]){
    	cfg= new Configuration();
    	
        cfg.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        cfg.setProperty("hibernate.connection.datasource", "jdbc/ServerSideJobs");
        cfg.setProperty("hibernate.hbm2ddl.auto", "update");
        
    	for(java.lang.Class c : classList){
    		cfg.addAnnotatedClass(c);
    	}
        buildSessionFactory();
    }
    private static void buildSessionFactory() {
            sf = cfg.buildSessionFactory();
    }
```



## Dashboard

Im ersten Schritt bei der Dashboard-Implementierung muss die Verbindung zum
Backend hergestellt werden. Da für das Dashboard SWAC benutzt wird, erfolgt die
Anbindung zum Backend in der vorgegebenen Configuration.js Datei. Hier muss bei
der `datasources` der Link zum Server hinzugefügt werden.

```javascript
SWAC_config.datasources = [];
SWAC_config.datasources[0] = "/data/[fromName]";
SWAC_config.datasources[1] = "http://epigraf01.ad.fh-bielefeld.de:8080/ServerSideJobsBackend/serversidejobs/[fromName]"
```

Für das Suchfeld auf der Dashboard-Seite wird die Select-Komponente von SWAC
benutzt. Die Ausgabe der Select-Komponente wird mithilfe von UIkit bearbeitet
und in Form einer `uk-table` dargestellt. Durch den Aufruf der Klasse
`swac\_dontdisplay` wird die Tabelle erst angezeigt, wenn nach einem Job gesucht
wird.

```html
<div id="select_example4" swa="Select FROM jobs TEMPLATE datalist">
        <input list="swac_select_datalist" class="uk-select" name="{requestor.id}">
        <datalist id="swac_select_datalist">
          <option class="swac_repeatForSet" value="{id}" name="{name}">
            {name}
          </option>
        </datalist>
        <div class="swac_repeatForSet swac_dontdisplay" swac_datalistvalue="{id}">
                <table class="uk-table uk-table-divider uk-table-striped">
```

Um die Jobs auf der Dashboard-Seite übersichtlich darzustellen wird die SWAC
Komponente `Present` benutzt. Die `Present` Komponente wird wie bei dem Suchfeld in
einer `uk-table` von UIkit dargestellt.

```html
<div id="datadescription_example2" swa="Present FROM jobs TEMPLATE table_for_all_datasets OPTIONS options">
        <table class="uk-table">
```

Um einen Job aktiv oder passiv zu setzten, wird die Funktion `changeStatus(jobid)`
aufgerufen. In der Funktion `changeStatus(jobid)` wird zuerst mithilfe eines
`fetch` ein `GET` ausgeführt, um den zu verändernden Job zu bekommen. Anschließend
wird geschaut, ob der Job aktiv oder passiv ist und dementsprechend geändert.
Zum Schluss wird die Änderung an das Backend mit einem `PUT` gegeben.

```javascript
function changeStatus(jobid){   
... 
    fetch(url+'jobs?id=' +jobid)
        .then((resp) => resp.json())
        .then(function(data) {
            const job = data.list[0];
            if(job.active==true){
                job.active=false;
            }else if(job.active==false){
                job.active=true;
            }
            
            fetch(url+'jobs?id='+jobid,{
                body: JSON.stringify(job),
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                }
            })
            ...
}
```

Mit der Funktion `playJob(jobid)` wird ein Job manuell gestartet. Dieses erfolgt
durch die HTTP Anfragemethode POST in der Funktion `playJob(jobid)`. Außerdem
wird eine Nachricht mithilfe von UIkit ausgegeben.

```javascript
function playJob(jobid){
    UIkit.notification({message: 'Der Job mit der ID: '
                +jobid+' wurde manuell gestartet'});

    fetch(url+'startjob?id=' +jobid, {
        method: 'POST'
    })
    ...
}
```
## Logs.html

Um die Log-Einträge nach Erfolg und Fehlschlag filtern zu können wird die
Filter-Komponente von UIkit benutzt. Hierbei wird Success den tag `white` und
Fail den tag `black` zugeordnet. Nun werden beim Klicken auf `Success` alle Items
mit dem tag `white` und beim Klicken auf Fail alle Items mit dem tag `black`
angezeigt.

```html
<div uk-filter="target: .js-filter">
          
        <ul class="uk-subnav uk-subnav-pill">
            <li class="uk-active" uk-filter-control><a href="#">All</a></li>
            <li uk-filter-control=".tag-white"><a href="#">SUCCESS</a></li>
            <li uk-filter-control=".tag-black"><a href="#">FAIL</a></li>
        </ul>

        <ul class="js-filter uk-list uk-list-divider" id="list">
        </ul>
</div>
```

Beim Aufrufen der Logs-Seite werden zuerst die Log-Einträge vom Server geladen.
Dieses geschieht mit der Anfragemethode GET und der `fetch` Funktion. Außerdem
wird geschaut, ob ein Parameter `ID` übergeben wird. Wenn es eine `ID` gibt werden
die Log-Einträge nach der `ID` durchsucht und anschließend mit `createList()`
dargestellt.

```javascript
window.onload = function() {
    fetch(url)
 ...
        if(id == undefined){
            if(data.list.length==0){
                UIkit.notification({message: 'Es liegen keine Logs vor'});
            }
            createList(data.list);
        }else{
            if(data.list.length==0){
                UIkit.notification({message: 'Es liegen keine Logs für Jobs mit der ID: '+
                            id+' vor'});
            }
            createList(searchByID(id,data.list));
        }
    })
...
}
```

## Job Formular

Die Besonderheit bei dem Job-Formular liegt in der dynamischen Abfrage der
Parameter. Da für diese Aufgabe kein geeignetes SWAC-Element vorhanden war,
wurde dieses Formular, mithilfe von UIKit, *von Hand* erstellt.

Die gemeinsamen Parameter wurden direkt in die HTML-Datei der *jobs*-Seite
geschrieben.

```html
<form id="job-form" class="uk-form-horizontal" type="multipart/formdata">
  <div class="uk-padding-small uk-padding-remove-horizontal">
    <label for="name" class="uk-form-label">
      Jobname
      <span class="uk-text-warning uk-text-bold"> *</span>
    </label>
    <div class="uk-form-controls">
      <input type="text" name="name" class="uk-input" required>
    </div>
  </div>
  ...
  <div id="csel" class="uk-padding-remove">
    <hr>
    <h2 class="uk-padding-remove">Job Parameter</h2>
  </div>
  <div id="job-form-controls">
    <p>Bitte zuerst eine Jobklasse auswählen.</p>
  </div>
</form>
```

Das `form`-Element bekommt hier die ID `job-form`, um das Formular per
**javascript** suchen zu können. Weiterhin wird der `type` auf
`multipart/formdata` gesetzt, damit der Inhalt in dem **javascript**-Code als
`FormData`-Element eingelesen werden kann.

Für die Anordnung der Elemente wird die UIKit-Klasse `uk-form-horizontal`
genutzt, welche die Elemente paarweise anzeigt. Links das Label, rechts den
Input.

Ein wichtiger Bestandteil ist hier das `div` mit der ID `csel` in Zeile 11.
Dieses Element wird als Trenner zwischen dem dynamischen und dem statischen Teil
genutzt.

```javascript
window.onload = function() {
  // ...
  fetch(`${endpoint}jobclasses`)
    .then(response => response.json())
    .then(data => mapClasses(data))
  // ...
}

function mapClasses(classes) {
  const jobFormClasses = document.querySelector("#job-form-class-select")
  let state = {}

  while (jobFormClasses.firstChild) {
    jobFormClasses.removeChild(jobFormClasses.firstChild)
  }

  const defaultSelection = document.createElement("option")
  // Some attributes for defaultSelection omitted
  defaultSelection.innerHTML = "--- Bitte wählen ---"
  jobFormClasses.appendChild(defaultSelection)

  // Add an input for each jobclass
  classes.forEach(cls => {
    // - Create an option element for each class and append it to select element
    // state contains parameters, which are mapped on selection
    state = { [cls.class]: cls.parameters, ...state }
  })

  jobFormClasses.addEventListener('change', (event) => {
    const jobClass = event.target.value
    mapParams(state[jobClass])
  })
}
```

Um sicherzustellen, dass die Funktion genau einmal aufgerufen wird, sobald sie
benötigt wird, wird der `window.onload`-Handler überschrieben.

Hier wird das *REST*-Backend mit der Seite `jobclasses` aufgerufen, um die
bekannten Jobklassen abzufragen. Bei einer erfolgreichen Antwort wird das
**JSON**-Ergebnis an `mapClasses` übergeben.

Die Funktion `mapClasses` leert zuerst das Selectfeld, damit keine ungültigen
Einträge darin zurückbleiben. Danach wird ein neues `option` Element erstellt.
Dieses wird als `disabled` markiert und fordert den Anwender dazu auf, eine
Jobklasse zu wählen.

Danach werden für jede verfügbare Klasse die Parameter in der Liste `state`
gespeichert, um später darauf zurückgreifen zu können.

Zum Schluss der Funktion wird für das Selectfeld der `change`-Handler
überschrieben. Dieser sorgt für die Generierung der jobspezifischen Inputfelder.

```javascript
function mapParams(params) {
  const jobFormControls = document.querySelector("#job-form")

  // Delete all elements after "csel"
  while (jobFormControls.lastChild && jobFormControls.lastChild.id !== "csel") {
    jobFormControls.removeChild(jobFormControls.lastChild)
  }

  if (!Array.isArray(params)) { return }
  params.forEach(param => {
    // - document.createElement for required elements
    // - Add classes for the created elements
    // - Label creation
    if (param.required) {
      // - Create span with " *" content and append to label
    }
    // - appendChild for created elements
  })
  // - Create and append submit button
}
```

Der `mapParams`-Handler löscht alle Felder im Formular nach dem `div` mit der
ID `csel`. Danach erstellt er für jeden Job-Parameter ein neues Label/Input Pair
und fügt es am Ende des Formulars ein.

```javascript
window.onload = function() {
  // ...
  jobForm.onsubmit = async (e) => {
    e.preventDefault()

    const formdata = new FormData(jobForm)
    const bodyData = Object.fromEntries(formdata.entries())
    const intervalKeys = ['month', 'week', 'day', 'hour', 'minute']
    const interval = {}

    bodyData["personId"] = Number(bodyData["personId"])

    intervalKeys.forEach(key => {
      if (key in bodyData) {
        interval[key] = bodyData[key].split(',').map(Number)
        delete bodyData[key]
      }
    })

    bodyData.interval = JSON.stringify(interval)

    fetch(`${endpoint}jobs`, {
      body: JSON.stringify(bodyData),
      method: 'post',
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => {
      if (res.ok) {
        window.location = "../dashboard.html"
      }
    })
  }
}
```

Um die Daten des Formulars an das *REST*-Backend senden zu können, müssen die
Einträge in das vom Backend erforderte Format gebracht werden. In diesem Fall
ist das **JSON**.

Hierfür wird zuerst ein neues FormData Objekt erstellt. Eine Besonderheit ist
das `interval`-Feld, welches einen String erwartet, welcher wiederum zu einem
JSON-Objekt geparst werden kann. Dazu werden die zum Intervall gehörenden Keys
aus dem FormData Objekt in ein eigenes Objekt (`interval`) überführt und aus
dem originalen `bodyData`-Objekt entfernt. Das `interval`-Objekt wird dann als
JSON-String in das `bodyData`-Objekt eingefügt.

Nachdem alle Parameter in ein JSON-Objekt gebracht wurden, werden die Daten per
`HTTP-POST` an das Backend gesendet. Wenn dieser den Statuscode 200 (OK)
zurücksendet, wird der Anwender auf die Dashboard-Seite weitergeleitet.
