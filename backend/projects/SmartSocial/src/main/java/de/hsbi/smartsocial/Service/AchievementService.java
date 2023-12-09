package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.Achievement;
import de.hsbi.smartsocial.Persistence.AchievementRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Stateless
public class AchievementService {

    @Inject
    private AchievementRepository achievementRepository;

    public String ping() {
        return achievementRepository.ping();
    }

    public Achievement getExample() {
        Achievement achievement = new Achievement();
        achievement.setId(1L);
        achievement.setName("Example");
        achievement.setDescription("This is an example achievement");
        return achievement;
    }

    public List<Achievement> getAllAchievements() {
        return achievementRepository.getAllAchievements();
    }

    public Achievement findById(Long id) {
        return achievementRepository.findById(id);
    }

    public Achievement findByName(String name) {
        return achievementRepository.findByName(name);
    }

}
