package de.hsbi.smartsocial.Persistence;

import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Model.Groupmember;
import de.hsbi.smartsocial.Model.User;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */

@Stateless
public class GroupRepository {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager entityManager;

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

    public Groupmember findGroupmemberByUserId(Long id) {
        return entityManager.createQuery("SELECT gm FROM Groupmember gm WHERE gm.user.id = :id", Groupmember.class)
                .setParameter("id", id)
                .getSingleResult();
    }

    public List<Groupmember> findGroupmembersByGroupId(Long id) {
        return entityManager.createQuery("SELECT gm FROM Groupmember gm WHERE gm.group.id = :id", Groupmember.class)
                .setParameter("id", id)
                .getResultList();
    }

    public List<User> findUsersByGroupId_SV(Long id) {
        return entityManager.createQuery("SELECT u FROM User u WHERE u.id IN (SELECT gm.user.id FROM Groupmember gm WHERE gm.group.id = :id)", User.class)
                .setParameter("id", id)
                .getResultList();
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

    public Group updateGroup(Group group) {
        entityManager.merge(group);
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
