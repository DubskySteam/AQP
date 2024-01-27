package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.Quest;
import de.hsbi.smartsocial.Model.Userquest;
import de.hsbi.smartsocial.Persistence.QuestRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.ArrayList;
import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Stateless
public class QuestService {

    @Inject
    private QuestRepository questRepository;

    public String ping() {
        return questRepository.ping();
    }

    public List<Quest> getExample() {
        List<Quest> quests = new ArrayList<>();
        Quest quest = new Quest(1L, "Ride 10km", 100L, "distance", 10L, "Rider");
        quests.add(quest);
        Quest quest2 = new Quest(2L, "Ride 20km", 200L, "distance", 20L, "Rider 2");
        quests.add(quest2);
        Quest quest3 = new Quest(3L, "Ride 30km", 300L, "distance", 30L, "Rider 3");
        quests.add(quest3);
        return quests;
    }

    public List<Quest> getAll() {
        return questRepository.getAll();
    }

    public Quest getById(Integer id) {
        return questRepository.getById(id);
    }

    public List<Userquest> getByUserId(Long id) {
        return questRepository.getByUserId(id);
    }

    public Quest create(Quest quest) {
        return questRepository.create(quest);
    }

    public Userquest create(Userquest userquest) {
        return questRepository.create(userquest);
    }

    public Quest delete(int quest) {
        return questRepository.delete(quest);
    }

}
