package de.fhbielefeld.smartbridge.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import de.fhbielefeld.smartbridge.config.Configuration;
import de.fhbielefeld.smartuser.annotations.SmartUserAuth;
import java.io.Serializable;
import jakarta.annotation.Resource;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;
import jakarta.json.JsonValue.ValueType;
import javax.naming.NamingException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.UserTransaction;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Map.Entry;
import java.util.stream.Collectors;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.Enumeration;

/**
 * REST interface for analysing media files
 *
 * @author ffehring
 */
@Path("bridge")
@Tag(name = "SmartBridge", description = "Execute scripts in other languages")
public class BridgeResource implements Serializable {

    @PersistenceContext(unitName = "SmartBridgePU")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    private Configuration conf;

    public BridgeResource() {
        // Init logging
        try {
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            this.conf = new Configuration();
            Logger.getInstance("SmartBridge", moduleName);
            Logger.setDebugMode(Boolean.parseBoolean(conf.getProperty("debugmode")));
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
    }

    @GET
    @Path("execute")
    @Produces(MediaType.APPLICATION_JSON)
    @SmartUserAuth
    @Operation(summary = "Execute a command",
            description = "Executes a command and returns the result")
    @APIResponse(
            responseCode = "200",
            description = "Result of execution")
    @APIResponse(
            responseCode = "404",
            description = "Command not found")
    public Response execute(
            @Parameter(description = "Command to execute", required = true) @QueryParam("command") String command,
            @Parameter(description = "File to execute", required = true) @QueryParam("file") String file,
            @Parameter(description = "Parameter for execution", required = false) @QueryParam("parameter") String parameter,
            @Parameter(description = "Object to retrive from result", required = false) @QueryParam("object") String object,
            @Parameter(description = "Column where to store result on logging", required = false) @QueryParam("logtarget") String logtarget) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        String ret = "";
        JsonObject retObj = null;
        try {
            String basepath = Paths.get(".").toAbsolutePath().normalize().toString();
            String execpath = basepath + "/" + file;
            File f = new File(execpath);
            if (!f.exists() || f.isDirectory()) {
                rob.addErrorMessage("Could not find executable >" + execpath + "<");
                rob.setStatus(Response.Status.BAD_REQUEST);
                return rob.toResponse();
            }
            // Build parameter list
            ArrayList<String> params = new ArrayList<>();
            params.add(command);
            params.add(execpath);
            // Get additional parameters
            if (parameter != null) {
                String[] paramparts = parameter.split(",");
                for (String curPart : paramparts) {
                    params.add(curPart);
                }
            }
            String[] array = new String[params.size()];
            ProcessBuilder pb = new ProcessBuilder();
            pb.command(params.toArray(array));
            // Start execution
            Process p = pb.start();
            // Get output
            BufferedReader in = new BufferedReader(new InputStreamReader(p.getInputStream()));
            ret = in.lines().collect(Collectors.joining(System.lineSeparator()));
            if (ret.startsWith("{") || ret.startsWith("[")) {
                // Correct mailformed JSON if possible
                ret = ret.replace("b'", "'");
                ret = ret.replace("'", "\"");
                ret = ret.replace("True", "true");
                ret = ret.replace("False", "false");
                ret = ret.replaceAll("\\\\", "");

                // Parse JSON
                JsonReader jsonReader = Json.createReader(new StringReader(ret));
                retObj = jsonReader.readObject();

                //Get requested object
                if (object != null) {
                    JsonValue jsonValue = this.findValue(retObj, object);
                    rob.add("result", jsonValue);
                } else {
                    rob.add("result", retObj);
                }
            } else {
                // Create JSON including result
                JsonObjectBuilder job = Json.createObjectBuilder();
                job.add("result", ret);
                rob.add(job.build());
            }

            int exitVal = p.waitFor();
            if (exitVal == 0) {
                rob.setStatus(Response.Status.OK);
            } else {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                String err = p.errorReader().lines().collect(Collectors.joining());
                rob.addErrorMessage(err);
            }
        } catch (Exception ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while executing command: " + ex.getClass().getSimpleName() + ": " + ex.getLocalizedMessage());
            System.out.println("Command result: >" + ret + "<");
        }

        // Send info to state logger if configured
        String smartdataurl = this.conf.getProperty("log.smartdataurl");
        if (smartdataurl != null) {
            if (smartdataurl.startsWith("/")) {
                smartdataurl = "http://localhost:8080" + smartdataurl;
            }
            String collection = this.conf.getProperty("log.collection");
            String storage = this.conf.getProperty("log.storage");

            WebTarget webTarget = WebTargetCreator.createWebTarget(
                    smartdataurl + "/smartdata", "records")
                    .path(collection)
                    .queryParam("storage", storage);
            JsonObjectBuilder builder = Json.createObjectBuilder();
            // Create a device and task id
            builder.add("devid", getMAC() + "_" + file);

            if (retObj != null) {
                // Send all values from response object
                for (Entry<String, JsonValue> entry : retObj.entrySet()) {
                    if (entry.getValue().getValueType() == ValueType.OBJECT) {
                        for (Entry<String, JsonValue> subEntry : entry.getValue().asJsonObject().entrySet()) {
                            String entryName = subEntry.getKey().replace(".", "_");
                            if (entryName.equals("id")) {
                                continue;
                            }
                            builder.add(entryName, subEntry.getValue());
                        }
                    } else {
                        String entryName = entry.getKey().replace(".", "_");
                        if (entryName.equals("id")) {
                            continue;
                        }
                        builder.add(entryName, entry.getValue());
                    }
                }
            } else {
                String target = "value";
                if (logtarget != null) {
                    target = logtarget;
                }
                // Send single response
                builder.add(target, ret);
            }

            JsonObject dataObject = builder.build();
            String str = dataObject.toString();
            str = str.replaceAll("(\\r|\\n|\\t)", "");
            Entity<String> coldef = Entity.json(str);
            try {
                Response response = webTarget.request(MediaType.APPLICATION_JSON).post(coldef);
                if (response.getStatus() != Response.Status.CREATED.getStatusCode()) {
                    String responseText = response.readEntity(String.class);
                    Message msg = new Message("Could not log activity. Recived: " + responseText, MessageLevel.ERROR);
                    Logger.addMessage(msg);
                } else {
                    String responseText = response.readEntity(String.class);
                    Message msg = new Message("Activity logged. Recived answer: " + responseText, MessageLevel.ERROR);
                    Logger.addDebugMessage(msg);
                }
            } catch (Exception e) {
                Message msg = new Message("Activity would not be logged. Logging target is not reachable: " + e.getLocalizedMessage(), MessageLevel.ERROR);
                Logger.addDebugMessage(msg);
            }
        } else {
            Message msg = new Message("Activity would not be logged. There is no >log.smartdataurl< in configuration file.", MessageLevel.ERROR);
            Logger.addDebugMessage(msg);
        }

        return rob.toResponse();
    }

