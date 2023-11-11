package de.fhbielefeld.smartmonitoring.jpa;

import java.io.Serializable;
import java.util.*;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
@Table(name = "tbl_observedobject", schema = "smartmonitoring")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TblObservedObject.findAll", query = "SELECT t FROM TblObservedObject t ORDER BY t.id"),
    @NamedQuery(name = "TblObservedObject.findById", query = "SELECT t FROM TblObservedObject t WHERE t.id = :id"),
    @NamedQuery(name = "TblObservedObject.findByMAC", query = "SELECT t FROM TblObservedObject t WHERE t.mac = :mac"),
    @NamedQuery(name = "TblObservedObject.findByName", query = "SELECT t FROM TblObservedObject t WHERE t.name = :name"),
    @NamedQuery(name = "TblObservedObject.findByNamePart", query = "SELECT t FROM TblObservedObject t WHERE t.name LIKE :name"),
    @NamedQuery(name = "TblObservedObject.findByType", query = "SELECT t FROM TblObservedObject t WHERE t.type = :type"),
    @NamedQuery(name = "TblObservedObject.findByParent", query = "SELECT t FROM TblObservedObject t WHERE t.parent = :parent ORDER BY t.name"),
    @NamedQuery(name = "TblObservedObject.findByNullParent", query = "SELECT t FROM TblObservedObject t WHERE t.parent IS NULL ORDER BY t.name")
})
@Schema(name="TblObservedObject", description="A dataset about an device or organisational unit. Describing the object and its organisation.")
public class TblObservedObject implements Serializable {

