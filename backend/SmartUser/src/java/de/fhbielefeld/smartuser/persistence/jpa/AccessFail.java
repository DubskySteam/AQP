package de.fhbielefeld.smartuser.persistence.jpa;

import java.io.Serializable;
import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * Represents an access failure entry
 * 
 * @author ffehring
 */
@Entity
@Table(name = "accessfail", schema = "smartuser")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "AccessFail.findAll", query = "SELECT t FROM AccessFail t"),
    @NamedQuery(name = "AccessFail.findById", query = "SELECT t FROM AccessFail t WHERE t.id = :id"),
    @NamedQuery(name = "AccessFail.findByResource", query = "SELECT t FROM AccessFail t WHERE t.resource = :resource"),
    @NamedQuery(name = "AccessFail.findByResourceActionUser", query = "SELECT t FROM AccessFail t WHERE t.resource = :resource AND t.action = :action AND t.user = :user")})
public class AccessFail implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(nullable = false)
    private Long id;
    
    private String resource;
    
    private String action;
    
    @ManyToOne(cascade = CascadeType.REMOVE)
    private User user;

    public AccessFail() {
    
    }
    
    public AccessFail(String resource, String action, User user) {
        this.resource = resource;
        this.action = action;
        this.user = user;
    }
    
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }
    
    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
