package de.fhbielefeld.scl.rest.util;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.ResponseBuilder;
import jakarta.ws.rs.core.StreamingOutput;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

/**
 * ResponseBuilder shared functionality for ListResponseBuilder and
 * ObjectResponseBuilder
 *
 * @author Florian Fehring
 */
public abstract class ApiResponseBuilder {

    protected static boolean debugmode = false;
    protected Response.Status status = null;
    protected ArrayList<String> cookies = new ArrayList<>();
    protected String downloadFileName = null;

    protected final Map<String, Class> convertedToString = new HashMap<>();
    protected final List<String> nullfields = new ArrayList<>();
    protected final List<String> warnings = new ArrayList<>();
    protected final List<String> errors = new ArrayList<>();
    protected final List<Throwable> exceptions = new ArrayList<>();
    protected final Map<String, String> links = new HashMap<>();

    /**
     * Sets the state of the debugmode
     *
     * @param debug true for enabling
     * @return
     */
    public ApiResponseBuilder setDebugMode(boolean debug) {
        debugmode = debug;
        return this;
    }

    /**
     * Delivers the state of the debugmode
     *
     * @return true if debugmode is enabled
     */
    public static boolean getDebugMode() {
        return debugmode;
    }

    /**
     * Sets the status for this response.
     *
     * @param status Status, one of standard Response.Status
     * @return
     */
    public ApiResponseBuilder setStatus(Response.Status status) {
        if (this.status == null || this.status == Response.Status.OK) {
            this.status = status;
        }
        return this;
    }

    public Response.Status getStatus() {
        return this.status;
    }

    /**
     * Sets an cookie that should be delivered with the response
     *
     * @param name Name of the cookie
     * @param value Cookies value
     * @param maxAge Maximum age in seconds of cookie
     * @return
     */
    public ApiResponseBuilder addCookie(String name, String value, int maxAge) {
        // Defines the cookie without domain, path and comment. Send over http and https and without httpOnly mode (allow access with javascript)
        String cookie = name + "=" + value;
        if (maxAge != 0) {
            cookie += "; sameSite=None; max-age=" + maxAge + ";";
        }
        this.cookies.add(cookie);
        return this;
    }

    /**
     * Adds an HATEOAS link to the response
     *
     * @param url
     * @param d
     * @return
     */
    public ApiResponseBuilder addLink(String url, String d) {
        this.links.put(url, url);
        return this;
    }

    /**
     * Declares the generated response as downloadable.The given filename will
     * be the suggested filename for download in client.
     *
     * @param filename
     * @return
     */
    public ApiResponseBuilder setDownloadFileName(String filename) {
        this.downloadFileName = filename;
        return this;
    }

    public ApiResponseBuilder addConvertedToString(String key, Class convclass) {
        this.convertedToString.put(key, convclass);
        return this;
    }

    public Map<String, Class> getConvertedToString() {
        return convertedToString;
    }

    public ApiResponseBuilder addNullField(String nullfield) {
        this.nullfields.add(nullfield);
        return this;
    }

    public List<String> getNullfields() {
        return nullfields;
    }

