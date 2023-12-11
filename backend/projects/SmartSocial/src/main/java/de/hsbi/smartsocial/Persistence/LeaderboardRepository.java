package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.Leaderboard;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Stateless
public class LeaderboardRepository {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager entityManager;

    public String ping() {
        return entityManager.toString();
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

    public Leaderboard getPersonalStats(Long id) {
        return entityManager.createQuery("SELECT l FROM Leaderboard l WHERE l.id = :id", Leaderboard.class)
                .setParameter("id", id)
                .getSingleResult();
    }

    public void update(Leaderboard leaderboard) {
        entityManager.merge(leaderboard);
    }
}
