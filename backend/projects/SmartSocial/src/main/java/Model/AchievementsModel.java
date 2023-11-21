package Model;

import jakarta.persistence.*;

import java.sql.Date;

@Entity
@Table(name = "achievements", schema = "smartsocial", catalog = "smartuser")
public class AchievementsModel {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column(name = "achievement_id", nullable = false)
    private int achievementId;
    @Basic
    @Column(name = "creation_date", nullable = false)
    private Date creationDate;
    @Basic
    @Column(name = "description", nullable = true, length = -1)
    private String description;

    public int getAchievementId() {
        return achievementId;
    }

    public void setAchievementId(int achievementId) {
        this.achievementId = achievementId;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        AchievementsModel that = (AchievementsModel) o;

        if (achievementId != that.achievementId) return false;
        if (creationDate != null ? !creationDate.equals(that.creationDate) : that.creationDate != null) return false;
        if (description != null ? !description.equals(that.description) : that.description != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = achievementId;
        result = 31 * result + (creationDate != null ? creationDate.hashCode() : 0);
        result = 31 * result + (description != null ? description.hashCode() : 0);
        return result;
    }
}
