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

    public ProfileSetting example() {
        ProfileSetting profileSetting = new ProfileSetting();
        profileSetting.setId(1L);
        profileSetting.setProfileVisibility("public");
        profileSetting.setPicture("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png");
        profileSetting.setDevice("pi1234123");
        return profileSetting;
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
