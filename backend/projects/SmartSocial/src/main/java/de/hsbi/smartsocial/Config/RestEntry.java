package de.hsbi.smartsocial.Config;

import de.hsbi.smartsocial.Controller.*;
import io.swagger.v3.jaxrs2.integration.resources.OpenApiResource;
import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

import java.util.HashSet;
import java.util.Set;

/**
 * Author: Clemens Maas
 * Date: 2023/11/30
 */
@ApplicationPath("/api")
public class RestEntry extends Application {

    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> resources = new HashSet<>();

        resources.add(GroupController.class);
        resources.add(LeaderboardController.class);
        resources.add(AchievementController.class);
        resources.add(QuestController.class);
        resources.add(TestController.class);
        resources.add(ProfileSettingsController.class);
        resources.add(UtilityController.class);
        resources.add(OpenApiResource.class);

        return resources;
    }

}