package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.Achievement;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Stateless
public class AchievementRepository {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager entityManager;

    public String ping() {
        return this.entityManager.toString();
    }

    public List<Achievement> getAllAchievements() {
        return entityManager.createNamedQuery("Achievement.findAll", Achievement.class).getResultList();
    }

    public Achievement findById(Long id) {
        return entityManager.createNamedQuery("Achievement.findById", Achievement.class).setParameter("id", id).getSingleResult();
    }

    public Achievement findByName(String name) {
        return entityManager.createNamedQuery("Achievement.findByName", Achievement.class).setParameter("name", name).getSingleResult();
    }

}
