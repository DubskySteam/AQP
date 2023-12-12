package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(name = "userquests", schema = "smartsocial")
@NamedQueries({
        @NamedQuery(name = "Userquest.findAll", query = "SELECT uq FROM Userquest uq"),
        @NamedQuery(name = "Userquest.findByUserId", query = "SELECT uq FROM Userquest uq WHERE uq.user.id = :id"),
        @NamedQuery(name = "Userquest.findByQuestId", query = "SELECT uq FROM Userquest uq WHERE uq.quest.id = :id"),
        @NamedQuery(name = "Userquest.findByUserIdAndQuestId", query = "SELECT uq FROM Userquest uq WHERE uq.user.id = :userId AND uq.quest.id = :questId"),
        @NamedQuery(name = "Userquest.findByCompletionDate", query = "SELECT uq FROM Userquest uq WHERE uq.completionDate = :completionDate")}
)
public class Userquest {
    @EmbeddedId
    private UserquestId id;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @MapsId("questId")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "quest_id", nullable = false)
    private Quest quest;

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;

    public UserquestId getId() {
        return id;
    }

    public void setId(UserquestId id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Quest getQuest() {
        return quest;
    }

    public void setQuest(Quest quest) {
        this.quest = quest;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

}