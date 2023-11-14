package de.fhbielefeld.smartmonitoring.jpaproxy;

import java.io.Serializable;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@XmlRootElement
@Schema(name="TblObservedObjectProxy", description="A dataset about an device or organisational unit. Describing the object and its organisation.")
public class TblObservedObjectProxy implements Serializable {

    private Long id;

    @Size(min = 1, max = 255)
    @Schema(description = "ObservedObjects name")
    private String name = "unkown";
    
    @Schema(description = "ObservedObject Device MAC Address")
    private String mac;

    @Schema(description = "Description of the intention and use of this observedobject")
    private String description;

    @Schema(description = "Name of the collection where data for this observedobject is stored")
    private String collection;

    @Schema(description = "Indicates if the observedobject acceppts new data")
    private Boolean dataCapture = false;

    @Schema(description = "Indicates, if manual measurement entries are allowed")
    private Boolean manualCapture = false;

    @Schema(description = "Observedobjects type. The type decides which values could be collected by this observedobject.")
    private Long type;

    @Schema(description = "Path to a media file used as symbol for this observedobject.")
    private String icon;
    
    @Schema(description = "Status of observed object")
    private Boolean completed;

    @Schema(description = "Id of observedobjects hierarchical parent")
    private Long parent;

    public TblObservedObjectProxy() {

    }

    public TblObservedObjectProxy(long id) {
        this.id = id;
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

    public Long getType() {
        return this.type;
    }

    public void setType(Long type) {
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
    
    public Long getParent() {
        return this.parent;
    }

    public void setParent(Long parent) {
        this.parent = parent;
    }
}
