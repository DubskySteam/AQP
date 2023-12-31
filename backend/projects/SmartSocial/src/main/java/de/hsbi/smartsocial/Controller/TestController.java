package de.hsbi.smartsocial.Controller;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

/**
 * Author: Clemens Maas
 * Date: 2023/12/06
 */
@Path("/test")
public class TestController {

    @GET
    @Path("/ping")
    public String ping() {
        return "Pong!";
    }
}
