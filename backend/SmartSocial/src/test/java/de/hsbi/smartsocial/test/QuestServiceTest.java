package de.hsbi.smartsocial.test;

import de.hsbi.smartsocial.Persistence.QuestRepository;
import de.hsbi.smartsocial.Service.QuestService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class QuestServiceTest {

    @Mock
    private QuestRepository questRepository;

    @InjectMocks
    private QuestService questService;

    @Test
    void testFindQuestById() {
        Long id = 1L;
        questService.getById(Math.toIntExact(id));
        verify(questRepository).getById(Math.toIntExact(id));
    }

    @Test
    void testFindAllQuests() {
        questService.getAll();
        verify(questRepository).getAll();
    }
}
