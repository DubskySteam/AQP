package de.hsbi.smartsocial.Exceptions;

public class GroupForMemberNotFoundException extends RuntimeException {
    public GroupForMemberNotFoundException(Long id) {
        super("Could not find a group for member with id: " + id);
    }
}
