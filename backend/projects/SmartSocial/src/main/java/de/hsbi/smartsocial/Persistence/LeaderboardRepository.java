package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.Leaderboard;
import jakarta.persistence.EntityManager;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
public class LeaderboardRepository {

    private EntityManager entityManager;

    public LeaderboardRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public List<Leaderboard> getTopXUsersByKilometers(Long limit) {
        return entityManager.createQuery("SELECT l FROM Leaderboard l ORDER BY l.kilometers DESC", Leaderboard.class)
                .setMaxResults(Math.toIntExact(limit))
                .getResultList();
    }

    public List<Leaderboard> getTopXUsersByFinishedQuests(Long limit) {
        return entityManager.createQuery("SELECT l FROM Leaderboard l ORDER BY l.finishedQuests DESC", Leaderboard.class)
                .setMaxResults(Math.toIntExact(limit))
                .getResultList();
    }
}
