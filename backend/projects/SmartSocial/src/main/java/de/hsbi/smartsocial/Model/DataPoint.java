package de.hsbi.smartsocial.Model;

import lombok.*;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */

@Getter
@Setter
@RequiredArgsConstructor
public class DataPoint {
    private String latitude;
    private String longitude;
    private String ts;
}
