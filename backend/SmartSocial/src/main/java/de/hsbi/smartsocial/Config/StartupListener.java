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

        String asciiArt = """

                   _____                      _    _____            _       _\s
                  / ____|                    | |  / ____|          (_)     | |
                 | (___  _ __ ___   __ _ _ __| |_| (___   ___   ___ _  __ _| |
                  \\___ \\| '_ ` _ \\ / _` | '__| __|\\___ \\ / _ \\ / __| |/ _` | |
                  ____) | | | | | | (_| | |  | |_ ____) | (_) | (__| | (_| | |
                 |_____/|_| |_| |_|\\__,_|_|   \\__|_____/ \\___/ \\___|_|\\__,_|_|
                                                                          \s
                 |  _|     | |           | |         | | |_  |               \s
                 | |    ___| |_ __ _ _ __| |_ ___  __| |   | |               \s
                 | |   / __| __/ _` | '__| __/ _ \\/ _` |   | |               \s
                 | |   \\__ \\ || (_| | |  | ||  __/ (_| |   | |               \s
                 | |_  |___/\\__\\__,_|_|   \\__\\___|\\__,_|  _| |               \s
                 |___|                                   |___|               \s
                                                                             \s
                """;

        System.out.println(asciiArt);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("""

                   _____                      _    _____            _       _\s
                  / ____|                    | |  / ____|          (_)     | |
                 | (___  _ __ ___   __ _ _ __| |_| (___   ___   ___ _  __ _| |
                  \\___ \\| '_ ` _ \\ / _` | '__| __|\\___ \\ / _ \\ / __| |/ _` | |
                  ____) | | | | | | (_| | |  | |_ ____) | (_) | (__| | (_| | |
                 |_____/|_| |_| |_|\\__,_|_|   \\__|_____/ \\___/_\\___|_|\\__,_|_|
                                                                             \s
                 |  _|     | |                           | | |_  |           \s
                 | |    ___| |_ ___  _ __  _ __   ___  __| |   | |           \s
                 | |   / __| __/ _ \\| '_ \\| '_ \\ / _ \\/ _` |   | |           \s
                 | |   \\__ \\ || (_) | |_) | |_) |  __/ (_| |   | |           \s
                 | |_  |___/\\__\\___/| .__/| .__/ \\___|\\__,_|  _| |           \s
                 |___|              | |   | |                |___|           \s
                                    |_|   |_|                                \s
                """);
    }
}