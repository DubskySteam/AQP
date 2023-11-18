package de.fhbielefeld.smartuser.application;

import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Builds usermanager
 *
 * @author ffehring
 */
public class UsermanagerBuilder {

    /**
     * Builds an Usermanager depending on the configuration. Checks
     * configuration.
     *
     * @param conf Configuration to build manager upon
     * @param em EntityManager for local storage. Could be null, if only network
     * is used.
     * @param utx UserTransaction for local storage.
     * @return Usermanager instance
     * @throws UsermanagerException Thrown if Usermanager can not be created
     */
    public static List<Usermanager> build(UsermanagerHandler umh) throws UsermanagerException {
        if (umh.getConf().getProperty("passwordsalt") == null || umh.getConf().getProperty("authtokensalt") == null) {
            throw new UsermanagerException("Missing passwordsalt and / or authtokensalt in configuration.");
        }
        String serviceorder = umh.getConf().getProperty("serviceorder").toLowerCase(Locale.ENGLISH);
        String[] services = serviceorder.split(",");
        List<Usermanager> usermanagers = new ArrayList<>();
        for (int i = 0; i < services.length; i++) {
            Message msg = new Message("Setting up usermanager >" + services[i] + "<", MessageLevel.INFO);
            Logger.addDebugMessage(msg);
            try {
                switch (services[i].toLowerCase()) {
                    case "network":
                        usermanagers.add(new UsermanagerNetwork(umh));
                        break;
                    case "local":
                        usermanagers.add(new UsermanagerLocal(umh));
                        break;
                    case "ldap":
                        usermanagers.add(new UsermanagerLDAP(umh));
                        break;
                    default:
                        usermanagers.add(new UsermanagerNetworkLocal(umh));
                }
            } catch (UsermanagerException ex) {
                Message emsg = new Message("Could not instantiate usermanager >" + services[0] + "< " + ex.getLocalizedMessage(), MessageLevel.WARNING);
                Logger.addDebugMessage(emsg);
            }
        }
        return usermanagers;
    }
}
