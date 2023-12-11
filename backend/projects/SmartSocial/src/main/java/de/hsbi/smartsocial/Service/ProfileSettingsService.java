package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.ProfileSetting;
import de.hsbi.smartsocial.Persistence.ProfileSettingsRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Stateless
public class ProfileSettingsService {

    @Inject
    private ProfileSettingsRepository profileSettingsRepository;

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

    public List<ProfileSetting> getAllProfileSettings() {
        return profileSettingsRepository.getAllProfileSettings();
    }

}
