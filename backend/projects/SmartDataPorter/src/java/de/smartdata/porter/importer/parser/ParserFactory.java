package de.smartdata.porter.importer.parser;

import de.fhbielefeld.scl.reflection.classes.ClassReflection;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Creates parsers on given data
 *
 * @author ffehring
 */
public class ParserFactory {

    private static List<Package> parserPackages = new ArrayList<>();
    private static List<String> parserNames = new ArrayList<>();

    /**
     * Gets an parser related on his name
     *
     * @param parsername Name of the parser to instantiate
     * @return
     * @throws ParserException
     */
    public static Parser getParser(String parsername) throws ParserException {
        parsername = parsername != null ? parsername.trim() : "";

        Parser parser = null;
        if (!parsername.isEmpty()) {
            Class<?> c = null;

            int founds = 0;
            
            for (Package parserPackage : getParserPackages()) {
                try {
                    c = Class.forName(parserPackage.getName() + "." + parsername);
                    founds++;
                } catch (ClassNotFoundException e) {
                    // Do nothing maybe in next package
                }
            }

            if (c == null) {
                throw new ParserException("Parser >" + parsername + "< was not found.");
            } else if (founds > 1) {
                throw new ParserException("Parser >" + parsername + "< is not uniqe.");
            }

            // Create instance of parser
            try {
                parser = (Parser) c.getConstructor().newInstance();
            } catch (InstantiationException ex) {
                ParserException pe = new ParserException("The parser " + parsername + " could not be instantiated");
                pe.addSuppressed(ex);
                throw pe;
            } catch (IllegalAccessException | SecurityException | IllegalArgumentException | InvocationTargetException ex) {
                ParserException pe = new ParserException("The parser " + parsername + " could not be accessed");
                pe.addSuppressed(ex);
                throw pe;
            } catch (NoSuchMethodException ex) {
                ParserException pe = new ParserException("The parser " + parsername + " could not be constructed. There is no default constructor.");
                pe.addSuppressed(ex);
                throw pe;
            }
        }

        return parser;
    }

    /**
     * Gets a list of all packages which contains parsers.
     *
     * @return List of packages containing parsers
     */
    public static List<Package> getParserPackages() {
        if (parserPackages.isEmpty()) {
            Set<Class<? extends Parser>> parsers = ParserFactory.getParserClasses();
            for (Class<? extends Parser> parser : parsers) {
                if (!parserPackages.contains(parser.getPackage())) {
                    parserPackages.add(parser.getPackage());
                }
            }
        }
        return parserPackages;
    }

    /**
     * Gets a list of the names of all available parsers.
     *
     * @return List of names of available parsers
     */
    public static List<String> getParserNames() {
        if (parserNames.isEmpty()) {
            Set<Class<? extends Parser>> parsers = ParserFactory.getParserClasses();
            for (Class<? extends Parser> parser : parsers) {
                parserNames.add(parser.getSimpleName());
                // Add package to list
                if (!parserPackages.contains(parser.getPackage())) {
                    parserPackages.add(parser.getPackage());
                }
            }
        }

        return parserNames;
    }

    /**
     * Gets a set of all available parsers.
     *
     * @return List of available parser classes
     */
    public static Set<Class<? extends Parser>> getParserClasses() {
        return ClassReflection.getClassesThatExtends("de.smartdata.porter.importer.parser", Parser.class);
    }
}
