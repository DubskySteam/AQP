package de.hsbi.smartsocial.Exceptions;

/**
 * Author: Clemens Maas
 * Date: 2023/12/06
 */
public class GroupForMemberNotFoundException extends RuntimeException {
    public GroupForMemberNotFoundException(Long id) {
        super("Could not find a group for member with id: " + id);
    }
}
