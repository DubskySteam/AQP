package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Entity
@Table(name = "quests", schema = "smartsocial")
@NamedQueries({
        @NamedQuery(name = "Quest.findAll", query = "SELECT q FROM Quest q"),
        @NamedQuery(name = "Quest.findById", query = "SELECT q FROM Quest q WHERE q.id = :id"),
        @NamedQuery(name = "Quest.findByDescription", query = "SELECT q FROM Quest q WHERE q.description = :description"),
        @NamedQuery(name = "Quest.findByXpReward", query = "SELECT q FROM Quest q WHERE q.xpReward = :xpReward")}
)
public class Quest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quest_id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "description", nullable = false, length = Integer.MAX_VALUE)
    private String description;

    @NotNull
    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward;

    public Quest(int i, String s, int i1) {
        this.id = i;
        this.description = s;
        this.xpReward = i1;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getXpReward() {
        return xpReward;
    }

    public void setXpReward(Integer xpReward) {
        this.xpReward = xpReward;
    }

}