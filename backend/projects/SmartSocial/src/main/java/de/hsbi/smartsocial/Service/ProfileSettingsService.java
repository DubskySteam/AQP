package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.ProfileSetting;
import de.hsbi.smartsocial.Persistence.ProfileSettingsRepository;
import jakarta.persistence.EntityManager;

public class ProfileSettingsService {

    private final ProfileSettingsRepository profileSettingsRepository;

    public ProfileSettingsService (EntityManager entityManager) {
        this.profileSettingsRepository = new ProfileSettingsRepository(entityManager);
    }

    public String ping() {
        return profileSettingsRepository.ping();
    }

    public ProfileSetting getProfileSettingsById(Long id) {
        return profileSettingsRepository.getProfileSettingsById(id);
    }

    public String getVisibilityById(Long id) {
        return profileSettingsRepository.getVisibilityById(id);
    }

    public String setVisibilityById(Long id, boolean profilesetting) {
        return profileSettingsRepository.setVisibilityById(id, profilesetting);
    }

}
