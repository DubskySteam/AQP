package de.hsbi.smartsocial.Exceptions;

public class GroupForMemberNotFound extends RuntimeException {
    public GroupForMemberNotFound(Long id) {
        super("Could not find a group for member with id: " + id);
    }
}
