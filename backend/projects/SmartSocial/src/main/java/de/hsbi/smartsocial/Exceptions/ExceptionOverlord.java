package de.hsbi.smartsocial.Exceptions;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class ExceptionOverlord implements ExceptionMapper<RuntimeException> {

    @Override
    public Response toResponse(RuntimeException exception) {
        Response.Status status;

        status = switch (exception.getClass().getSimpleName()) {
            case "GroupNotFoundException",
                    "GroupForMemberNotFoundException",
                    "AchievementNotFoundException" -> Response.Status.NOT_FOUND;
            case "InvalidGroupDataException" -> Response.Status.BAD_REQUEST;
            default -> Response.Status.INTERNAL_SERVER_ERROR;
        };

        return Response
                .status(status)
                .entity("Error: " + exception.getMessage())
                .type("text/plain")
                .build();
    }
}
