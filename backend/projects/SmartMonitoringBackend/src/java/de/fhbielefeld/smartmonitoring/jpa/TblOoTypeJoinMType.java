package de.fhbielefeld.smartmonitoring.jpa;

import java.io.Serializable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.xml.bind.annotation.XmlRootElement;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
@Table(name = "tbl_ootype_join_mtype", schema = "smartmonitoring")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TblOoTypeJoinMType.findAll", query = "SELECT t FROM TblOoTypeJoinMType t"),
    @NamedQuery(name = "TblOoTypeJoinMType.findById", query = "SELECT t FROM TblOoTypeJoinMType t WHERE t.id = :id"),
    @NamedQuery(name = "TblOoTypeJoinMType.findByName", query = "SELECT t FROM TblOoTypeJoinMType t WHERE t.name = :name")
})
@Schema(name="TblOoTypeJoinMType", description="Connection between observedobjecttype and measurementtype")
public class TblOoTypeJoinMType implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Schema(description = "Measurments name (column name) when used at the observedobject")
    private String name;
    @Schema(description = "Measurements description when used at the observedobject")
    private String description;

//    @ManyToOne(cascade = CascadeType.PERSIST)
//    @JoinColumn(name = "observedobjecttype_id", referencedColumnName = "id", nullable = false)
//    @Schema(description = "ObservedObjectType where this connection is used")
//    private TblObservedObjectType observedobjectType;
//    @ManyToOne(cascade = CascadeType.PERSIST)
//    @JoinColumn(name = "measurementtype_id", referencedColumnName = "id", nullable = false)
//    @Schema(description = "MeasurementType that is used in this connection")
//    private TblMeasurementType measurementType;
    
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "observedobjecttype_name", referencedColumnName = "name", nullable = false)
    @Schema(description = "ObservedObjectType where this connection is used")
    private TblObservedObjectType observedobjectType;
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "measurementtype_name", referencedColumnName = "name", nullable = false)
    @Schema(description = "MeasurementType that is used in this connection")
    private TblMeasurementType measurementType;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        if (this.description == null || this.description.isEmpty()) {
            return this.measurementType.getDescription();
        } else {
            return this.description;
        }
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TblObservedObjectType getObservedobjectType() {
        return observedobjectType;
    }

    public void setObservedobjectType(TblObservedObjectType observedobjectType) {
        this.observedobjectType = observedobjectType;
        if (!observedobjectType.getOoTypeJoinMtypes().contains(this)) {
            observedobjectType.addOoTypeJoinMtype(this);
        }
    }

    public TblMeasurementType getMeasurementType() {
        return measurementType;
    }

    public void setMeasurementType(TblMeasurementType measurementtype) {
        this.measurementType = measurementtype;
        if (!measurementtype.getOoTypeJoinMTypes().contains(this)) {
            measurementtype.addOoTypeJoinMType(this);
        }
    }
}
