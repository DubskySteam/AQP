package de.hsbi.smartsocial.test;

import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Persistence.GroupRepository;
import de.hsbi.smartsocial.Service.GroupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
public class GroupServiceTest {

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private GroupService groupService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testFindGroupById() {
        Long id = 1L;
        Group mockGroup = new Group();
        when(groupRepository.findGroupById(id)).thenReturn(mockGroup);

        Group result = groupService.findGroupById(id);
        assertEquals(mockGroup, result);
        verify(groupRepository).findGroupById(id);
    }
}