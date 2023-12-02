package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.ProfileSetting;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Stateless
public class ProfileSettingsRepository {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager entityManager;

    public String ping() {
        return entityManager.toString();
    }

    public ProfileSetting getProfileSettingsById(Long id) {
        return entityManager.createQuery("SELECT p FROM ProfileSetting p WHERE p.id = :id", ProfileSetting.class)
                .setParameter("id", id)
                .getSingleResult();
    }

    public String getVisibilityById(Long id) {
        return entityManager.createQuery("SELECT p.profileVisibility FROM ProfileSetting p WHERE p.id = :id", String.class)
                .setParameter("id", id)
                .getSingleResult();
    }

    public String setVisibilityById(Long id, boolean profilesetting) {
        return entityManager.createQuery("UPDATE ProfileSetting p SET p.profileVisibility = :profilesetting WHERE p.id = :id", String.class)
                .setParameter("id", id)
                .setParameter("profilesetting", profilesetting)
                .getSingleResult();
    }

}
