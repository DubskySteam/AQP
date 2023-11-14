package de.fhbielefeld.smartmonitoring.jpa;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
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
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
@Table(name = "tbl_observedobject_type", schema = "smartmonitoring", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name"})})
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TblObservedObjectType.findAll", query = "SELECT t FROM TblObservedObjectType t"),
    @NamedQuery(name = "TblObservedObjectType.findById", query = "SELECT t FROM TblObservedObjectType t WHERE t.id = :id"),
    @NamedQuery(name = "TblObservedObjectType.findByName", query = "SELECT t FROM TblObservedObjectType t WHERE t.name = :name")
})
@Schema(name="TblObservedObjectType", description="Definition of an type for observedobjects. Describing possible collectable data and purpose")
public class TblObservedObjectType implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 1, max = 255)
    @Column(nullable = false, length = 255, unique=true)
    @Schema(description = "Types name")
    private String name;

    @Size(min = 0, max = 255)
    @Column(nullable = true, length = 255)
    @Schema(description = "Types description")
    private String description;

    @Schema(description = "Indicates, that the datasets are stored in flattend mode (u1,u2,...,uN)")
    private Boolean flatendSets = false;

    @Schema(description = "Path to a image file that is used as symbol for this type of observedobjects")
    private String icon;

    @OneToMany(mappedBy = "observedobjectType", cascade = CascadeType.ALL, orphanRemoval = true)
    @Schema(description = "Definitions of values (columns) that can be collected by an observedobject of this type")
    private Collection<TblOoTypeJoinMType> ootypejoinmtypes = new ArrayList<>();

    @OneToMany(mappedBy = "observedObjectType", cascade = CascadeType.ALL, orphanRemoval = true)
    @Schema(description = "Definitions of metadata that can be used at observedobjects of this type")
    private Collection<TblOoTypeJoinOoMetadataType> ootypejoinoometadatatypes = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        if (!this.name.equals("")) {
            return name;
        }
        return "unkown";
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

    public Boolean hasFlatendSets() {
        return flatendSets;
    }

    public void setFlatendSets(Boolean flatendSets) {
        this.flatendSets = flatendSets;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getIcon() {
        return this.icon;
    }

    @XmlTransient
    public Collection<TblOoTypeJoinMType> getOoTypeJoinMtypes() {
        return ootypejoinmtypes;
    }

    public void setOoTypeJoinMtypes(Collection<TblOoTypeJoinMType> ootypejoinmtypes) {
        this.ootypejoinmtypes = ootypejoinmtypes;
    }

    public void addOoTypeJoinMtype(TblOoTypeJoinMType joiner) {
        // Check if joiner allready exists
        if (!this.ootypejoinmtypes.contains(joiner)) {
            this.ootypejoinmtypes.add(joiner);
            if (joiner.getObservedobjectType() != this) {
                joiner.setObservedobjectType(this);
            }
        }
    }

    @XmlTransient
    public Collection<TblMeasurementType> getMeasurementtypes() {
        List<TblMeasurementType> mesurementtypes = new ArrayList<>();

        for (TblOoTypeJoinMType curJoiner : this.getOoTypeJoinMtypes()) {
            mesurementtypes.add(curJoiner.getMeasurementType());
        }

        return mesurementtypes;
    }

    /**
     * Checks if this type has a joiner to a measurementtype with the given name
     *
     * @param name Expected measurement name, alias or importkey
     * @return true if found
     */
    public boolean isOoTypeJoinMTypeExisting(String name) {
        for (TblOoTypeJoinMType curJoiner : this.ootypejoinmtypes) {
            if (curJoiner.getMeasurementType().getName().equalsIgnoreCase(name)) {
                return true;
            }
            if (curJoiner.getName().equalsIgnoreCase(name)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets the joiner to measurementtype with the given name
     *
     * @param name Name of the joiner (alias or measurementtypename)
     * @return MeasurementJoiner with the given name of null if not found
     */
    public TblOoTypeJoinMType getOoTypeJoinMType(String name) {
        for (TblOoTypeJoinMType curJoiner : this.ootypejoinmtypes) {
            if (curJoiner.getName().equalsIgnoreCase(name)) {
                return curJoiner;
            }
        }
        return null;
    }

    /**
     * Get joiner to metadatatype with the given name.
     *
     * @param name Name of the metadatatype
     * @return Joner to the metadatatype
     */
    public TblOoTypeJoinOoMetadataType getOoTypeJoinOoMetadataType(String name) {
        for (TblOoTypeJoinOoMetadataType joiner : this.ootypejoinoometadatatypes) {
            if (joiner.getName().equals(name)) {
                return joiner;
            }
        }
        return null;
    }

    /**
     * Get the available metadatatypes for this observedobject type
     *
     * @return Collection of joiners to ObservedObjectMetadataType
     */
    public Collection<TblOoTypeJoinOoMetadataType> getOoTypeJoinOoMetadataTypes() {
        return ootypejoinoometadatatypes;
    }

    /**
     * Adds an single metadatatype to this observedobjecttype.
     *
     * @param ooTypeJoinOoMetadataType Type of metadata to add
     */
    public void addOoTypeJoinOoMetadataType(TblOoTypeJoinOoMetadataType ooTypeJoinOoMetadataType) {
        this.ootypejoinoometadatatypes.add(ooTypeJoinOoMetadataType);
        if (ooTypeJoinOoMetadataType.getObservedObjectType() == null || !ooTypeJoinOoMetadataType.getObservedObjectType().equals(this)) {
            ooTypeJoinOoMetadataType.setObservedObjectType(this);
        }
    }

    /**
     * Sets the available metadatatypes types for this observedobject type
     *
     * @param ooTypeJoinOoMetadataTypes
     */
    public void setOoTypeJoinOoMetadataTypes(Collection<TblOoTypeJoinOoMetadataType> ooTypeJoinOoMetadataTypes) {
        this.ootypejoinoometadatatypes = ooTypeJoinOoMetadataTypes;
    }
}