    private JsonValue findValue(JsonObject jsonObject, String key) {
        for (Entry<String, JsonValue> curEntry : jsonObject.entrySet()) {
            if (curEntry.getKey().equals(key)) {
                return curEntry.getValue();
            }
            // Recursive call
            if (curEntry.getValue().getValueType() == ValueType.OBJECT) {
                return findValue(curEntry.getValue().asJsonObject(), key);
            }
        }
        return null;
    }

    /**
     * Gets the MAC address
     *
     * @return MAC address
     */
    public static String getMAC() {
        String mact = null;
        try {
            Enumeration<NetworkInterface> e = NetworkInterface.getNetworkInterfaces();
            while (e.hasMoreElements()) {
                NetworkInterface ni = (NetworkInterface) e.nextElement();
                byte[] mac = ni.getHardwareAddress();
                StringBuilder sb = new StringBuilder();
                if (mac != null) {
                    for (int i = 0; i < mac.length; i++) {
                        sb.append(String.format("%02X%s", mac[i], (i < mac.length - 1) ? "-" : ""));
                    }
                }
                mact = sb.toString();
                if (mact.length() > 0) {
                    break;
                }
            }
        } catch (SocketException ex) {
            System.out.println("SocketException while getting MAC-Address: " + ex.getLocalizedMessage());
        }
        return mact;
    }
}
