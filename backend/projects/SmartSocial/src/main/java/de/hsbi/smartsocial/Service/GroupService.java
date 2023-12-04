package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Model.Groupmember;
import de.hsbi.smartsocial.Persistence.GroupRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

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

    public Groupmember findGroupmemberByUserId(Long id) {
        return groupRepository.findGroupmemberByUserId(id);
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