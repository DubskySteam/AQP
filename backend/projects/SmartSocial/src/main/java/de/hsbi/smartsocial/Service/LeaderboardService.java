package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.Leaderboard;
import de.hsbi.smartsocial.Persistence.LeaderboardRepository;
import jakarta.persistence.EntityManager;

import java.util.ArrayList;
import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
public class LeaderboardService {

    LeaderboardRepository leaderboardRepository;
    public LeaderboardService(EntityManager entityManager) {
        leaderboardRepository = new LeaderboardRepository(entityManager);
    }

    public String ping() {
        return leaderboardRepository.ping();
    }

    public List<Leaderboard> getTopXUsersByKilometers(Long length) {
        return leaderboardRepository.getTopXUsersByKilometers(length);
    }

    public List<Leaderboard> getTopXUsersByFinishedQuests(Long length) {
        return leaderboardRepository.getTopXUsersByFinishedQuests(length);
    }

}
