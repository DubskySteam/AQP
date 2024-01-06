package de.hsbi.admin.Utility;

import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.HashMap;
import java.util.Map;

public class RequestBuilder {

    private final Client client;
    private String targetUrl;
    private String method = "GET";
    private final Map<String, String> headers = new HashMap<>();
    private Object body;


    public RequestBuilder() {
        this.client = ClientBuilder.newClient();
    }

    public String send() {
        WebTarget target = client.target(targetUrl);

        for (Map.Entry<String, String> header : headers.entrySet()) {
            target = target.queryParam(header.getKey() + ": ", header.getValue());
        }

        Response response = null;

        try {
            if ("POST".equals(method)) {
                response = target.request(MediaType.APPLICATION_JSON).post(Entity.json(body));
            } else if ("GET".equals(method)) {
                response = target.request(MediaType.APPLICATION_JSON).get();
            }

            if (response != null && response.getStatus() == Response.Status.OK.getStatusCode()) {
                return response.readEntity(String.class);
            } else {
                return "Failed: HTTP status " + (response != null ? response.getStatus() : "No Response");
            }
        } finally {
            if (response != null) {
                response.close();
            }
            client.close();
        }
    }

    public RequestBuilder addDefaultAcceptHeader() {
        this.headers.put("Accept", "*/*");
        return this;
    }

    public void printToSend() {
        System.out.println("Request Details:"
                + "\nMethod: " + method
                + "\nURL: " + targetUrl
                + "\nHeaders: " + headers);
        if (body != null) {
            System.out.println("Body: " + body);
        } else {
            System.out.println("Body: None");
        }
    }

    public RequestBuilder setTarget(String url) {
        this.targetUrl = url;
        return this;
    }

    public RequestBuilder setMode(String method) {
        this.method = method;
        return this;
    }

    public RequestBuilder addHeader(String key, String value) {
        this.headers.put(key, value);
        return this;
    }

    public RequestBuilder setBody(Object body) {
        this.body = body;
        return this;
    }
}
