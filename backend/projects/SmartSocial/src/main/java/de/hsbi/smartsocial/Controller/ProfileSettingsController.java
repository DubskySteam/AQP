package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Model.ProfileSetting;
import de.hsbi.smartsocial.Service.GroupService;
import de.hsbi.smartsocial.Service.ProfileSettingsService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

@Path("/profilesettings")
public class ProfileSettingsController {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager entityManager;

    private ProfileSettingsService profileSettingsService;

    /**
     * SLW: This method is called before every request to initialize the GroupService object.
     * This is necessary because the EntityManager is not available during construction of the GroupService object.
     * (Because the EntityManager is injected by the application server after construction.)
     */
    private void init() {
        if (profileSettingsService == null) {
            profileSettingsService = new ProfileSettingsService(entityManager);
        }
    }

    @GET
    public String ping() {
        init();
        return Response.ok(profileSettingsService.ping()).build().toString();
    }

    @GET
    @Path("/example")
    public String getExample() {
        init();
        return Response.ok(profileSettingsService.ping()).build().toString();
    }

    @GET
    @Path("/getProfileSettingsById/{id}")
    public ProfileSetting getProfileSettingsById(@PathParam("id") Long id) {
        init();
        return Response.ok(profileSettingsService.getProfileSettingsById(id)).build().readEntity(ProfileSetting.class);
    }

    @GET
    @Path("/getVisibilityById/{id}")
    public String getVisibilityById(@PathParam("id") Long id) {
        init();
        return Response.ok(profileSettingsService.getVisibilityById(id)).build().toString();
    }

    @POST
    @Path("/setVisibilityById/{id}/{mode}")
    public String setVisibilityById(@PathParam("id") Long id, @PathParam("mode") boolean mode) {
        init();
        return Response.ok(profileSettingsService.setVisibilityById(id, mode)).build().toString();
    }

}