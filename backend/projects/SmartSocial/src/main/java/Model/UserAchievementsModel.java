package Model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_achievements", schema = "smartsocial", catalog = "smartuser")
public class UserAchievementsModel {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column(name = "user_achievement_id", nullable = false)
    private int userAchievementId;
    @Basic
    @Column(name = "user_id", nullable = false)
    private int userId;
    @Basic
    @Column(name = "achievement_id", nullable = false)
    private int achievementId;

    public int getUserAchievementId() {
        return userAchievementId;
    }

    public void setUserAchievementId(int userAchievementId) {
        this.userAchievementId = userAchievementId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getAchievementId() {
        return achievementId;
    }

    public void setAchievementId(int achievementId) {
        this.achievementId = achievementId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        UserAchievementsModel that = (UserAchievementsModel) o;

        if (userAchievementId != that.userAchievementId) return false;
        if (userId != that.userId) return false;
        if (achievementId != that.achievementId) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = userAchievementId;
        result = 31 * result + userId;
        result = 31 * result + achievementId;
        return result;
    }
}
