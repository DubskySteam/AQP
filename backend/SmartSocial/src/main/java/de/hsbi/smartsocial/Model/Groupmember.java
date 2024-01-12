package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "groupmembers", schema = "smartsocial")
@Getter
@Setter
@RequiredArgsConstructor
public class Groupmember {
    @EmbeddedId
    private GroupmemberId id;

    @MapsId("groupId")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "member_since", nullable = false)
    private LocalDate memberSince;

    @Size(max = 100)
    @NotNull
    @Column(name = "status", nullable = false, length = 100)
    private String status;
}