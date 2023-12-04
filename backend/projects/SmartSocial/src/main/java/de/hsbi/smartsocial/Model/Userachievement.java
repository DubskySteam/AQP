package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "userachievements", schema = "smartsocial")
public class Userachievement {
    @EmbeddedId
    private UserachievementId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @MapsId("achievementId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
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