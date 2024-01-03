package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Exceptions.ProfileSettingsNotFoundException;
import de.hsbi.smartsocial.Model.ProfileSetting;
import de.hsbi.smartsocial.Service.GroupService;
import de.hsbi.smartsocial.Service.ProfileSettingsService;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Path("/profilesettings")
public class ProfileSettingsController {

    @Inject
    private ProfileSettingsService profileSettingsService;

    @GET
    public String ping() {
        return Response.ok(profileSettingsService.ping()).build().toString();
    }

    @GET
    @Path("/example")
    public Response getExample() {
        return Response.ok(profileSettingsService.example()).build();
    }

    @GET
    @Path("/getSettings/{id}")
    public Response getSettings(@PathParam("id") Long id) {
        ProfileSetting profileSetting = profileSettingsService.getSettings(id);
        if (profileSetting == null) {
            throw new ProfileSettingsNotFoundException("No settings found for id " + id);
        }
        return Response.ok(profileSetting).build();
    }

    @POST
    @Path("/setSettings/{id}")
    public ProfileSetting setSettings(@PathParam("id") Long id, ProfileSetting profileSetting) {
        ProfileSetting tmp = profileSettingsService.setSettings(id, profileSetting);
        if (tmp == null) {
            throw new ProfileSettingsNotFoundException("Error while setting settings for id " + id);
        }
        return tmp;
    }

    @GET
    @Path("/getVisibility/{id}")
    public String getVisibilityById(@PathParam("id") Long id) {
        String visibility = profileSettingsService.getVisibility(id);
        if (visibility == null) {
            throw new ProfileSettingsNotFoundException("No settings found for id " + id);
        }
        return Response.ok(visibility).build().toString();
    }

    @POST
    @Path("/setVisibility/{id}/{mode}")
    public String setVisibilityById(@PathParam("id") Long id, @PathParam("mode") boolean mode) {
        String visibility = profileSettingsService.setVisibility(id, mode);
        if (visibility == null) {
            throw new ProfileSettingsNotFoundException("Error while setting visibility for id " + id);
        }
        return Response.ok(visibility).build().toString();
    }

    @GET
    @Path("/getPicture/{id}")
    public String getPicture(@PathParam("id") Long id) {
        String picture = profileSettingsService.getPicture(id);
        if (picture == null) {
            throw new ProfileSettingsNotFoundException("No settings(image) found for id " + id);
        }
        return Response.ok(picture).build().toString();
    }

    @POST
    @Path("/setPicture/{id}/{picture}")
    public String setPicture(@PathParam("id") Long id, @PathParam("picture") String picture) {
        String tmp = profileSettingsService.setPicture(id, picture);
        if (tmp == null) {
            throw new ProfileSettingsNotFoundException("Error while setting image for id " + id);
        }
        return Response.ok(tmp).build().toString();
    }

}
