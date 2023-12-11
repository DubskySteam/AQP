package de.hsbi.smartsocial.Exceptions;

/**
 * Author: Clemens Maas
 * Date: 2023/12/06
 */
public class QuestByUserNotFoundException extends RuntimeException {
    public QuestByUserNotFoundException(String message) {
        super(message);
    }
}
