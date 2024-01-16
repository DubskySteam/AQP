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

    @Inject
    private LeaderboardService leaderboardService;

    public String ping() {
        return groupRepository.ping();
    }

    public Group findGroupById(Long id) {
        return groupRepository.findGroupById(id);
    }

    public Group findGroupByName(String name) {
        return groupRepository.findGroupByName(name);
    }

    public Group findGroupByUserId(Long id) {
        return groupRepository.findGroupByUserId(id);
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

    public double getGroupDistance(Long id) {
        List<Groupmember> groupmembers = groupRepository.findGroupmembersByGroupId(id);
        double distance = 0;
        for (Groupmember groupmember : groupmembers) {
            distance += leaderboardService.getPersonalStats(groupmember.getUser().getId()).getKilometers().doubleValue();
        }
        return distance;
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