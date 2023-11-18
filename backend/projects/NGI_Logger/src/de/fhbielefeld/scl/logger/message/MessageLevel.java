package de.fhbielefeld.scl.logger.message;

/**
 * Enthält die Kritikalitätslevel, mit denen Nachrichten behaftet sein können, die
 * durch den Webservice in der Datenbank geloggt werden können.
 * 
 * @author Ruben Hockemeyer, Ruben Grest
 */
public enum MessageLevel 
{
    INFO, WARNING, ERROR, CRITICAL_ERROR, USER_ERROR;
}
