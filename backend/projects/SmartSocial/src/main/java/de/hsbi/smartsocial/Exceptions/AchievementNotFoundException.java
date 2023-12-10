package de.hsbi.smartsocial.Exceptions;

public class AchievementNotFoundException extends RuntimeException {

    public AchievementNotFoundException(Long id) {
        super("Achievement with id " + id + " not found");
    }

    public AchievementNotFoundException(String name) {
        super("Achievement with name " + name + " not found");
    }

}
