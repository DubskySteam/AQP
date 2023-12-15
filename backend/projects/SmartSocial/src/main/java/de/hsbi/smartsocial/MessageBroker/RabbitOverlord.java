package de.hsbi.smartsocial.MessageBroker;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.hsbi.smartsocial.Exceptions.QueueInitException;
import de.hsbi.smartsocial.Model.User;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

@Singleton
@Startup
public class RabbitOverlord {

    @Inject
    private RabbitConsumer rabbitMQConsumer;

    private ObjectMapper objectMapper;

    @PostConstruct
    public void initialize() {
        try {
            this.objectMapper = new ObjectMapper();

            rabbitMQConsumer.subscribe("user.created.sc", this::handleUserCreatedMessage);
            System.out.println("RabbitMQ Overlord initialized");

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Could not initialize RabbitMQ Overlord");
        }
    }

    public void handleUserCreatedMessage(byte[] body) {
        processMessage(body, User.class);
    }

    private <T> void processMessage(byte[] body, Class<T> modelClass) {
        try {
            T model = objectMapper.readValue(body, modelClass);
            System.out.println("Received message of type " + modelClass.getSimpleName() + ": " + model.toString());
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Could not process message of type " + modelClass.getSimpleName());
        }
    }
}
