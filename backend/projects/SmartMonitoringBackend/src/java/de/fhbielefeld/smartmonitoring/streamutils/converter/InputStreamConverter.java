package de.fhbielefeld.smartmonitoring.streamutils.converter;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * Eine Klasse die einen InputStream in einen ByteStream umwandelt
 *
 * @author dstarke
 */
public class InputStreamConverter {

    /**
     * Checks if the inputstream is accessable, if not (like when the stream is
     * of type DataHead.ReadMultiStream) converts it to accessable.
     *
     * @param is InputStream to check and convert
     * @return
     * @throws ConvertException
     */
    public static InputStream getReadableInputStream(InputStream is) throws ConvertException {
        // Check if stream is accessable
        try {
            if (is.available() > 0) {
                return is;
            }
        } catch (IOException ex) {
            ConvertException ce = new ConvertException("InputStream is not accessable");
            ce.addSuppressed(ex);
            throw ce;
        }
        // Try to make accessable
        return new ByteArrayInputStream(toByteArray(is, -1));
    }

    /**
     * Converts a inputstream into an array of bytes.
     *
     * @param is InputStream to convert
     * @param maxBytes Maximum number of bytes to convert
     * @return Aray of bytes contianing the bytes of the stream
     * @throws ConvertException
     */
    public static byte[] toByteArray(InputStream is, int maxBytes) throws ConvertException {
        int bufferSize = 1024;
        if (maxBytes > 0 && maxBytes < bufferSize) {
            bufferSize = maxBytes;
        }

        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            byte[] buffer = new byte[bufferSize];
            int readLength = 0;
            int readed = 0;
            while ((readLength = is.read(buffer)) != -1) {
                outputStream.write(buffer, 0, readLength);
                readed += readLength;
                // If next read would read to much recalculate bufferSize
                if (maxBytes > 0 && (readed + bufferSize) > maxBytes) {
                    bufferSize = maxBytes - readed;
                    buffer = new byte[bufferSize];
                }
                if (maxBytes > 0 && readed >= maxBytes) {
                    break;
                }
            }
            outputStream.flush();
            is.close();
            return outputStream.toByteArray();
        } catch (IOException ex) {
            ConvertException ce = new ConvertException("Could not convert inputstream to byte array. " + ex.getLocalizedMessage());
            ce.addSuppressed(ex);
            throw ce;
        }
    }

    /**
     * Converts the contents from the given InputStream to String.
     * 
     * @param is InputStream which contents should be converted
     * @return String representation of the InputStreams content
     * @throws ConvertException 
     */
    public static String toString(InputStream is) throws ConvertException {
        BufferedReader br = null;
        StringBuilder sb = new StringBuilder();
        String line;
        try {
            br = new BufferedReader(new InputStreamReader(is));
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
        } catch (IOException ex) {
            ConvertException cex = new ConvertException("Could not convert InputStream to string: " + ex.getLocalizedMessage());
            cex.addSuppressed(cex);
            throw cex;
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException ex) {
                    ConvertException cex = new ConvertException("Could not close bufferd reader: " + ex.getLocalizedMessage());
                    cex.addSuppressed(cex);
                    throw cex;
                }
            }
        }
        return sb.toString();
    }

    /**
     * Converts an array of bytes into an inputstream.
     *
     * @param bytes Bytes to convert to inputstream
     * @return InputStream with bytes content
     */
    public static InputStream toInputStream(byte[] bytes) {
        return new ByteArrayInputStream(bytes);
    }

    //maximal moegliche Video-/Image -groeße
    static int MaxSize = 256000;
}
