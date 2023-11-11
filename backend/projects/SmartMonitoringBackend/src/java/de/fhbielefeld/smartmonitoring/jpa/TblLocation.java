package de.fhbielefeld.smartmonitoring.jpa;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.geolatte.geom.Geometry;

@Entity
@Table(name = "tbl_location", schema = "smartmonitoring")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TblLocation.findAll", query = "SELECT t FROM TblLocation t"),
    @NamedQuery(name = "TblLocation.findById", query = "SELECT t FROM TblLocation t WHERE t.id = :id"),
    @NamedQuery(name = "TblLocation.findByName", query = "SELECT t FROM TblLocation t WHERE t.name = :name"),
    @NamedQuery(name = "TblLocation.findByDescription", query = "SELECT t FROM TblLocation t WHERE t.description = :description")})
@Schema(name="TblLocation", description="A location for datasets, observedobjects and other things")
public class TblLocation implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 10485760)
    @Column(nullable = false, length = 10485760)
    @Schema(description = "Locations name")
    private String name;
    @Size(max = 10485760)
    @Column(length = 10485760)
    @Schema(description = "Locations description")
    private String description;
    @Schema(description = "Locations country")
    private String country;
    @Size(max = 10485760)
    @Column(length = 10485760)
    @Schema(description = "Locations street")
    private String street;
    @Schema(description = "Locations housenumber")
    private String housenumber;
    @Schema(description = "Locations zip code")
    private String postcode;
    @Schema(description = "Locations city name")
    private String city;
    @Schema(description = "Locations floor")
    private String floor;
    @Schema(description = "Locations apartment number")
    private String apartment;
    @Schema(description = "Locations room number")
    private String room;
    
    @Column(columnDefinition = "geometry(geometry,4326)")
    @Schema(description = "GeoLocation")
    private Geometry coordinates;

    public TblLocation() {
    }

    public TblLocation(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getHousenumber() {
        if(housenumber==null)
            return "-";
        return housenumber;
    }

    public void setHousenumber(String housenumber) {
        this.housenumber = housenumber;
    }

    public String getPostcode() {
        return postcode;
    }

    public void setPostcode(String postcode) {
        this.postcode = postcode;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public String getApartment() {
        return apartment;
    }

    public void setApartment(String apartment) {
        this.apartment = apartment;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }
    
    public Geometry getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(Geometry c) {
        this.coordinates = c;
    }
}