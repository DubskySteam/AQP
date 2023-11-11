package de.fhbielefeld.smartmonitoring.jpa;

import jakarta.persistence.CascadeType;
import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
@Table(name = "tbl_ootype_join_oometadatatype", schema = "smartmonitoring")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TblOoTypeJoinOoMetadataType.findAll", query = "SELECT t FROM TblOoTypeJoinOoMetadataType t"),
    @NamedQuery(name = "TblOoTypeJoinOoMetadataType.findById", query = "SELECT t FROM TblOoTypeJoinOoMetadataType t WHERE t.id = :id"),
    @NamedQuery(name = "TblOoTypeJoinOoMetadataType.findByObservedObjectTypeId", query = "SELECT t FROM TblOoTypeJoinOoMetadataType t WHERE t.observedObjectType.id = :ootype_id")
})
@Schema(name="TblOoTypeJoinOoMetadataType", description = "Connection between ObservedObjectType and MetadataType")
public class TblOoTypeJoinOoMetadataType implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 1, max = 255)
    @Column(nullable = false, length = 255)
    @Schema(description = "Metadatas name when used at the observedobject")
    private String name;

    @Schema(description = "Metadatas description when used at the observedobject")
    private String description;

    @Schema(description = "If false a once setted value cant be changed.")
    private Boolean editable;

//    @JoinColumn(name = "observedobjecttype_id", referencedColumnName = "id")
//    @ManyToOne
//    @Schema(description = "ObservedObjectType this connection belongs to")
//    private TblObservedObjectType observedObjectType;
//    @JoinColumn(name = "oometadatatype_id", referencedColumnName = "id", nullable = false)
//    @ManyToOne
//    @Schema(description = "MetadataType that should be useable at the observedobjecttype")
//    private TblObservedObjectMetadataType ooMetadataType;

    @JoinColumn(name = "observedobjecttype_name", referencedColumnName = "name")
    @ManyToOne(cascade = CascadeType.ALL)
    @Schema(description = "ObservedObjectType this connection belongs to")
    private TblObservedObjectType observedObjectType;
    @JoinColumn(name = "oometadatatype_name", referencedColumnName = "name")
    @ManyToOne(cascade = CascadeType.ALL)
    @Schema(description = "MetadataType that should be useable at the observedobjecttype")
    private TblObservedObjectMetadataType ooMetadataType;
    
    public TblOoTypeJoinOoMetadataType() {
    }

    public TblOoTypeJoinOoMetadataType(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public String getName() {
        if (this.name == null || this.name.isEmpty()) {
            return this.ooMetadataType.getName();
        } else {
            return this.name;
        }
    }

    public String getDescription() {
        if (this.description == null || this.description.isEmpty()) {
            return this.ooMetadataType.getDescription();
        } else {
            return this.description;
        }
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getEditable() {
        return editable;
    }

    public void setEditable(Boolean editable) {
        this.editable = editable;
    }

    public TblObservedObjectType getObservedObjectType() {
        return observedObjectType;
    }

    public void setObservedObjectType(TblObservedObjectType observedObjectType) {
        this.observedObjectType = observedObjectType;
        if (observedObjectType.getOoTypeJoinOoMetadataTypes() == null || !observedObjectType.getOoTypeJoinOoMetadataTypes().contains(this)) {
            observedObjectType.addOoTypeJoinOoMetadataType(this);
        }
    }

    public TblObservedObjectMetadataType getOoMetadataType() {
        return ooMetadataType;
    }

    public void setOoMetadataType(TblObservedObjectMetadataType ooMetadataType) {
        this.ooMetadataType = ooMetadataType;
        if (ooMetadataType.getOoTypeJoinOoMetadataTypes() == null || !ooMetadataType.getOoTypeJoinOoMetadataTypes().contains(this)) {
            ooMetadataType.addOoTypeJoinOoMetadataType(this);
        }
    }
}
