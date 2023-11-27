package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "profilesettings", schema = "smartsocial")
@NamedQueries({
        @NamedQuery(name = "ProfileSetting.findAll", query = "SELECT p FROM ProfileSetting p"),
        @NamedQuery(name = "ProfileSetting.findById", query = "SELECT p FROM ProfileSetting p WHERE p.id = :id"),
        @NamedQuery(name = "ProfileSetting.findByProfileVisibility", query = "SELECT p FROM ProfileSetting p WHERE p.profileVisibility = :profileVisibility"),
        @NamedQuery(name = "ProfileSetting.findByNotificationsEnabled", query = "SELECT p FROM ProfileSetting p WHERE p.notificationsEnabled = :notificationsEnabled")
})
public class ProfileSetting {
    @Id
    @Column(name = "user_id", nullable = false)
    private Integer id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User users;

    @Size(max = 50)
    @NotNull
    @Column(name = "profile_visibility", nullable = false, length = 50)
    private String profileVisibility;

    @NotNull
    @Column(name = "notifications_enabled", nullable = false)
    private Boolean notificationsEnabled = false;

    @Column(name = "additional_settings")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> additionalSettings;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUsers() {
        return users;
    }

    public void setUsers(User users) {
        this.users = users;
    }

    public String getProfileVisibility() {
        return profileVisibility;
    }

    public void setProfileVisibility(String profileVisibility) {
        this.profileVisibility = profileVisibility;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public Map<String, Object> getAdditionalSettings() {
        return additionalSettings;
    }

    public void setAdditionalSettings(Map<String, Object> additionalSettings) {
        this.additionalSettings = additionalSettings;
    }

}