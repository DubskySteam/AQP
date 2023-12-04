package de.hsbi.smartsocial.Exceptions;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class ExceptionOverlord implements ExceptionMapper<RuntimeException> {

    @Override
    public Response toResponse(RuntimeException exception) {
        Response.Status status;

        if (exception instanceof GroupNotFoundException) {
            status = Response.Status.NOT_FOUND;
        } else if (exception instanceof InvalidGroupDataException) {
            status = Response.Status.BAD_REQUEST;
        } else if (exception instanceof GroupForMemberNotFound) {
            status = Response.Status.NOT_FOUND;
        } else {
            status = Response.Status.INTERNAL_SERVER_ERROR;
        }

        return Response
                .status(status)
                .entity("Error: " + exception.getMessage())
                .type("text/plain")
                .build();
    }
}
