package de.hsbi.smartsocial.Exceptions;

/**
 * Author: Clemens Maas
 * Date: 2023/12/06
 */
public class QuestNotFoundException extends  RuntimeException {
    public QuestNotFoundException(String message) {
        super(message);
    }
}
