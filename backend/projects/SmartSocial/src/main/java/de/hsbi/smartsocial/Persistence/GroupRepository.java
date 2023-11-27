package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.Group;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

public class GroupRepository {

    private EntityManager entityManager;
    public GroupRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public String ping() {
        return entityManager.toString();
    }

    public List<Group> findAllGroups() {
        return entityManager.createQuery("SELECT g FROM Group g", Group.class).getResultList();
    }

    public Group createGroup(Group group) {
        entityManager.persist(group);
        return group;
    }

    public void delete(Long id) {
        Group group = entityManager.find(Group.class, id);
        if (group != null) {
            entityManager.remove(group);
        }
    }

}
