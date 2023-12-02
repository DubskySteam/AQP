package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Persistence.GroupRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jdk.jfr.Period;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */

@Stateless
public class GroupService {

    @Inject
    private GroupRepository groupRepository;

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

    @Transactional
    public Group createGroup(Group group) {
        return groupRepository.createGroup(group);
    }

    @Transactional
    public void deleteGroup(Long id) {
        groupRepository.delete(id);
    }

}