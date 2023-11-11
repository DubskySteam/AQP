package de.fhbielefeld.smartmonitoring.jpa;

import java.io.Serializable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.xml.bind.annotation.XmlRootElement;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

@Entity
@Table(name = "tbl_systemconfiguration", schema = "smartmonitoring")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "TblSystemConfiguration.findAll", query = "SELECT t FROM TblSystemConfiguration t"),
    @NamedQuery(name = "TblSystemConfiguration.findByCkey", query = "SELECT t FROM TblSystemConfiguration t WHERE t.ckey = :ckey")
})
@Schema(name="TblSystemConfiguration", description = "Configuration entry")
public class TblSystemConfiguration implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Schema(description = "Configuration entries name")
    private String ckey;
    @Schema(description = "Configuration entries value")
    private String cvalue;
    @Schema(description = "Configuration entries datatype")
    private String ctype;
    @Schema(description = "Configuration entries active state")
    private Boolean active;
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKey() {
        return this.ckey;
    }

    public void setKey(String key) {
        this.ckey = key;
    }

    public String getValue() {
        return this.cvalue;
    }

    public void setValue(String value) {
        this.cvalue = value;
    }

    public String getType() {
        return this.ctype;
    }

    public void setType(String type) {
        this.ctype = type;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
