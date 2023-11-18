package de.fhbielefeld.smartuser.persistence.jpa;

import java.io.Serializable;
import jakarta.persistence.Basic;
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
 * Represents an right for an user and and resource.
 * 
 * @author ffehring
 */
@Entity
@Table(name = "userrights", schema = "smartuser")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "UserRight.findAll", query = "SELECT t FROM UserRight t"),
    @NamedQuery(name = "UserRight.findById", query = "SELECT t FROM UserRight t WHERE t.id = :id"),
    @NamedQuery(name = "UserRight.findByUser", query = "SELECT t FROM UserRight t WHERE t.user = :user"),
    @NamedQuery(name = "UserRight.findByResource", query = "SELECT t FROM UserRight t WHERE t.resource = :resource"),
    @NamedQuery(name = "UserRight.findByResourceAndAction", query = "SELECT t FROM UserRight t WHERE t.resource = :resource AND t.action = :action"),
    @NamedQuery(name = "UserRight.findByResourceAndUser", query = "SELECT t FROM UserRight t WHERE t.resource = :resource AND t.user = :user"),
    @NamedQuery(name = "UserRight.findByResourceAndActionAndUser", query = "SELECT t FROM UserRight t WHERE t.resource = :resource AND t.action = :action AND t.user = :user"),
    @NamedQuery(name = "UserRight.findLikeResource", query = "SELECT t FROM UserRight t WHERE t.resource.path LIKE CONCAT('%',:resource,'%') AND t.user = :user"),
    @NamedQuery(name = "UserRight.findLikeResourceAction", query = "SELECT t FROM UserRight t WHERE t.resource.path LIKE CONCAT('%',:resource,'%') AND t.action = :action AND t.user = :user")
})
public class UserRight implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(nullable = false)
    private Long id;
    
    @ManyToOne
    private User user;
    @ManyToOne
    private Resource resource;
    private String action;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}
