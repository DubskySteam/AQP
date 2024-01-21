package de.hsbi.admin.Config;

import java.util.Properties;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Paths;

public class ConfigLoader {
    private static ConfigLoader instance;
    private Properties properties;

    private ConfigLoader() {
        properties = new Properties();

        String domainDir = System.getProperty("com.sun.aas.instanceRoot");
        if (domainDir == null) {
            throw new IllegalStateException("Domain directory property (com.sun.aas.instanceRoot) is not set.");
        }

        String configFilePath = Paths.get(domainDir, "config", "config_admin.properties").toString();
        try (InputStream input = new FileInputStream(configFilePath)) {
            if (input == null) {
                System.out.println("Sorry, unable to find config.properties at " + configFilePath);
                return;
            }
            properties.load(input);
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    public static synchronized ConfigLoader getInstance() {
        if (instance == null) {
            instance = new ConfigLoader();
        }
        return instance;
    }

    public String getProperty(String key) {
        return properties.getProperty(key);
    }
}