    public ApiResponseBuilder addWarningMessage(String warningMessage) {
        warningMessage = warningMessage.replace("\\", "\\\\");
        warningMessage = warningMessage.replace("\"", "\\\"");
        warningMessage = warningMessage.replace("\b", "\\b");
        warningMessage = warningMessage.replace("\f", "\\f");
        warningMessage = warningMessage.replace("\n", "\\n");
        warningMessage = warningMessage.replace("\r", "\\r");
        warningMessage = warningMessage.replace("\t", "\\t");
        this.warnings.add(warningMessage);
        return this;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public ApiResponseBuilder addErrorMessage(String errorMessage) {
        errorMessage = errorMessage.replace("\\", "\\\\");
        errorMessage = errorMessage.replace("\"", "\\\"");
        errorMessage = errorMessage.replace("\b", "\\b");
        errorMessage = errorMessage.replace("\f", "\\f");
        errorMessage = errorMessage.replace("\n", "\\n");
        errorMessage = errorMessage.replace("\r", "\\r");
        errorMessage = errorMessage.replace("\t", "\\t");
        this.errors.add(errorMessage);
        return this;
    }

    public List<String> getErrors() {
        return errors;
    }

    /**
     * Adds an exception that should be delivered in the response (within debug
     * mode only)
     *
     * @param ex Exception to deliver
     * @return The modified responsebuilder
     */
    public ApiResponseBuilder addException(Throwable ex) {
        this.exceptions.add(ex);
        return this;
    }

    public List<Throwable> getExceptions() {
        return exceptions;
    }

    public ApiResponseBuilder mergeMessages(ApiResponseBuilder arb) {
        this.convertedToString.putAll(arb.convertedToString);
        this.nullfields.addAll(arb.nullfields);
        this.warnings.addAll(arb.warnings);
        this.errors.addAll(arb.errors);
        this.exceptions.addAll(arb.exceptions);
        if (!this.errors.isEmpty() || !this.exceptions.isEmpty()) {
            this.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
        }
        return this;
    }

    /**
     * Creates an response object as stated in jaxws.rs standard
     *
     * @return
     */
    public Response toResponse() {
        ResponseBuilder rb = this.createResponseBuilder();
        rb.entity(this.toString());
        return rb.build();
    }

    /**
     * Creates a response object with streaming capability. EXPERIMENTAL! Does
     * not support status flags, cookies or fileDownloadHeader
     *
     * @return
     */
    public Response toResponseStream() {

        StreamingOutput stream = new StreamingOutput() {
            @Override
            public void write(OutputStream out) throws IOException, WebApplicationException {
                Writer writer = new BufferedWriter(new OutputStreamWriter(out));
                writer.write("{");

                boolean prevCont = toWriter(writer);

                // Add warnings
                if (!warnings.isEmpty()) {
                    if (prevCont) {
                        writer.write(",");
                    }
                    writer.write("\"warnings\": [");
                    for (int i = 0; i < warnings.size(); i++) {
                        writer.write("\"" + warnings.get(i) + "\"");
                        if (i < warnings.size() - 1) {
                            writer.write(",");
                        }
                    }
                    writer.write("]");
                    prevCont = true;
                }
                // Add errors
                if (!errors.isEmpty()) {
                    if (prevCont) {
                        writer.write(",");
                    }
                    writer.write("\"errors\": [");
                    for (int i = 0; i < errors.size(); i++) {
                        writer.write("\"" + errors.get(i) + "\"");
                        if (i < errors.size() - 1) {
                            writer.write(",");
                        }
                    }
                    writer.write("]");
                    prevCont = true;
                }
                // Add exceptions
                if (!exceptions.isEmpty()) {
                    if (prevCont) {
                        writer.write(",");
                    }
                    writer.write("\"exceptions\": [");
                    for (int i = 0; i < exceptions.size(); i++) {
                        String msg = exceptions.get(i).getLocalizedMessage();
                        msg = msg.replace("\\", "\\\\");
                        msg = msg.replace("\"", "\\\"");
                        msg = msg.replace("\b", "\\b");
                        msg = msg.replace("\f", "\\f");
                        msg = msg.replace("\n", "\\n");
                        msg = msg.replace("\r", "\\r");
                        msg = msg.replace("\t", "\\t");
                        writer.write("\"" + msg + "\"");
                        if (i < exceptions.size() - 1) {
                            writer.write(",");
                        }
                    }
                    writer.write("]");
                }

                writer.write("}");
                writer.flush();
            }
        };
        ResponseBuilder rb = this.createResponseBuilder();
        rb.entity(stream);
        return rb.build();
    }

    /**
     * Create a JAX-RS ResponseBuilder for this ApiResponseBuilder Adds header
     * information from settings and data inside the ApiResponeBuilder
     */
    private ResponseBuilder createResponseBuilder() {
        if (this.status == null) {
            this.status = Response.Status.INTERNAL_SERVER_ERROR;
            this.addErrorMessage("There was no status set for this response");
        }
        Response.ResponseBuilder rb = Response.status(this.status);
        String cookiesstr = "";
        for (String curCookie : this.cookies) {
            cookiesstr += curCookie;
        }
        if (!cookiesstr.isEmpty()) {
            rb.header("Set-Cookie", cookiesstr);
        }
        if (this.downloadFileName != null) {
            rb.header("Content-Disposition", "attachment; filename=" + this.downloadFileName);
        }

        // Add HATEOAS links
        for (Entry<String, String> curLink : this.links.entrySet()) {
            URI delLocLink = URI.create(curLink.getKey());
            rb.link(delLocLink, curLink.getValue());
        }

        if (!this.getConvertedToString().isEmpty()) {
            String convertedMapStr = "Values for [";
            for (Map.Entry<String, Class> curConv : this.getConvertedToString().entrySet()) {
                convertedMapStr += curConv.getKey() + "(" + curConv.getValue().getSimpleName() + "), ";
            }
            convertedMapStr += "] converted to string representation.";
            Message msg = new Message(convertedMapStr, MessageLevel.WARNING);
            Logger.addDebugMessage(msg);
            this.addWarningMessage(convertedMapStr);
        }

        // Debug message for null fields
        if (!this.getNullfields().isEmpty()) {
            Message msg = new Message(
                    "The fields >" + this.getNullfields() + "< are not included in result, because they have null values.",
                    MessageLevel.INFO);
            Logger.addDebugMessage(msg);
        }

        return rb;
    }

    /**
     * Converts the ApiResponse into JSON representation
     *
     * @return ApiResponse JSON representation
     */
    public abstract String toJson();

    /**
     * Writes the ApiResponse into an Writer object
     *
     * @param writer Writer where to write the contents
     * @return True if content was written
     */
    public abstract boolean toWriter(Writer writer) throws IOException;
}
