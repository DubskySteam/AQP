package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "userachievements", schema = "smartsocial")
@NamedQueries({
        @NamedQuery(name = "Userachievement.findAll", query = "SELECT u FROM Userachievement u"),
        @NamedQuery(name = "Userachievement.findByUserId", query = "SELECT u FROM Userachievement u WHERE u.id.userId = :userId"),
        @NamedQuery(name = "Userachievement.findByAchievementId", query = "SELECT u FROM Userachievement u WHERE u.id.achievementId = :achievementId"),
        @NamedQuery(name = "Userachievement.findByUserIdAndAchievementId", query = "SELECT u FROM Userachievement u WHERE u.id.userId = :userId AND u.id.achievementId = :achievementId")
})
@Getter
@Setter
@RequiredArgsConstructor
public class Userachievement {
    @EmbeddedId
    private UserachievementId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @MapsId("achievementId")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "achievement_id", nullable = false)
    private Achievement achievement;
}