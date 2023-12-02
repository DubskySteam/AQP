package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.Quest;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Stateless
public class QuestRepository {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager entityManager;

    public String ping() {
        return entityManager.toString();
    }

    public List<Quest> getAll() {
        return entityManager.createNamedQuery("Quest.findAll", Quest.class).getResultList();
    }

    public Quest getById(Integer id) {
        return entityManager.createNamedQuery("Quest.findById", Quest.class).setParameter("id", id).getSingleResult();
    }

}
