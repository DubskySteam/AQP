package de.fhbielefeld.smartmonitoring.jpaproxy;

import java.time.LocalDateTime;
import jakarta.validation.constraints.Size;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.geolatte.geom.*;

import static org.geolatte.geom.crs.CoordinateReferenceSystems.WGS84;
import static org.geolatte.geom.builder.DSL.*;


public class TblObservedObjectTblLocationProxy {
   
     private Long ooId;

    @Size(min = 1, max = 255)
    @Schema(description = "ObservedObjects name")
    private String ooName = "unkown";

    @Schema(description = "Description of the intention and use of this observedobject")
    private String ooDescription;

    @Schema(description = "Name of the collection where data for this observedobject is stored")
    private String ooCollection;

    @Schema(description = "Indicates if the observedobject acceppts new data")
    private Boolean ooDataCapture = false;

    @Schema(description = "Indicates, if manual measurement entries are allowed")
    private Boolean ooManualCapture = false;

    @Schema(description = "Observedobjects type. The type decides which values could be collected by this observedobject.")
    private Long ooType;

    @Schema(description = "Path to a media file used as symbol for this observedobject.")
    private String ooIcon;
    
    @Schema(description = "Status of observed object")
    private Boolean ooCompleted;

    @Schema(description = "Id of observedobjects hierarchical parent")
    private Long ooParent;

    private Long locId;

    @Size(max = 10485760)
    @Schema(description = "Locations name")
    private String locName;
    @Size(max = 10485760)
    @Schema(description = "Locations description")
    private String locDescription;
    @Schema(description = "Locations country")
    private String locCountry;
    @Size(max = 10485760)
    @Schema(description = "Locations street")
    private String locStreet;
    @Schema(description = "Locations housenumber")
    private String locHousenumber;
    @Schema(description = "Locations zip code")
    private String locPostcode;
    @Schema(description = "Locations city name")
    private String locCity;
    @Schema(description = "Locations floor")
    private String locFloor;
    @Schema(description = "Locations apartment number")
    private String locApartment;
    @Schema(description = "Locations room number")
    private String locRoom;
    @Schema(description = "Latitude of location")
    private Double locLatitude;
    @Schema(description = "Longitude of location")
    private Double locLongitude;
    
    @Schema(description = "Date and time the observedobject starts to be at the location")
    private LocalDateTime valid_from;
    @Schema(description = "Date and time the observedobject ents to be at the location")
    private LocalDateTime valid_until;
    
    
    public TblObservedObjectTblLocationProxy() {
        
    }
    // Getter/Setter ObservedObject
    public Long getOoId() {
        return this.ooId;
    }
    
    public void setOoId(Long id) {
        this.ooId = id;
    }
    
    public String getOoName() {
        return this.ooName;
    }
    
    public void setOoName(String name) {
        this.ooName = name;
    }
    
    public String getOoDescription() {
        return this.ooDescription;
    }
    
    public void setOoDescription(String description) {
        this.ooDescription = description;
    }
    
    public String getOoCollection() {
        return this.ooCollection;
    }
    
    public void setOoCollection(String collection) {
        this.ooCollection = collection;
    }
    
    public Boolean getDataCapture() {
        return this.ooDataCapture;
    }

    public void setDataCapture(Boolean dataCapture) {
        this.ooDataCapture = dataCapture;
    }
    
    public Boolean getManualCapture() {
        return this.ooManualCapture;
    }

    public void setManualCapture(Boolean manualCapture) {
        this.ooManualCapture = manualCapture;
    }

    public Long getOoType() {
        return this.ooType;
    }
    
    public void setOoType(Long type) {
        this.ooType = type;
    }
    
    public void setIcon(String icon) {
        this.ooIcon = icon;
    }

    public String getIcon() {
        return this.ooIcon;
    }
    
    public Boolean getOoCompleted() {
        return this.ooCompleted;
    }
    
    public void setOoCompleted(Boolean completed) {
        this.ooCompleted = completed;
    }
    
    public Long getParent() {
        return this.ooParent;
    }

    public void setParent(Long parent) {
        this.ooParent = parent;
    }
    
    // Getter/Setter Location
    public Long getLocId() {
        return this.locId;
    }
    
    public void setLocId(Long id) {
        this.locId = id;
    }
    
    public String getLocName() {
        return this.locName;
    }
    
    public void setLocName(String name) {
        this.locName = name;
    }
    
     public String getLocDescription() {
        return this.locDescription;
    }

    public void setLocDescription(String description) {
        this.locDescription = description;
    }

    public String getLocCountry() {
        return this.locCountry;
    }

    public void setLocCountry(String country) {
        this.locCountry = country;
    }

    public String getLocStreet() {
        return this.locStreet;
    }

    public void setLocStreet(String street) {
        this.locStreet = street;
    }

    public String getLocHousenumber() {
        if(this.locHousenumber==null)
            return "-";
        return this.locHousenumber;
    }

    public void setLocHousenumber(String housenumber) {
        this.locHousenumber = housenumber;
    }

    public String getLocPostcode() {
        return this.locPostcode;
    }

    public void setLocPostcode(String postcode) {
        this.locPostcode = postcode;
    }

    public String getLocCity() {
        return this.locCity;
    }

    public void setLocCity(String city) {
        this.locCity = city;
    }

    public String getLocFloor() {
        return this.locFloor;
    }

    public void setLocFloor(String floor) {
        this.locFloor = floor;
    }

    public String getLocApartment() {
        return this.locApartment;
    }

    public void setLocApartment(String apartment) {
        this.locApartment = apartment;
    }

    public String getLocRoom() {
        return this.locRoom;
    }

    public void setLocRoom(String room) {
        this.locRoom = room;
    }
    
    public Double getLocLatitude() {
        return this.locLatitude;
    }
    
    public void setLocLatitude(String latitude) {
        this.locLatitude = Double.valueOf(latitude);
    }
    
    public Double getLocLongitude() {
        return this.locLongitude;
    }
    
    public void setLocLongitude(String longitude) {
        this.locLongitude = Double.valueOf(longitude);
    }
    
    // convert latitude/longitude to Geometry Type
    public Geometry getGeoObject() {
        return point(WGS84,g(this.locLongitude, this.locLatitude));
    }
    
    // Getter/Setter Dates
    public LocalDateTime getValid_from() {
        return valid_from;
    }

    public void setValid_from(LocalDateTime valid_from) {
        this.valid_from = valid_from;
    }

    public LocalDateTime getValid_until() {
        return valid_until;
    }

    public void setValid_until(LocalDateTime valid_until) {
        this.valid_until = valid_until;
    }
    
}
