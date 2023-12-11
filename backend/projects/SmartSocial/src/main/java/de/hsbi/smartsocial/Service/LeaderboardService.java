package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.Leaderboard;
import de.hsbi.smartsocial.Persistence.LeaderboardRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.ArrayList;
import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Stateless
public class LeaderboardService {

    @Inject
    LeaderboardRepository leaderboardRepository;

    public String ping() {
        return leaderboardRepository.ping();
    }

    public List<Leaderboard> getTopXUsersByKilometers(Long length) {
        return leaderboardRepository.getTopXUsersByKilometers(length);
    }

    public List<Leaderboard> getTopXUsersByFinishedQuests(Long length) {
        return leaderboardRepository.getTopXUsersByFinishedQuests(length);
    }

    public Leaderboard getPersonalStats(Long id) {
        return leaderboardRepository.getPersonalStats(id);
    }

    public void addKilometers(Long id, double kilometers) {
        Leaderboard leaderboard = leaderboardRepository.getPersonalStats(id);
        leaderboard.setKilometers(new java.math.BigDecimal(kilometers));
        leaderboardRepository.update(leaderboard);
    }

}
