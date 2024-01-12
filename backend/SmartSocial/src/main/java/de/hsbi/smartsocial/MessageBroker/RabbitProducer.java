package de.hsbi.smartsocial.MessageBroker;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import de.hsbi.smartsocial.Model.Group;

/**
 * Author: Clemens Maas
 * Date: 2023/12/15
 */
public class RabbitProducer {


    public void doStuff(Group group) {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setUsername("admin");
        factory.setPassword("admin");

        try (
                Connection connection = factory.newConnection();
                Channel channel = connection.createChannel()
        ) {
            channel.queueDeclare("test-queue", true, false, false, null);
            channel.basicPublish("", "test-queue", null, group.toString().getBytes());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
