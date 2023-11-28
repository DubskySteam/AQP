package de.hsbi.smartsocial.Controller;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/test")
public class TestController {

    @GET
    @Path("/ping")
    public String ping() {
        return "Pong!";
    }
}
