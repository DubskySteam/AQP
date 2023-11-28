package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.Quest;
import de.hsbi.smartsocial.Model.Userquest;
import jakarta.persistence.EntityManager;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
public class QuestRepository {

    private final EntityManager entityManager;

    public QuestRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public String ping() {
        return entityManager.toString();
    }

    public List<Quest> getAll() {
        return entityManager.createNamedQuery("Quest.findAll", Quest.class).getResultList();
    }

    public Quest getById(Integer id) {
        return entityManager.createNamedQuery("Quest.findById", Quest.class).setParameter("id", id).getSingleResult();
    }

    public List<Userquest> getQuestsByUser(Long userId) {
        return entityManager.createNamedQuery("Userquest.findByUserId", Userquest.class).setParameter("userId", userId).getResultList();
    }

}
