package de.hsbi.smartsocial.Exceptions;

/**
 * Author: Clemens Maas
 * Date: 2023/12/06
 */
public class AchievementNotFoundException extends RuntimeException {

    public AchievementNotFoundException(Long id) {
        super("Achievement with id " + id + " not found");
    }

    public AchievementNotFoundException(String name) {
        super("Achievement with name " + name + " not found");
    }

}
