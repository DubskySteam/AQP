package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Entity
@Table(name = "profilesettings", schema = "smartsocial")
@NamedQueries({
        @NamedQuery(name = "ProfileSetting.findAll", query = "SELECT p FROM ProfileSetting p"),
        @NamedQuery(name = "ProfileSetting.findById", query = "SELECT p FROM ProfileSetting p WHERE p.id = :id"),
        @NamedQuery(name = "ProfileSetting.findByProfileVisibility", query = "SELECT p FROM ProfileSetting p WHERE p.profileVisibility = :profileVisibility"),
        @NamedQuery(name = "ProfileSetting.findByNotificationsEnabled", query = "SELECT p FROM ProfileSetting p WHERE p.notificationsEnabled = :notificationsEnabled")
})
@Getter
@Setter
@RequiredArgsConstructor
public class ProfileSetting {
    @Id
    @Column(name = "user_id", nullable = false)
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.EAGER, optional = false)
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

    private String picture;

    private String device;
}