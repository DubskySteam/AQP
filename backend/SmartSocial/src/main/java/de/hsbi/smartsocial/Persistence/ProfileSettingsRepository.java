package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.ProfileSetting;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

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
    public List<ProfileSetting> getAllProfileSettings() {
        return entityManager.createQuery("SELECT p FROM ProfileSetting p", ProfileSetting.class)
                .getResultList();
    }

    public ProfileSetting getSettings(Long id) {
        return entityManager.createQuery("SELECT p FROM ProfileSetting p WHERE p.id = :id", ProfileSetting.class)
                .setParameter("id", id)
                .getSingleResult();
    }

    public ProfileSetting setSettings(Long id, ProfileSetting profileSetting) {
        return entityManager.createQuery("UPDATE ProfileSetting p SET p.profileVisibility = :profileVisibility, p.picture = :picture, p.device = :device WHERE p.id = :id", ProfileSetting.class)
                .setParameter("id", id)
                .setParameter("profileVisibility", profileSetting.getProfileVisibility())
                .setParameter("picture", profileSetting.getPicture())
                .setParameter("device", profileSetting.getDevice())
                .getSingleResult();
    }

    public String getVisibility(Long id) {
        return entityManager.createQuery("SELECT p.profileVisibility FROM ProfileSetting p WHERE p.id = :id", String.class)
                .setParameter("id", id)
                .getSingleResult();
    }

    public String setVisibility(Long id, boolean profilesetting) {
        return entityManager.createQuery("UPDATE ProfileSetting p SET p.profileVisibility = :profilesetting WHERE p.id = :id", String.class)
                .setParameter("id", id)
                .setParameter("profilesetting", profilesetting)
                .getSingleResult();
    }

    public String getPicture(Long id) {
        return entityManager.createQuery("SELECT p.picture FROM ProfileSetting p WHERE p.id = :id", String.class)
                .setParameter("id", id)
                .getSingleResult();
    }

    public String setPicture(Long id, String picture) {
        return entityManager.createQuery("UPDATE ProfileSetting p SET p.picture = :picture WHERE p.id = :id", String.class)
                .setParameter("id", id)
                .setParameter("picture", picture)
                .getSingleResult();
    }

    public String getDevice(Long id) {
        return entityManager.createQuery("SELECT p.device FROM ProfileSetting p WHERE p.id = :id", String.class)
                .setParameter("id", id)
                .getSingleResult();
    }

    public String setDevice(Long id, String device) {
        return entityManager.createQuery("UPDATE ProfileSetting p SET p.device = :device WHERE p.id = :id", String.class)
                .setParameter("id", id)
                .setParameter("device", device)
                .getSingleResult();
    }

    public void createProfileSettings(ProfileSetting profileSetting) {
        entityManager.persist(profileSetting);
    }

}
