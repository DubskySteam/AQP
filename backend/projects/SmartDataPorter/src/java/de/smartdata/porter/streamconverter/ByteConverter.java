package de.smartdata.porter.streamconverter;

import java.nio.ByteOrder;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Class for converting bytes.
 *
 * @author ffehring
 */
public class ByteConverter {

    /**
     * Converts a hex string to a byte array and returns the array. If the given
     * String starts with the hex indicator (0x) this will be removed.
     */
    public static byte[] hexStringToByteArray(String hexString, ByteOrder byteorder) {
        // Remove prefixing hex indicator if given
        if (hexString.startsWith("0x")) {
            hexString = hexString.substring(2);
        }

        Byte[] byteArray = new Byte[0];
        //        if (byteorder == ByteOrder.LITTLE_ENDIAN) {
        // Converts each character of the hexString to the corresponding byte 
        byteArray = new Byte[hexString.length() / 2];
        for (int i = 0; i < hexString.length(); i += 2) {
            byteArray[i / 2]
                    = (byte) ((Character.digit(hexString.charAt(i), 16) << 4)
                    + Character.digit(hexString.charAt(i + 1), 16));
        }

        if (byteorder == ByteOrder.BIG_ENDIAN) {
            List<Byte> bytelist = Arrays.asList(byteArray);
            Collections.reverse(bytelist);
        }

        byte[] barray = new byte[byteArray.length];
        for (int i = 0; i < byteArray.length; i++) {
            barray[i] = byteArray[i];
        }

        return barray;
    }

    /**
     * Converts an byte array to its hex representation.
     * 
     * @param bytes Bytes to convert
     * @return Hex representation of the bytes
     */
    public static String byteArrayToHexString(byte[] bytes) {
        char[] hexArray = "0123456789ABCDEF".toCharArray();
        char[] hexChars = new char[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }
}
