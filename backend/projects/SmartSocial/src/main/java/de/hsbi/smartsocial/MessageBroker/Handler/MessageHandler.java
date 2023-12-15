package de.hsbi.smartsocial.MessageBroker.Handler;

/**
 * Author: Clemens Maas
 * Date: 2023/12/15
 */
@FunctionalInterface
public interface MessageHandler {
    void handleMessage(byte[] body);
}