package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.Achievement;
import de.hsbi.smartsocial.Persistence.AchievementRepository;
import jakarta.persistence.EntityManager;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
public class AchievementService {

    private final AchievementRepository achievementRepository;

    public AchievementService(EntityManager entityManager) {
        achievementRepository = new AchievementRepository(entityManager);
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
