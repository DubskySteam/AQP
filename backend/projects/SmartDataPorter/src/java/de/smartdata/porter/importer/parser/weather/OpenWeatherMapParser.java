package de.smartdata.porter.importer.parser.weather;

import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.streamconverter.ConvertException;
import de.smartdata.porter.streamconverter.InputStreamConverter;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonNumber;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;

/**
 * ParseImporter for weather data from openweathermap service
 *
 * @see
 * http://git01-ifm-min.ad.fh-bielefeld.de/Forschung/scl/2015_04_SCL_Importer/wikis/OpenWaetherMap%20Plugin
 * @author
 */
public class OpenWeatherMapParser extends Parser {

    @Override
    public String getDescription() {
        return "Imports data from open weather map api";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        // Cant detect json because it has no magic bytes
        if (mimetype == null) {
            try {
                byte[] contentBytes = InputStreamConverter.toByteArray(is, 70);
                String firstBytesStr = new String(contentBytes, StandardCharsets.UTF_8);
                if (firstBytesStr.contains("{\"coord\":{")
                        && firstBytesStr.contains(",\"weather\":[{")) {
                    return true;
                }
            } catch (ConvertException ex) {
                ParserException pex = new ParserException("Could not check acceptance of inputstream. Error: " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                throw pex;
            }
        }
        System.out.println(this.getClass().getSimpleName() + " does not support mimetype >" + mimetype + "<");
        return false;
    }

    @Override
    public void preParse() throws ParserException {
        //Nothing todo here
    }

    @Override
    public ParserResult parse(InputStream is) throws ParserException {
        try {
            LocalDateTime ldt = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            // Create dataset
            JsonObjectBuilder dataset = Json.createObjectBuilder();
            dataset.add("ts", ldt.format(formatter));

            //create JSON-Objects
            JsonReader reader = Json.createReader(is);
            JsonObject root = reader.readObject();

            // Weather group
            JsonArray joWeatherArr = root.getJsonArray("weather");
            JsonObject joWeather = joWeatherArr.getJsonObject(0);
            if (joWeather != null) {
                String weather = joWeather.getJsonString("main").toString();
                dataset.add("weather", weather);
            }

            // Main parameters
            JsonObject joMain = root.getJsonObject("main");
            if (joMain != null) {
                Double temp = joMain.getJsonNumber("temp").doubleValue() - 273.15;
                Double pressure = joMain.getJsonNumber("pressure").doubleValue();
                JsonNumber sea_level = joMain.getJsonNumber("sea_level");
                if (sea_level != null) {
                    Double press_sea_level = sea_level.doubleValue();
                    dataset.add("press_sea_level", press_sea_level);
                }
                JsonNumber grnd_level = joMain.getJsonNumber("grnd_level");
                if (grnd_level != null) {
                    Double press_grnd_level = grnd_level.doubleValue();
                    dataset.add("press_grnd_level", press_grnd_level);
                }
                Double humidity = joMain.getJsonNumber("humidity").doubleValue();

                dataset.add("temp", temp);
                dataset.add("pressure", pressure);
                dataset.add("humidity", humidity);
            }

            // Cloud parameters
            JsonObject joClouds = root.getJsonObject("clouds");
            if (joClouds != null) {
                Double clouds = joClouds.getJsonNumber("all").doubleValue();
                dataset.add("clouds", clouds);
            }

            // Wind parameters
            JsonObject joWind = root.getJsonObject("wind");
            if (joWind != null) {
                Double windSpeed = joWind.getJsonNumber("speed").doubleValue();
                dataset.add("wind_speed", windSpeed);
                // This attribute is not given every time
                if (joWind.get("deg") != null) {
                    Double windDegree = joWind.getJsonNumber("deg").doubleValue();
                    dataset.add("wind_dir", windDegree);
                }
                if (joWind.get("gust") != null) {
                    Double windDegree = joWind.getJsonNumber("gust").doubleValue();
                    dataset.add("wind_gust", windDegree);
                }
            }

            // Rain parameters
            JsonObject joRain = root.getJsonObject("rain");
            if (joRain != null) {
                Double rain1h = joRain.getJsonNumber("1h").doubleValue();
                dataset.add("rain_1h", rain1h);
            }

            // Snow parameters
            JsonObject joSnow = root.getJsonObject("snow");
            if (joSnow != null) {
                Double snow1h = joSnow.getJsonNumber("1h").doubleValue();
                dataset.add("snow_1h", snow1h);
            }

            JsonObject jsonSet = dataset.build();

            Message msg = new Message("Set do add: >" + jsonSet.toString() + "<", MessageLevel.INFO);
            Logger.addDebugMessage(msg);

            this.importer.addDataSet(jsonSet);

            this.result.datasetFromDate = ldt;
            this.result.datasetUntilDate = ldt;
            this.result.datasetsAvailable = 1;
            this.result.datasetsParsed = 1;

            return this.result;
        } catch (Exception ex) {
            ParserException pe = new ParserException("Could not add values " + ex.getLocalizedMessage());
            pe.addSuppressed(ex);
            throw pe;
        }
    }
}
