package de.hsbi.smartsocial.Exceptions;

/**
 * Author: Clemens Maas
 * Date: 2023/12/06
 */
public class GroupNotFoundException extends RuntimeException {
    public GroupNotFoundException(Long id) {
        super("Could not find group with ID: " + id);
    }

    public GroupNotFoundException(String name) {
        super("Could not find group with name: " + name);
    }
}
