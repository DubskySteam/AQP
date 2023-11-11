package de.fhbielefeld.smartmonitoring.jpa;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
@Table(name = "tbl_measurement_type", schema = "smartmonitoring")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TblMeasurementType.findAll", query = "SELECT t FROM TblMeasurementType t")
    ,
    @NamedQuery(name = "TblMeasurementType.findById", query = "SELECT t FROM TblMeasurementType t WHERE t.id = :id")
    ,
    @NamedQuery(name = "TblMeasurementType.findByName", query = "SELECT t FROM TblMeasurementType t WHERE t.name = :name")
    ,
    @NamedQuery(name = "TblMeasurementType.findByType", query = "SELECT t FROM TblMeasurementType t WHERE t.type = :type")
})
@Schema(name="TblMeasurementType", description="A type of measurement value")
public class TblMeasurementType implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 1, max = 255)
    @Column(nullable = false, length = 255, unique=true)
    @Schema(description = "Measurement types name")
    private String name;
    
    @Size(min = 0, max = 255)
    @Column(nullable = true, length = 255)
    @Schema(description = "Description of the type of data collected with this type")
    private String description;
    
    @Size(min = 1, max = 45)
    @Column(nullable = false, length = 45)
    @Schema(description = "The SQL column type")
    private String type;
   
    @Size(min = 0, max = 45)
    @Column(nullable = true, length = 45)
    @Schema(description = "Name of the physical unit belonging to values of this type")
    private String unit;
    
    @OneToMany(mappedBy = "measurementType", cascade = CascadeType.ALL, orphanRemoval= true)
    @Schema(description = "List of observedobject types where this measurementtype is used")
    private Collection<TblOoTypeJoinMType> ooTypeJoinMTypes = new ArrayList<>();

    public TblMeasurementType() {
    }

    public TblMeasurementType(Long id) {
        this.id = id;
    }

    public TblMeasurementType(Long id, String name, String type) {
        this.id = id;
        this.name = name;
        this.type = type;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    /**
     * Returns the phyical unit
     *
     * @return physical unit
     */
    public String getUnit() {
        return unit;
    }

    /**
     * Sets the physical unit
     *
     * @param unit Physical unit
     */
    public void setUnit(String unit) {
        this.unit = unit;
    }

    @XmlTransient
    public Collection<TblOoTypeJoinMType> getOoTypeJoinMTypes() {
        return ooTypeJoinMTypes;
    }

    public void setOoTypeJoinMTypes(Collection<TblOoTypeJoinMType> ooTypeJoinMTypes) {
        this.ooTypeJoinMTypes = ooTypeJoinMTypes;
    }
    
    public void addOoTypeJoinMType(TblOoTypeJoinMType joiner) {
        this.ooTypeJoinMTypes.add(joiner);
        if(joiner.getMeasurementType() != this) {
            joiner.setMeasurementType(this);
        }
    }
}
