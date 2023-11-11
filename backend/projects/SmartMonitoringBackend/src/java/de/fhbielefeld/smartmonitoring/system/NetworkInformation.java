package de.fhbielefeld.smartmonitoring.system;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

/**
 * Gives access to network informations
 *
 * @author ffehring
 */
public class NetworkInformation {

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

    /**
     * Gets the first public IP address
     *
     * @return Systems IP address
     */
    public static String getPublicIpAddress() {
        String res = null;
        try {
            String localhost = InetAddress.getLocalHost().getHostAddress();
            Enumeration<NetworkInterface> e = NetworkInterface.getNetworkInterfaces();
            while (e.hasMoreElements()) {
                NetworkInterface ni = (NetworkInterface) e.nextElement();
                if (ni.isLoopback()) {
                    continue;
                }
                if (ni.isPointToPoint()) {
                    continue;
                }
                Enumeration<InetAddress> addresses = ni.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress address = (InetAddress) addresses.nextElement();
                    if (address instanceof Inet4Address) {
                        String ip = address.getHostAddress();
                        if (!ip.equals(localhost)) {
                            System.out.println((res = ip));
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return res;
    }
}
