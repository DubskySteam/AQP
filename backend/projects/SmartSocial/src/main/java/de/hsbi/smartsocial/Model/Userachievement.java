package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "userachievements", schema = "smartsocial")
@NamedQueries({
        @NamedQuery(name = "Userachievement.findAll", query = "SELECT u FROM Userachievement u"),
        @NamedQuery(name = "Userachievement.findByUserId", query = "SELECT u FROM Userachievement u WHERE u.id.userId = :userId"),
        @NamedQuery(name = "Userachievement.findByAchievementId", query = "SELECT u FROM Userachievement u WHERE u.id.achievementId = :achievementId"),
        @NamedQuery(name = "Userachievement.findByUserIdAndAchievementId", query = "SELECT u FROM Userachievement u WHERE u.id.userId = :userId AND u.id.achievementId = :achievementId")
})
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

    public UserachievementId getId() {
        return id;
    }

    public void setId(UserachievementId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Achievement getAchievement() {
        return achievement;
    }

    public void setAchievement(Achievement achievement) {
        this.achievement = achievement;
    }

}