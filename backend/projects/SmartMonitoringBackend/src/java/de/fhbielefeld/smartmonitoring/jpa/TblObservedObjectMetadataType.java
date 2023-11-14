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
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
@Table(name = "tbl_observedobject_metadata_type", schema = "smartmonitoring")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TblObservedObjectMetadataType.findAll", query = "SELECT t FROM TblObservedObjectMetadataType t")
    ,
    @NamedQuery(name = "TblObservedObjectMetadataType.findByName", query = "SELECT t FROM TblObservedObjectMetadataType t WHERE t.name = :name")
    ,
    @NamedQuery(name = "TblObservedObjectMetadataType.findById", query = "SELECT t FROM TblObservedObjectMetadataType t WHERE t.id = :id")
})
@Schema(name="TblObservedObjectMetadataType", description="Type of an metadata describing its name and purpose")
public class TblObservedObjectMetadataType implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 1, max = 255)
    @Column(nullable = false, length = 255, unique = true)
    @Schema(description = "Metadatas name")
    private String name;

    @Size(min = 0, max = 255)
    @Column(nullable = true, length = 255)
    @Schema(description = "Metadatas description")
    private String description;

    @OneToMany(mappedBy = "ooMetadataType", cascade = CascadeType.ALL, orphanRemoval = true)
    @Schema(description = "List of connections where this metadatatype can be used")
    private Collection<TblOoTypeJoinOoMetadataType> ootypejoinoometadatatypes = new ArrayList<>();

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return this.id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setDescription(String desc) {
        description = desc;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Get the available joiners to ObservedObjectTypes for this metadatatype
     *
     * @return Collection of joiners to OoTypes
     */
    public Collection<TblOoTypeJoinOoMetadataType> getOoTypeJoinOoMetadataTypes() {
        return ootypejoinoometadatatypes;
    }

    /**
     * Adds an single joiner to a ObservedObjectType to this metadatatype.
     *
     * @param ooTypeJoinOoMetadataType
     */
    public void addOoTypeJoinOoMetadataType(TblOoTypeJoinOoMetadataType ooTypeJoinOoMetadataType) {
        this.ootypejoinoometadatatypes.add(ooTypeJoinOoMetadataType);
        if (ooTypeJoinOoMetadataType.getOoMetadataType() == null || !ooTypeJoinOoMetadataType.getOoMetadataType().equals(this)) {
            ooTypeJoinOoMetadataType.setOoMetadataType(this);
        }
    }

    /**
     * Sets the available joiners to ObservedObjectTypes for this metadatatype
     *
     * @param ooTypeJoinOoMetadataTypes
     */
    public void setOoTypeJoinOoMetadataTypes(Collection<TblOoTypeJoinOoMetadataType> ooTypeJoinOoMetadataTypes) {
        this.ootypejoinoometadatatypes = ooTypeJoinOoMetadataTypes;
    }
}
