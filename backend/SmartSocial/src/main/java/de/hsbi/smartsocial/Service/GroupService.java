package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Model.Groupmember;
import de.hsbi.smartsocial.Model.User;
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

    public List<Groupmember> findGroupmembersByGroupId(Long id) {
        return groupRepository.findGroupmembersByGroupId(id);
    }

    public List<User> findUsersByGroupId_SV(Long id) {
        return groupRepository.findUsersByGroupId_SV(id);
    }

    public List<Group> findAllGroups() {
        return groupRepository.findAllGroups();
    }

    @Transactional
    public Group joinGroup(Long userId, String code) {
        return groupRepository.joinGroup(userId, code);
    }

    @Transactional
    public Group createGroup(Group group) {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            code.append((int) (Math.random() * 10));
        }
        group.setCode(code.toString());
        return groupRepository.createGroup(group);
    }

    @Transactional
    public Group updateGroup(Group group) {
        return groupRepository.updateGroup(group);
    }

    @Transactional
    public void deleteGroup(Long id) {
        groupRepository.delete(id);
    }

}