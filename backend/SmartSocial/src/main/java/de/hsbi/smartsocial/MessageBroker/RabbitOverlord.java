package de.hsbi.smartsocial.MessageBroker;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.hsbi.smartsocial.Exceptions.QueueInitException;
import de.hsbi.smartsocial.Logging.CLogger;
import de.hsbi.smartsocial.Model.User;
import de.hsbi.smartsocial.Service.LeaderboardService;
import de.hsbi.smartsocial.Service.ProfileSettingsService;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Author: Clemens Maas
 * Date: 2023/12/15
 */
@Singleton
@Startup
public class RabbitOverlord {

    @Inject
    private RabbitConsumer rabbitMQConsumer;

    @Inject
    private ProfileSettingsService profileSettingsService;

    @Inject
    private LeaderboardService leaderboardService;

    private ObjectMapper objectMapper;

    @PostConstruct
    public void initialize() {
        try {
            this.objectMapper = new ObjectMapper();

            rabbitMQConsumer.subscribe("user.created.sc", this::handleUserCreatedMessage, "userCreated");
            Logger.getLogger("RabbitOverlord").info("RabbitMQ Overlord initialized");

        } catch (Exception e) {
            Logger.getLogger("RabbitOverlord").severe("Could not initialize RabbitMQ Overlord");
        }
    }

    /**
     * This method is called when a user is created.
     * It initializes the tables for the user.
     * @param body The message body
     */
    public void handleUserCreatedMessage(byte[] body) {
        User user = processMessage(body, User.class);
        if (user != null) {
            CLogger.getInstance().log(Level.INFO, "RabbitMQ","User created: " + user.getUsername() + " (" + user.getId() + ")");
            profileSettingsService.createProfileSettings(user.getId());
            leaderboardService.createLeaderboard(user.getId());
            CLogger.getInstance().log(Level.INFO, "RabbitMQ","Created profile settings and leaderboard for user " + user.getUsername() + " (" + user.getId() + ")");
        }
    }

    private <T> T processMessage(byte[] body, Class<T> modelClass) {
        try {
            T model = objectMapper.readValue(body, modelClass);
            System.out.println("Received message of type " + modelClass.getSimpleName() + ": " + model.toString());
            return model;
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Could not process message of type " + modelClass.getSimpleName());
            return null;
        }
    }

}