    private static final long serialVersionUID = -2823851731510648605L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true, length = 255)
    @Schema(description = "ObservedObject Device MAC Address")
    private String mac;
    
    @Column(nullable = true, length = 255)
    @Schema(description = "ObservedObject Device IP Address")
    private String ip;
    
    @Size(min = 1, max = 255)
    @Column(nullable = false, length = 255)
    @Schema(description = "ObservedObjects name")
    private String name = "unkown";

    @Column(nullable = true, length = 255)
    @Schema(description = "Description of the intention and use of this observedobject")
    private String description;

    @Column(nullable = true, length = 50)
    @Schema(description = "Name of the collection where data for this observedobject is stored")
    private String collection;
    
    @Column(name= "collection_media", nullable = true, length = 50)
    @Schema(description = "Name of the collection where media files for this observedobject are stored")
    private String collectionMedia;

    @Schema(description = "Indicates if the observedobject acceppts new data")
    private Boolean dataCapture = false;

    @Schema(description = "Indicates, if manual measurement entries are allowed")
    private Boolean manualCapture = false;

    @JoinColumn(name = "type_id", referencedColumnName = "id", nullable = false)
    @ManyToOne
    @Schema(description = "Observedobjects type. The type decides which values could be collected by this observedobject.")
    private TblObservedObjectType type;

    @Schema(description = "Path to a media file used as symbol for this observedobject.")
    private String icon;
    
    @Schema(description = "Status of obervedobject")
    private Boolean completed;

    // Parent observed object in hierarchy
    @JoinColumn(name = "parent_id", referencedColumnName = "id")
    @ManyToOne
    @Schema(description = "Hierarchical parent")
    private TblObservedObject parent;

    @OneToMany(mappedBy = "parent")
    @Schema(description = "List of observedobjects below this one in hierarchy")
    private List<TblObservedObject> childs = new ArrayList<>();

    // Configurations available for this observed object (new style)
    @OneToMany(mappedBy = "observedobject", fetch = FetchType.LAZY)
    @Schema(description = "List of asosciated metadata")
    private List<TblObservedObjectMetadata> metadatas = new ArrayList<>();

    public TblObservedObject() {

    }

    public TblObservedObject(long id) {
        this.id = id;
    }

    public TblObservedObject(TblObservedObject toCopy) {
        this.id = toCopy.id;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMac() {
        return mac;
    }

    public void setMac(String mac) {
        this.mac = mac;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
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

    public String getCollection() {
        return collection;
    }

    public void setCollection(String collection) {
        this.collection = collection;
    }
    
    public String getCollectionMedia() {
        return collectionMedia;
    }

    public void setCollectionMedia(String collection) {
        this.collectionMedia = collection;
    }
    
    public Boolean getDataCapture() {
        return dataCapture;
    }

    public void setDataCapture(Boolean dataCapture) {
        this.dataCapture = dataCapture;
    }

    public Boolean getManualCapture() {
        return manualCapture;
    }

    public void setManualCapture(Boolean manualCapture) {
        this.manualCapture = manualCapture;
    }

    /**
     * Returns the type object for this observed object
     *
     * @return Type information
     */
    public TblObservedObjectType getType() {
        return this.type;
    }

    /**
     * Sets the type information for this observedobject
     *
     * @param type Typeinformation
     */
    public void setType(TblObservedObjectType type) {
        this.type = type;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getIcon() {
        return this.icon;
    }
    
    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
    
    public Boolean getCompleted() {
        return this.completed;
    }

    /**
     * Gets the parent observed object for this object
     *
     * @return Next top element in object hierarchy
     */
    public TblObservedObject getParent() {
        return parent;
    }

    /**
     * Sets the parent observed object for this object
     *
     * @param _parent Next top element
     */
    public void setParent(TblObservedObject _parent) {
        this.parent = _parent;
    }

    /**
     * Checks if the object has an parent
     *
     * @return false if {@link TblObservedObject} has no parent
     */
    public boolean hasParent() {
        return parent != null;
    }

    @XmlTransient
    public List<TblObservedObject> getChilds() {
        return childs;
    }

    public void setChilds(List<TblObservedObject> _childs) {
        this.childs = _childs;
    }

    public void addChild(TblObservedObject child) {
        if (!this.childs.contains(child)) {
            this.childs.add(child);
        }
    }

    /**
     * Checks if the object has children
     *
     * @return false if {@link TblObservedObject} has no children
     */
    public boolean hasChildren() {
        return !getChilds().isEmpty();
    }

    public List<TblObservedObjectMetadata> getMetadatas() {
        return metadatas;
    }

    public void addMetadata(TblObservedObjectMetadata metadata) {
        if (!this.metadatas.contains(metadata)) {
            this.metadatas.add(metadata);
            metadata.setObservedObject(this);
        }
    }

    public void setMetadatas(List<TblObservedObjectMetadata> metadatas) {
        this.metadatas = metadatas;
    }

    /**
     * Gets the metadata with the given name.
     *
     * @param metadataname Name of the requested metadata
     * @return Metadata or null if not existend
     */
    public TblObservedObjectMetadata getMetadata(String metadataname) {
        for (TblObservedObjectMetadata curMetadata : this.metadatas) {
            if (curMetadata.getName().equals(metadataname)) {
                return curMetadata;
            }
        }
        return null;
    }

    /**
     * Acces to an configuration entry with known name.
     *
     * @param key Name of the configuration entry
     * @return Value of the entry, or null if not existend
     */
    public String getMetadataValue(String key) {
        for (TblObservedObjectMetadata conf : this.metadatas) {
            if (conf.getType().getName().equals(key)) {
                return conf.getVal();
            }
        }
        return null;
    }

    /**
     * Checks if this observedobject contains an specified metadata with an
     * specified value.
     *
     * @param key Configurtion key to search
     * @param value Configuration value to search
     * @return true if configuration exists, false otherwise
     */
    public boolean containsMetadata(String key, String value) {
        for (TblObservedObjectMetadata conf : this.metadatas) {
            if (conf.getType().getName().equals(key) && conf.getVal().equals(value)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public String toString() {
        return "ref://observedobject/get/" + id;
    }
}
