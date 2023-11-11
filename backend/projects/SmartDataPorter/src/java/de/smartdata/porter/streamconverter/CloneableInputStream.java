package de.smartdata.porter.streamconverter;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 *
 * @author ffehring
 */
public class CloneableInputStream extends InputStream {

    private InputStream is;
    private byte[] bytes;
    
    public CloneableInputStream() {
        
    }
    
    public CloneableInputStream(InputStream is) throws ConvertException {
        this.bytes = InputStreamConverter.toByteArray(is,-1);
        this.is = new ByteArrayInputStream(this.bytes);  
    }
    
    @Override
    public int read() throws IOException {
        return this.is.read();
    }
    
    @Override
    public int available() throws IOException {
        return this.is.available();
    }
    
    /**
     * Read the first x bytes of the stream
     * 
     * @param x Number of bytes to read
     * @return The requested bytes or at least as much as available
     */
    public byte[] readXBytes(int x) {
        if(x > this.bytes.length) {
            x = this.bytes.length;
        }
        
        byte[] copybytes = new byte[x];
        System.arraycopy(this.bytes, 0, copybytes, 0, x);
        return copybytes;
    }
    
    @Override
    public CloneableInputStream clone() {
        CloneableInputStream clone = new CloneableInputStream();
        clone.bytes = this.bytes;
        clone.is = InputStreamConverter.toInputStream(this.bytes);
        return clone;
    }
}
