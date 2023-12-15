package de.hsbi.smartsocial.MessageBroker;

import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Inject
    private ObjectMapper objectMapper;

    @PostConstruct
    public void initialize() {
        try {

            rabbitMQConsumer.subscribe("user.created", this::handleUserCreatedMessage);

        } catch (Exception e) {
            e.printStackTrace();
            //TODO: Handle the exception appropriately
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
            //TODO: Handle the exception appropriately
        }
    }
}
