package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.Quest;
import de.hsbi.smartsocial.Model.Userquest;
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

    public List<Userquest> getByUserId(Long id) {
        return entityManager.createNamedQuery("Userquest.findByUserId", Userquest.class).setParameter("id", id).getResultList();
    }

    public Quest create(Quest quest) {
        entityManager.persist(quest);
        return quest;
    }

    public Userquest create(Userquest userquest) {
        entityManager.persist(userquest);
        return userquest;
    }

    public Quest delete(int quest) {
        entityManager.remove(quest);
        return entityManager.find(Quest.class, quest);
    }

}
