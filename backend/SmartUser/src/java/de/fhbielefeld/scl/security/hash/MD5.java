package de.fhbielefeld.scl.security.hash;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Random;

/**
 * MD5 hash building functions
 *
 * @author ffehring
 */
public class MD5 {

    /**
     * Methode zur Verschlüsselung von Strings mithilfe von MD5
     *
     * @param content String der mit MD5 Verschlüsselt werden soll
     * @return Gibt den übergebenen Parameter als MD5 Hash zurück
     */
    public static String generateMD5Hash(String content) throws SecurityException {
        StringBuilder hexString = new StringBuilder();
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            md.update(content.getBytes());

            byte byteData[] = md.digest();

            for (int i = 0; i < byteData.length; i++) {
                String hex = Integer.toHexString(0xff & byteData[i]);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
        } catch (NoSuchAlgorithmException ex) {
            SecurityException se = new SecurityException("MD5 Algorithm not found");
            se.addSuppressed(ex);
            throw se;
        }

        return hexString.toString();
    }
    
    /**
     * Generates an timed token. Use it for time dependend informations, that can
     * refresh imeadly. For example login tokens.
     *
     * @param content   Content to hash with time information
     * @return Generated token
     */
    public static String generateTimetoken(String content) {
        String token = generateMD5Hash(content
                + System.currentTimeMillis()
                + System.nanoTime() 
                + new Random().nextInt());
        return token;
    }
}
