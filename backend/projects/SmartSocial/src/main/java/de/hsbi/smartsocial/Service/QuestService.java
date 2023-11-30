package de.hsbi.smartsocial.Service;

import de.hsbi.smartsocial.Model.Quest;
import de.hsbi.smartsocial.Persistence.QuestRepository;
import jakarta.persistence.EntityManager;

import java.util.ArrayList;
import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
public class QuestService {

    private QuestRepository questRepository;

    public QuestService(EntityManager entityManager) {
        questRepository = new QuestRepository(entityManager);
    }

    public String ping() {
        return questRepository.ping();
    }

    public List<Quest> getExample() {
        List<Quest> quests = new ArrayList<>();
        Quest quest = new Quest(1L, "Ride 10km", 100L);
        quests.add(quest);
        Quest quest2 = new Quest(2L, "Ride 20km", 200L);
        quests.add(quest2);
        Quest quest3 = new Quest(3L, "Ride 30km", 300L);
        quests.add(quest3);
        return quests;
    }

    public List<Quest> getAll() {
        return questRepository.getAll();
    }

    public Quest getById(Integer id) {
        return questRepository.getById(id);
    }

}
