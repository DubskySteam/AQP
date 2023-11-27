package de.hsbi.smartsocial.Persistence;

import jakarta.persistence.EntityManager;

public class ProfileSettingsRepository {

    private final EntityManager entityManager;

    public ProfileSettingsRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public String getProfileSettingsById(Long id) {
        return entityManager.createQuery("SELECT p FROM ProfileSetting p WHERE p.id = :id", String.class)
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
