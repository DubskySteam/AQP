package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Entity
@Table(name = "leaderboard", schema = "smartsocial")
@NamedQueries({
        @NamedQuery(name = "Leaderboard.findAll", query = "SELECT l FROM Leaderboard l"),
        @NamedQuery(name = "Leaderboard.findById", query = "SELECT l FROM Leaderboard l WHERE l.id = :id"),
        @NamedQuery(name = "Leaderboard.findByKilometers", query = "SELECT l FROM Leaderboard l WHERE l.kilometers = :kilometers"),
        @NamedQuery(name = "Leaderboard.findByFinishedQuests", query = "SELECT l FROM Leaderboard l WHERE l.finishedQuests = :finishedQuests")}
)
@Getter
@Setter
@RequiredArgsConstructor
public class Leaderboard {
    @Id
    @Column(name = "userid", nullable = false)
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "userid", nullable = false)
    private User users;

    @NotNull
    @Column(name = "kilometers", nullable = false, precision = 10, scale = 2)
    private BigDecimal kilometers;

    @NotNull
    @Column(name = "finished_quests", nullable = false)
    private Integer finishedQuests;
}