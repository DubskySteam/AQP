package de.hsbi.smartsocial.Controller;

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
    public String getExample() {
        return Response.ok(profileSettingsService.ping()).build().toString();
    }

    @GET
    @Path("/getProfileSettingsById/{id}")
    public ProfileSetting getProfileSettingsById(@PathParam("id") Long id) {
        return Response.ok(profileSettingsService.getProfileSettingsById(id)).build().readEntity(ProfileSetting.class);
    }

    @GET
    @Path("/getVisibilityById/{id}")
    public String getVisibilityById(@PathParam("id") Long id) {
        return Response.ok(profileSettingsService.getVisibilityById(id)).build().toString();
    }

    @POST
    @Path("/setVisibilityById/{id}/{mode}")
    public String setVisibilityById(@PathParam("id") Long id, @PathParam("mode") boolean mode) {
        return Response.ok(profileSettingsService.setVisibilityById(id, mode)).build().toString();
    }

}
