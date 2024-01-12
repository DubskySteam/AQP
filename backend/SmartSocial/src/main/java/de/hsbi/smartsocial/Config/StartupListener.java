package de.hsbi.smartsocial.Config;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

/**
 * Author: Clemens Maas
 * Date: 2023/12/11
 * <h3>
 * This class is used to print a fancy ASCII art on startup and shutdown of the application.
 * Please don't remove this class, it's important! Very important! :(
 * </h3>
 */
@WebListener
public class StartupListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {

        String asciiArt = "\n" +
                "   _____                      _    _____            _       _ \n" +
                "  / ____|                    | |  / ____|          (_)     | |\n" +
                " | (___  _ __ ___   __ _ _ __| |_| (___   ___   ___ _  __ _| |\n" +
                "  \\___ \\| '_ ` _ \\ / _` | '__| __|\\___ \\ / _ \\ / __| |/ _` | |\n" +
                "  ____) | | | | | | (_| | |  | |_ ____) | (_) | (__| | (_| | |\n" +
                " |_____/|_| |_| |_|\\__,_|_|   \\__|_____/ \\___/ \\___|_|\\__,_|_|\n" +
                "                                                           \n" +
                " |  _|     | |           | |         | | |_  |                \n" +
                " | |    ___| |_ __ _ _ __| |_ ___  __| |   | |                \n" +
                " | |   / __| __/ _` | '__| __/ _ \\/ _` |   | |                \n" +
                " | |   \\__ \\ || (_| | |  | ||  __/ (_| |   | |                \n" +
                " | |_  |___/\\__\\__,_|_|   \\__\\___|\\__,_|  _| |                \n" +
                " |___|                                   |___|                \n" +
                "                                                              \n";

        System.out.println(asciiArt);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("\n" +
                "   _____                      _    _____            _       _ \n" +
                "  / ____|                    | |  / ____|          (_)     | |\n" +
                " | (___  _ __ ___   __ _ _ __| |_| (___   ___   ___ _  __ _| |\n" +
                "  \\___ \\| '_ ` _ \\ / _` | '__| __|\\___ \\ / _ \\ / __| |/ _` | |\n" +
                "  ____) | | | | | | (_| | |  | |_ ____) | (_) | (__| | (_| | |\n" +
                " |_____/|_| |_| |_|\\__,_|_|   \\__|_____/ \\___/_\\___|_|\\__,_|_|\n" +
                "                                                              \n" +
                " |  _|     | |                           | | |_  |            \n" +
                " | |    ___| |_ ___  _ __  _ __   ___  __| |   | |            \n" +
                " | |   / __| __/ _ \\| '_ \\| '_ \\ / _ \\/ _` |   | |            \n" +
                " | |   \\__ \\ || (_) | |_) | |_) |  __/ (_| |   | |            \n" +
                " | |_  |___/\\__\\___/| .__/| .__/ \\___|\\__,_|  _| |            \n" +
                " |___|              | |   | |                |___|            \n" +
                "                    |_|   |_|                                 \n");
    }
}