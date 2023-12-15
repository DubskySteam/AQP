package de.hsbi.smartsocial.MessageBroker;

import com.rabbitmq.client.*;
import de.hsbi.smartsocial.MessageBroker.Handler.MessageHandler;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Clemens Maas
 * Date: 2023/12/15
 */
@ApplicationScoped
public class RabbitConsumer {

    private Connection connection;
    private Channel channel;

    public RabbitConsumer() throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        factory.setPort(5672);

        connection = factory.newConnection();
        channel = connection.createChannel();
    }

    public void subscribe(String queueName, MessageHandler messageHandler) throws Exception {
        channel.queueDeclare(queueName, true, false, false, null);

        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            byte[] body = delivery.getBody();
            messageHandler.handleMessage(body);
        };

        channel.basicConsume(queueName, true, deliverCallback, consumerTag -> {});
    }

    public void closeConnection() throws Exception {
        if (channel != null && channel.isOpen()) {
            channel.close();
        }
        if (connection != null && connection.isOpen()) {
            connection.close();
        }
    }
}


