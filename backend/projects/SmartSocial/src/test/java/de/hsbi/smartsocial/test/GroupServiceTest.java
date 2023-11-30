package de.hsbi.smartsocial.test;

import de.hsbi.smartsocial.Service.GroupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Persistence.GroupRepository;

import java.util.Arrays;
import java.util.List;

class GroupServiceTest {

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private GroupService groupService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindGroupByIdExists() {
        Long id = 1L;
        Group mockGroup = new Group();
        mockGroup.setId(id);
        when(groupRepository.findGroupById(id)).thenReturn(mockGroup); // Adjusted to return Group directly

        Group result = groupService.findGroupById(id);
        assertNotNull(result);
        assertEquals(id, result.getId());
    }

    @Test
    void testFindGroupByIdNotExists() {
        Long id = 1L;
        when(groupRepository.findGroupById(id)).thenReturn(null); // Adjusted to return null

        Group result = groupService.findGroupById(id);
        assertNull(result); // Changed to assertNull
    }


    @Test
    void testFindGroupByName() {
        String name = "Test Group";
        Group mockGroup = new Group();
        mockGroup.setName(name);
        when(groupRepository.findGroupByName(name)).thenReturn(mockGroup);

        Group result = groupService.findGroupByName(name);
        assertNotNull(result);
        assertEquals(name, result.getName());
    }

    @Test
    void testFindAllGroups() {
        Group group1 = new Group();
        Group group2 = new Group();
        List<Group> mockGroups = Arrays.asList(group1, group2);
        when(groupRepository.findAllGroups()).thenReturn(mockGroups);

        List<Group> result = groupService.findAllGroups();
        assertEquals(2, result.size());
    }

    @Test
    void testCreateGroup() {
        Group group = new Group();
        when(groupRepository.createGroup(group)).thenReturn(group);

        Group result = groupService.createGroup(group);
        assertNotNull(result);
    }

    @Test
    void testDeleteGroup() {
        Long id = 1L;
        doNothing().when(groupRepository).delete(id);

        groupService.deleteGroup(id);
        verify(groupRepository, times(1)).delete(id);
    }
}
