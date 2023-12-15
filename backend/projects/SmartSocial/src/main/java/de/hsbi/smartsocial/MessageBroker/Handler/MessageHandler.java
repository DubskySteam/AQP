package de.hsbi.smartsocial.MessageBroker.Handler;

@FunctionalInterface
public interface MessageHandler {
    void handleMessage(byte[] body);
}