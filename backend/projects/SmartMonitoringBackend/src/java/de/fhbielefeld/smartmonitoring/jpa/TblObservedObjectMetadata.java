package de.fhbielefeld.smartmonitoring.jpa;

import java.io.Serializable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.xml.bind.annotation.XmlRootElement;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
@Table(name = "tbl_observedobject_metadata", schema = "smartmonitoring")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TblObservedObjectMetadata.findAll", query = "SELECT t FROM TblObservedObjectMetadata t"),
    @NamedQuery(name = "TblObservedObjectMetadata.findByValue", query = "SELECT t FROM TblObservedObjectMetadata t WHERE t.val = :val"),
    @NamedQuery(name = "TblObservedObjectMetadata.findById", query = "SELECT t FROM TblObservedObjectMetadata t WHERE t.id = :id"),
    @NamedQuery(name = "TblObservedObjectMetadata.findByObservedObjectId", query = "SELECT t FROM TblObservedObjectMetadata t WHERE t.observedobject.id = :ooid"),
    @NamedQuery(name = "TblObservedObjectMetadata.findByValuePart", query = "SELECT t FROM TblObservedObjectMetadata t WHERE t.val LIKE :valuepart")
})
@Schema(name="TblObservedObjectMetadata", description="A metadata about an observedobject")
public class TblObservedObjectMetadata implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Schema(description = "Metadatas value")
    private String val;

    @ManyToOne
    @JoinColumn(name = "observedobject_id", nullable = false)
    @Schema(description = "Observedobject the metadata belongs to")
    private TblObservedObject observedobject;

    @OneToOne
    @JoinColumn(name = "type_id", nullable = false)
    @Schema(description = "Type of metadata")
    private TblObservedObjectMetadataType type;

    public TblObservedObjectMetadata() {
    }

    public TblObservedObjectMetadata(Long id) {
        this.id = id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return this.id;
    }

    public void setVal(String val) {
        this.val = val;
    }

    public String getVal() {
        return val;
    }

    public void setObservedObject(TblObservedObject object) {
        if (observedobject != object){
            observedobject = object;
            object.addMetadata(this);
        }
    }

    public TblObservedObject getObservedObject() {
        return observedobject;
    }

    public void setType(TblObservedObjectMetadataType type) {
        this.type = type;
    }

    public TblObservedObjectMetadataType getType() {
        return this.type;
    }
    
    /**
     * Returns the name of this configuration entry derivated from the underliing
     * configurationtype.
     * 
     * @return Configuration name
     */
    public String getName() {
        return this.type.getName();
    }
    
    /**
     * Returns the description of this configuration entry derivated from the 
     * underliing configurationtype.
     * 
     * @return Configuration description
     */
    public String getDescription() {
        return this.type.getDescription();
    }
}
