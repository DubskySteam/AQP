package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Persistence.GroupRepository;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
public class GroupService {

    private final GroupRepository groupRepository;

    public GroupService(EntityManager entityManager) {
        this.groupRepository = new GroupRepository(entityManager);
    }

    public String ping() {
        return groupRepository.ping();
    }

    public Group findGroupById(Long id) {
        return groupRepository.findGroupById(id);
    }

    public Group findGroupByName(String name) {
        return groupRepository.findGroupByName(name);
    }

    public List<Group> findAllGroups() {
        return groupRepository.findAllGroups();
    }

    public Group createGroup(Group group) {
        return groupRepository.createGroup(group);
    }

    public void deleteGroup(Long id) {
        groupRepository.delete(id);
    }

}