package de.hsbi.smartsocial.Exceptions;

/**
 * Author: Clemens Maas
 * Date: 2023/12/06
 */
public class ProfileSettingsNotFoundException extends RuntimeException {
    public ProfileSettingsNotFoundException(String message) {
        super(message);
    }
}
