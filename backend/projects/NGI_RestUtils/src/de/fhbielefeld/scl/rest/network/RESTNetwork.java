package de.fhbielefeld.scl.rest.network;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.security.GeneralSecurityException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

/**
 * This class contains methods for createing clients and webtargets for
 * accessing REST interfaces booth with http and https.
 *
 * @author ffehring
 */
public class RESTNetwork {

    /**
     * Gets the webtarget for the root rest service location builded from the
     * given url
     *
     * @param url URL where to build an webtarget from
     * @return WebTarget for access to the rest interfaces
     * @throws RestNetworkException
     */
    public static WebTarget getWebTarget(URL url) throws RestNetworkException {
        if (url == null) {
            return null;
        }

        // Build URI from URL
        URI uri = null;
        try {
            uri = new URI(
                    url.getProtocol(),
                    url.getUserInfo(),
                    url.getHost(),
                    url.getPort(),
                    url.getPath(),
                    url.getQuery(),
                    url.getRef());
        } catch (URISyntaxException ex) {
            RestNetworkException rnex = new RestNetworkException("Could not create URI. " + ex.getMessage());
            rnex.addSuppressed(ex);
            throw rnex;
        }
        Client cl = getNetworkClient(url);
        return cl.target(uri.toASCIIString());
    }

    /**
     * Creates a new network client for REST webservices.
     *
     * @param url URL wof the root rest service location.
     * @return Client over that the rest webservice is accessable
     * @throws RestNetworkException
     */
    public static Client getNetworkClient(URL url) throws RestNetworkException {
        Client client;
        if (url.getProtocol().equalsIgnoreCase("https")) {
            try {
                // Get trustmanager and hostname verififier
                TrustManager[] trustmanager = getTrustManager();
                HostnameVerifier hostnameverififier = getHostnameVerifier();

                // Get certificate
                HttpsURLConnection con = (HttpsURLConnection) url.openConnection();
//                //dumpl all cert info
//                SSLCertificateHandler.print_https_cert(con);

                // Set used ssl protocol
                SSLContext sc = SSLContext.getInstance("TLSv1.2"); //Java 8
                // Init sslcontext
                sc.init(null, trustmanager, new java.security.SecureRandom());
                // Build client
                client = ClientBuilder.newBuilder().sslContext(sc).hostnameVerifier(hostnameverififier).build();
            } catch (NoSuchAlgorithmException | KeyManagementException | IOException ex) {
                RestNetworkException rnex = new RestNetworkException("Could not establish ssl connection: " + ex.getLocalizedMessage());
                rnex.addSuppressed(ex);
                throw rnex;
            }
        } else {
            client = jakarta.ws.rs.client.ClientBuilder.newClient();
        }
        return client;
    }

    /**
     * Get the best available trustmanager
     *
     * NOTICE: currently delivers an unsecure trustmanager that trusts all.
     *
     * @return Trustmanager to check certificates with
     */
    public static TrustManager[] getTrustManager() {
        // Create a trust manager that does not validate certificate chains
        TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {
                @Override
                public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[0];
                }

                @Override
                public void checkClientTrusted(
                        java.security.cert.X509Certificate[] certs, String authType) {
                }

                @Override
                public void checkServerTrusted(
                        java.security.cert.X509Certificate[] certs, String authType) {
                }
            }
        };

        // Install the all-trusting trust manager
        try {
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        } catch (GeneralSecurityException e) {
        }

        return trustAllCerts;
    }

    /**
     * Returns an verifier for hostnames from certificates.
     *
     * @return
     */
    public static HostnameVerifier getHostnameVerifier() {
        HostnameVerifier hv = HttpsURLConnection.getDefaultHostnameVerifier();
        hv = new InsecureHostnameVerifier();
        return hv;
    }

    /**
     * Checks if an url is reachable
     *
     * @param url url to check
     * @return true if url is reachable with get and returns an status < 400
     * @throws RestNetworkException
     */
    public static boolean isReachable(URL url) throws RestNetworkException {
        if (url == null) {
            // Unneccessery check, null is ever reachable
            return true;
        }
        WebTarget target = getWebTarget(url);
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseTxt = response.readEntity(String.class);
        if (response.getStatus() >= 400 && !(responseTxt.contains("406")) && !(responseTxt.contains("NotAcceptableException"))) { //HTTP 406 Not Acceptable means it is reachable
            Message msg = new Message("URL >" + url + "< answered with " + responseTxt, MessageLevel.WARNING);
            Logger.addMessage(msg);
            return false;
        }
        return true;
    }

    /**
     * Checks if an url is reachable and operable. Operable means that the
     * interface returns an status below 400 for simple get requests.
     *
     * @param url url to check
     * @return true if url is reachable with get and returns an status < 400
     * @throws RestNetworkException
     */
    public static boolean isOperable(URL url) throws RestNetworkException {
        if (url == null) {
            // Unneccessery check, null is ever reachable but not operable
            return false;
        }

        try {
            WebTarget target = getWebTarget(url);
            Response response = target.request(MediaType.APPLICATION_JSON).get();
            String responseTxt = response.readEntity(String.class);
            // REST interface is operable even if request is not acceppted by interface
            if (response.getStatus() != 406 || response.getStatus() >= 400) {
                Message msg = new Message("URL >" + url + "< answered with " + responseTxt, MessageLevel.ERROR);
                Logger.addMessage(msg);
                return false;
            }
        } catch (Exception ex) {
            Message msg = new Message("URL >" + url + "< reachability could not be checked because of exception: "
                    + ex.getClass().getSimpleName() + ":" + ex.getLocalizedMessage(),
                    MessageLevel.ERROR);
            Logger.addMessage(msg);
            RestNetworkException rex = new RestNetworkException(msg.getMessage());
            rex.addSuppressed(ex);
            throw rex;
        }
        return true;
    }
}
