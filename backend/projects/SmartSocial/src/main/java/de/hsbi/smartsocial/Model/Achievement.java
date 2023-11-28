package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "achievements", schema = "smartsocial")
@NamedQueries({
        @NamedQuery(name = "Achievement.findAll", query = "SELECT a FROM Achievement a"),
        @NamedQuery(name = "Achievement.findById", query = "SELECT a FROM Achievement a WHERE a.id = :id"),
        @NamedQuery(name = "Achievement.findByName", query = "SELECT a FROM Achievement a WHERE a.name = :name"),
        @NamedQuery(name = "Achievement.findByDescription", query = "SELECT a FROM Achievement a WHERE a.description = :description"),
        @NamedQuery(name = "Achievement.findByDateOfReceivement", query = "SELECT a FROM Achievement a WHERE a.dateOfReceivement = :dateOfReceivement")}
)
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "achievement_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

    @NotNull
    @Column(name = "date_of_receivement", nullable = false)
    private LocalDate dateOfReceivement;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDateOfReceivement() {
        return dateOfReceivement;
    }

    public void setDateOfReceivement(LocalDate dateOfReceivement) {
        this.dateOfReceivement = dateOfReceivement;
    }

}