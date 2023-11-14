package de.fhbielefeld.smartuser.persistence.jpa;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.Basic;
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
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * Represents an Resource.
 * 
 * @author ffehring
 */
@Entity
@Table(name = "resources", schema = "smartuser", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"path"})})
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Resource.findAll", query = "SELECT t FROM Resource t"),
    @NamedQuery(name = "Resource.findById", query = "SELECT t FROM Resource t WHERE t.id = :id"),
    @NamedQuery(name = "Resource.findByPath", query = "SELECT t FROM Resource t WHERE t.path = :path")})
public class Resource implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(nullable = false)
    private Long id;
    
    private String path;
    
    @OneToMany(cascade = CascadeType.ALL, mappedBy="resource")
    private List<UserRight> rights = new ArrayList<>();

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }
    
    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public List<UserRight> getRights() {
        return rights;
    }

    public void setRights(List<UserRight> rights) {
        this.rights = rights;
    }
}
