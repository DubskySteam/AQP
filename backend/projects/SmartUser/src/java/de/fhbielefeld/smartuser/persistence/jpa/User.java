package de.fhbielefeld.smartuser.persistence.jpa;

import de.fhbielefeld.scl.security.hash.MD5;
import de.fhbielefeld.smartuser.application.Usermanager;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * Entity zur Tabelle der Benutzer aus der Datenbank
 * @author Nils Leunig
 */
@Entity
@Table(name = "users", schema = "smartuser", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"username"})})
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "User.count", query = "SELECT COUNT(t) FROM User t"),
    @NamedQuery(name = "User.findAll", query = "SELECT t FROM User t"),
    @NamedQuery(name = "User.findById", query = "SELECT t FROM User t WHERE t.id = :id"),
    @NamedQuery(name = "User.findByUsername", query = "SELECT t FROM User t WHERE t.username = :username"),
    @NamedQuery(name = "User.findByPassword", query = "SELECT t FROM User t WHERE t.password = :password"),
    @NamedQuery(name = "User.findByAuthtoken", query = "SELECT t FROM User t WHERE t.authtoken = :authtoken"),
    @NamedQuery(name = "User.findByFirstname", query = "SELECT t FROM User t WHERE t.firstname = :firstname"),
    @NamedQuery(name = "User.findByLastname", query = "SELECT t FROM User t WHERE t.lastname = :lastname"),
    @NamedQuery(name = "User.findByEmail", query = "SELECT t FROM User t WHERE t.email = :email"),
    @NamedQuery(name = "User.login", query = "SELECT t FROM User t WHERE t.username = :username AND t.password = :password"),
    @NamedQuery(name = "User.findByPhone", query = "SELECT t FROM User t WHERE t.phone = :phone"),
    @NamedQuery(name = "User.findByConfirmToken", query = "SELECT t FROM User t WHERE t.confirmToken = :confirmToken"),
    @NamedQuery(name = "User.findByOneloginToken", query = "SELECT t FROM User t WHERE t.oneloginToken = :oneloginToken"),
    @NamedQuery(name = "User.findParentAccounts", query="SELECT DISTINCT t.parent FROM User t WHERE t.parent IS NOT NULL")})
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(nullable = false)
    private Long id;
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 255)
    @Column(nullable = false, length = 255)
    private String username;
    
    @Basic(optional = false)
    @NotNull
    @Size(min = 0, max = 255)
    @Column(nullable = true, length = 255)
    private String password;
    
    @Size(max = 45)
    @Column(length = 45)
    private String authtoken;
    
    @Size(max = 45)
    @Column(length = 45)
    private String firstname;
    
    @Size(max = 45)
    @Column(length = 45)
    private String lastname;
    
    @Size(max = 254)
    @Column(length = 254)
    private String street;
    
    @Size(max = 12)
    @Column(length = 12)
    private String houseno;
   
    @Size(max = 12)
    @Column(length = 12)
    private String zipcode;
    
    @Size(max = 255)
    @Column(length = 255)
    private String city;
    
    @Size(max = 255)
    @Column(length = 255)
    private String country;
    
    // @Pattern(regexp="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?", message="Invalid email")//if the field contains email address consider using this annotation to enforce field validation
    @Size(max = 255)
    @Column(length = 255)
    private String email;
    
    // @Pattern(regexp="^\\(?(\\d{3})\\)?[- ]?(\\d{3})[- ]?(\\d{4})$", message="Invalid phone/fax format, should be as xxx-xxx-xxxx")//if the field contains phone or fax number consider using this annotation to enforce field validation
    @Size(max = 45)
    @Column(length = 45)
    private String phone;

    private String lang;
    
    private String confirmToken;
    
    private boolean confirmed;
    
    private String oneloginToken;
    
    private boolean privacy_accepted = false;
    
    private boolean terms_accepted = false;
    
    private boolean isadmin = false;
    
    @Column(nullable = true)
    private LocalDateTime lastlogin;
    
    @ManyToOne
    private User parent;
    
    @OneToMany(cascade = CascadeType.ALL, mappedBy="user")
    private List<UserRight> rights = new ArrayList<>();

    @Transient
    private Usermanager manageingum;
    
    public User() {
    }

    /**
     * Konstruktor
     * @param id Entitie Id des neuen Objekts
     */
    public User(Long id) {
        this.id = id;
    }

    /**
     * Knstruktor
     * @param id Entitie Id des neuen Objekts
     * @param username Benutzername des neuen Objekts
     * @param password Password des neuen Objekts
     */
    public User(Long id, String username, String password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }

    /**
     * Copy constructor
     * 
     * @param user user to copy
     */
    public User(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.authtoken = user.getAuthtoken();
        this.email = user.getEmail();
        this.firstname = user.getFirstname();
        this.lastname = user.getLastname();
        this.street = user.getStreet();
        this.houseno = user.getHouseno();
        this.zipcode = user.getZipcode();
        this.city = user.getCity();
        this.country = user.getCountry();
        this.phone = user.getPhone();
        this.password = user.getPassword();
    }
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAuthtoken() {
        return authtoken;
    }

    public void setAuthtoken(String authtoken) {
        this.authtoken = authtoken;
    }
    
    public String generateAuthtoken() {
        this.authtoken = MD5.generateTimetoken("usergeneratedtoken" + this.getId());
        return this.authtoken;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getHouseno() {
        return houseno;
    }

    public void setHouseno(String houseno) {
        this.houseno = houseno;
    }

    public String getZipcode() {
        return zipcode;
    }

    public void setZipcode(String zipcode) {
        this.zipcode = zipcode;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    public String getConfirmToken() {
        return confirmToken;
    }

    public void setConfirmToken(String confirmToken) {
        this.confirmToken = confirmToken;
    }

    public boolean isConfirmed() {
        return confirmed;
    }

    public void setConfirmed(boolean confirmed) {
        this.confirmed = confirmed;
    }

    public String getOneloginToken() {
        return oneloginToken;
    }

    public void setOneloginToken(String oneloginToken) {
        this.oneloginToken = oneloginToken;
    }

    public boolean isPrivacy_accepted() {
        return privacy_accepted;
    }

    public void setPrivacy_accepted(boolean privacy_accepted) {
        this.privacy_accepted = privacy_accepted;
    }

    public boolean isTerms_accepted() {
        return terms_accepted;
    }

    public void setTerms_accepted(boolean terms_accepted) {
        this.terms_accepted = terms_accepted;
    }

    public boolean isIsadmin() {
        return isadmin;
    }

    public void setIsadmin(boolean isadmin) {
        this.isadmin = isadmin;
    }

    public LocalDateTime getLastlogin() {
        return lastlogin;
    }

    public void setLastlogin(LocalDateTime lastlogin) {
        this.lastlogin = lastlogin;
    }
    
    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof User)) {
            return false;
        }
        User other = (User) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "de.fhbielefeld.scl.usermanager.persistence.jpa.User[ id=" + id + " ]";
    }
    
    public User getParent() {
        return parent;
    }

    public void setParent(User parent) {
        this.parent = parent;
    }

    public Usermanager getManageingum() {
        return manageingum;
    }

    public void setManageingum(Usermanager manageingum) {
        this.manageingum = manageingum;
    }
}
