package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.Group;
import jakarta.persistence.EntityManager;
import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
public class GroupRepository {

    private final EntityManager entityManager;
    public GroupRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    //////////////////
    // Utility Code //
    //////////////////

    public String ping() {
        return entityManager.toString();
    }

    //////////////////
    // GET Requests //
    //////////////////

    public Group findGroupById(Long id) {
        return entityManager.find(Group.class, id);
    }

    public Group findGroupByName(String name) {
        return entityManager.createQuery("SELECT g FROM Group g WHERE g.name = :name", Group.class)
                .setParameter("name", name)
                .getSingleResult();
    }

    public List<Group> findAllGroups() {
        return entityManager.createQuery("SELECT g FROM Group g", Group.class).getResultList();
    }

    ///////////////////
    // POST Requests //
    ///////////////////

    public Group createGroup(Group group) {
        entityManager.persist(group);
        return group;
    }

    ////////////////////
    // DELETE Request //
    ////////////////////

    public void delete(Long id) {
        Group group = entityManager.find(Group.class, id);
        if (group != null) {
            entityManager.remove(group);
        }
    }

}