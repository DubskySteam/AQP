package de.fhbielefeld.scl.logger.application;

import java.io.Serializable;

/**
 * Represents an Component for Presentation. This can be bound into
 * webinterface.
 *
 * @author ffehring
 */
public class Application implements Serializable {

    private int _id;
    private String _name;
    private String _baseurl;
    private String _password;
    private String _description;
    private String _status;

    public Application(String name, String baseurl, String password) {
        this._name = name;
        this._baseurl = baseurl;
        this._password = password;
    }

    public int getId() {
        return _id;
    }

    public void setId(int _id) {
        this._id = _id;
    }

    public String getName() {
        return _name;
    }

    public void setName(String name) {
        this._name = name;
    }

    public void setBaseUrl(String baseurl) {
        this._baseurl = baseurl;
    }

    public String getBaseUrl() {
        return this._baseurl;
    }

    public String getPassword() {
        return _password;
    }

    public void setPassword(String password) {
        this._password = password;
    }

    public String getDescription() {
        return _description;
    }

    public void setDescription(String _description) {
        this._description = _description;
    }

    public String getStatus() {
        return _status;
    }

    public void setStatus(String _status) {
        this._status = _status;
    }
}
