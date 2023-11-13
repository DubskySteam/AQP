const register = () => {

    var username = document.getElementById("benutzername").value;
    var password = document.getElementById("Passwort").value;
    var firstName = document.getElementById("Vorname").value;
    var lastName = document.getElementById("Nachname").value;
    var email = document.getElementById("E-Mail").value;


    console.log("Benutzername:", username);
    console.log("Passwort:", password);
    console.log("Vorname:", firstName);
    console.log("Nachname:", lastName);
    console.log("E-Mail:", email);
}