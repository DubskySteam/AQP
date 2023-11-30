package de.hsbi.smartsocial.Exceptions;

public class GroupNotFoundException extends RuntimeException {
    public GroupNotFoundException(Long id) {
        super("Could not find group with ID: " + id);
    }

    public GroupNotFoundException(String name) {
        super("Could not find group with name: " + name);
    }
}
