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
    public List<ProfileSetting> getAllProfileSettings() {
        return profileSettingsRepository.getAllProfileSettings();
    }

    public ProfileSetting getSettings(Long id) {
        return profileSettingsRepository.getSettings(id);
    }
    public ProfileSetting setSettings(Long id, ProfileSetting profileSetting) {
        return profileSettingsRepository.setSettings(id, profileSetting);
    }

    public String getVisibility(Long id) {
        return profileSettingsRepository.getVisibility(id);
    }

    public String setVisibility(Long id, boolean profilesetting) {
        return profileSettingsRepository.setVisibility(id, profilesetting);
    }

    public String getPicture(Long id) {
        return profileSettingsRepository.getPicture(id);
    }

    public String setPicture(Long id, String picture) {
        return profileSettingsRepository.setPicture(id, picture);
    }

    public String getDevice(Long id) {
        return profileSettingsRepository.getDevice(id);
    }

    public String setDevice(Long id, String device) {
        return profileSettingsRepository.setDevice(id, device);
    }

    public void createProfileSettings(Long id) {
        ProfileSetting profileSetting = new ProfileSetting();
        profileSetting.setId(id);
        profileSetting.setProfileVisibility("public");
        profileSetting.setNotificationsEnabled(false);
        profileSetting.setPicture("https://www.stockvault.net/data/2013/09/14/147895/preview16.jpg");
        profileSetting.setDevice(null);
        profileSettingsRepository.createProfileSettings(profileSetting);
    }

}
