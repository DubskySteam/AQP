package de.fhbielefeld.scl.rest.exceptions.handlers;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.lang.reflect.InvocationTargetException;
import javax.naming.NamingException;
import javax.net.ssl.SSLHandshakeException;

/**
 *
 * @author jannik, dstarke
 */
@Provider
@Produces(MediaType.APPLICATION_JSON)
public class GeneralExceptionMapper implements ExceptionMapper<Exception> {

    @Context
    private HttpServletRequest request;

    public GeneralExceptionMapper() {
        // Init logging
        try {
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            Logger.getInstance("SmartData", moduleName);
            Logger.setDebugMode(true);
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
    }

    /**
     * Generates a response for not catched exceptions
     *
     * @param exception Exception
     * @return response error
     */
    @Override
    @Produces(MediaType.APPLICATION_JSON)
    public Response toResponse(Exception exception) {
        return this.toResponseObjectBuilder(exception).toResponse();
    }

    /**
     * Gerates a ResponseObjectBuilder from a given Exception. Formats the
     * exception so it is usefull for the enduser.
     *
     * @param exception Exception that must be delivered to the enduser
     * @return ResponseObjectBuilder describing the exception
     */
    public ResponseObjectBuilder toResponseObjectBuilder(Throwable exception) {
        // If it is a InvocationTargetException handle the nested exception
        if (exception.getClass().equals(InvocationTargetException.class)) {
            Throwable rootexception = exception.getCause();
            if (rootexception != null) {
                exception = rootexception;
            }
        }

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        // Handle no interface given
        if(request.getPathInfo()==null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("No interface selected");
            return rob;
        }
        // Do not handle REST exceptions
        if (exception.getClass().getCanonicalName().contains("javax.ws.rs.NotFoundException")) {
            String nfmsg = "The requested REST interface >"
                    + request.getPathInfo() + "< could not be found.";
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage(nfmsg);
            if(request.getRequestURI().contains("\\\\")) {
                rob.addErrorMessage("Request uri contains double slash! " + request.getRequestURI());
            }
            
            Message msg = new Message(nfmsg, MessageLevel.ERROR);
            Logger.addDebugMessage(msg);
            return rob;
        }

        // Handling SSL exception
        if (exception.getClass().getCanonicalName().contains("javax.ws.rs.ProcessingException")) {
            ProcessingException pex = (ProcessingException) exception;
            return this.createProcessingExceptionResponse(pex);
        }

        return this.createUnkownExceptionResponse(exception);
    }

    /**
     * Creates a response for a SSLHAndshakeException capsled in
     * ProcessingException
     *
     * @param pex A processingException
     * @return Response object with information about the exception
     */
    private ResponseObjectBuilder createProcessingExceptionResponse(ProcessingException pex) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        if (pex.getCause().getClass().getSimpleName().contains("SSLHandshakeException")) {
            SSLHandshakeException sslex = (SSLHandshakeException) pex.getCause();
            rob.setStatus(Response.Status.BAD_GATEWAY);
            rob.addErrorMessage("SSL connection error: " + sslex.getLocalizedMessage());
        } else {
            rob = this.createUnkownExceptionResponse(pex);
        }
        return rob;
    }

    /**
     * Creates a response for a not otherwise handled exception
     *
     * @param exception Exception
     * @return Response with text containing the name of the exception
     */
    private ResponseObjectBuilder createUnkownExceptionResponse(Throwable exception) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        
        if(exception.getLocalizedMessage().contains("HTTP 404 Not Found")) {
            System.out.println("The URL >" + this.request.getRequestURI() + "< was not found.");
            rob.setStatus(Response.Status.NOT_FOUND);
            return rob;
        }
        
        rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
        String msg = exception.getLocalizedMessage();
        if(msg == null && exception.getSuppressed().length > 0) {
            msg = exception.getSuppressed()[0].getLocalizedMessage();
        }
        
        rob.addErrorMessage(msg + "(" + exception.getClass().getSimpleName() + ")");
        System.err.println("=== STACKTRACE for unmapped exception ===");
        System.err.println("called: " + this.request.getRequestURI() 
                + " method: " + this.request.getMethod() 
                + " mediatype: " + this.request.getContentType());
        
        exception.printStackTrace();
        return rob;
    }

    /**
     * Searches for an message in stacktrace and returns the full message.
     * Returns the first found
     *
     * @param ex Exception where to start search
     * @param searchExpression Expressions searched
     * @return Message with expression or null, if not found
     */
    private String searchMessageContaining(Throwable ex, String... searchExpression) {
        for (int i = 0; i < searchExpression.length; i++) {
            if (ex.getLocalizedMessage() != null
                    && ex.getLocalizedMessage().contains(searchExpression[i])) {
                return ex.getLocalizedMessage();
            }
        }
        // Search in cause
        if (ex.getCause() != null) {
            String msg1 = searchMessageContaining(ex.getCause(), searchExpression);
            if (msg1 != null) {
                return msg1;
            }
        }

        // Search in suppressed
        Throwable[] suppressed = ex.getSuppressed();
        for (int i = 0; i < suppressed.length; i++) {
            String msg = searchMessageContaining(suppressed[i], searchExpression);
            if (msg != null) {
                return msg;
            }
        }
        return null;
    }

    /**
     * Searches if the given exception contains an exception of the given kind
     * in it cause or supressed exceptions.
     *
     * @param ex Exception beginning the search
     * @param exceptionClass Searched exception class
     * @return Found exception of the awaited class or null
     */
    private Throwable searchExceptionContaining(Throwable ex, Class exceptionClass) {
        // Check if exception is of the searched kind
        if (ex.getClass() == exceptionClass) {
            return ex;
        }

        // Search in cause
        if (ex.getCause() != null) {
            Throwable cause = searchExceptionContaining(ex.getCause(), exceptionClass);
            if (cause != null) {
                return cause;
            }
        }

        // Search in suppressed
        Throwable[] suppressed = ex.getSuppressed();
        for (int i = 0; i < suppressed.length; i++) {
            Throwable supressedEx = searchExceptionContaining(suppressed[i], exceptionClass);
            if (supressedEx != null) {
                return supressedEx;
            }
        }
        return null;
    }
}
