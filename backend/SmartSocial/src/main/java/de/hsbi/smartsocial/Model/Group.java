package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Entity
@Table(name = "groups", schema = "smartsocial")
@NamedQueries({
        @NamedQuery(name = "Group.findAll", query = "SELECT g FROM Group g"),
        @NamedQuery(name = "Group.findById", query = "SELECT g FROM Group g WHERE g.id = :id"),
        @NamedQuery(name = "Group.findByName", query = "SELECT g FROM Group g WHERE g.name = :name")
})
@Getter
@Setter
@RequiredArgsConstructor
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id", nullable = false)
    private Long id;

    @Size(max = 255)
    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull
    @Column(name = "creation_date", nullable = false)
    private LocalDate creationDate;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admin_user_id")
    private User adminUser;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

    private String image;
    private String code;
}