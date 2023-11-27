package de.hsbi.smartsocial.Model;

import jakarta.persistence.*;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Entity
@Table(name = "users", schema = "smartuser")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

}