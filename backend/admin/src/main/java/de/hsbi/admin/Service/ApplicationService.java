package de.hsbi.admin.Service;

import jakarta.ejb.Stateless;

@Stateless
public class ApplicationService {

    public String ping() {
        return "pong";
    }

}
