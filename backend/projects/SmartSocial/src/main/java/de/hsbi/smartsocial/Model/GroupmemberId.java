package de.hsbi.smartsocial.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Getter
@Setter
@RequiredArgsConstructor
@Embeddable
public class GroupmemberId implements Serializable {
    private static final long serialVersionUID = 1948715154820775744L;
    @NotNull
    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;
}