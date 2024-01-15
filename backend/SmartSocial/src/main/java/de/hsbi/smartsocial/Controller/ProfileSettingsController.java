package de.hsbi.smartsocial.Controller;

import de.fhbielefeld.smartuser.annotations.SmartUserAuth;
import de.hsbi.smartsocial.Exceptions.ProfileSettingsNotFoundException;
import de.hsbi.smartsocial.Model.ProfileSetting;
import de.hsbi.smartsocial.Service.GroupService;
import de.hsbi.smartsocial.Service.ProfileSettingsService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.*;
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
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns the settings for the given id")
    public Response getSettings(@PathParam("id") Long id) {
        ProfileSetting profileSetting = profileSettingsService.getSettings(id);
        if (profileSetting == null) {
            throw new ProfileSettingsNotFoundException("No settings found for id " + id);
        }
        return Response.ok(profileSetting).build();
    }

    @POST
    @Path("/setSettings/{id}")
    @Produces("application/json")
    @Consumes("application/json")
    @ApiResponse(responseCode = "200", description = "Sets the settings for the given id")
    public ProfileSetting setSettings(@PathParam("id") Long id, ProfileSetting profileSetting) {
        ProfileSetting tmp = profileSettingsService.setSettings(id, profileSetting);
        if (tmp == null) {
            throw new ProfileSettingsNotFoundException("Error while setting settings for id " + id);
        }
        return tmp;
    }

    @GET
    @Path("/getVisibility/{id}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns the visibility for the given id")
    public String getVisibilityById(@PathParam("id") Long id) {
        String visibility = profileSettingsService.getVisibility(id);
        if (visibility == null) {
            throw new ProfileSettingsNotFoundException("No settings found for id " + id);
        }
        return Response.ok(visibility).build().toString();
    }

    @POST
    @Path("/setVisibility/{id}/{mode}")
    @Produces("application/json")
    @SmartUserAuth
    @ApiResponse(responseCode = "200", description = "Sets the visibility for the given id")
    public String setVisibilityById(@PathParam("id") Long id, @PathParam("mode") boolean mode) {
        String visibility = profileSettingsService.setVisibility(id, mode);
        if (visibility == null) {
            throw new ProfileSettingsNotFoundException("Error while setting visibility for id " + id);
        }
        return Response.ok(visibility).build().toString();
    }

    @GET
    @Path("/getPicture/{id}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns the image for the given id")
    public String getPicture(@PathParam("id") Long id) {
        String picture = profileSettingsService.getPicture(id);
        if (picture == null) {
            throw new ProfileSettingsNotFoundException("No settings(image) found for id " + id);
        }
        return Response.ok(picture).build().toString();
    }

    @POST
    @Path("/setPicture/{id}/{picture}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Sets the image for the given id")
    public String setPicture(@PathParam("id") Long id, @PathParam("picture") String picture) {
        String tmp = profileSettingsService.setPicture(id, picture);
        if (tmp == null) {
            throw new ProfileSettingsNotFoundException("Error while setting image for id " + id);
        }
        return Response.ok(tmp).build().toString();
    }

    @GET
    @Path("/getDevice/{id}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns the device for the given id")
    public String getDevice(@PathParam("id") Long id) {
        String device = profileSettingsService.getDevice(id);
        if (device == null) {
            throw new ProfileSettingsNotFoundException("No settings(device) found for id " + id);
        }
        return Response.ok(device).build().toString();
    }

    @POST
    @Path("/setDevice/{id}/{device}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Sets the device for the given id")
    public String setDevice(@PathParam("id") Long id, @PathParam("device") String device) {
        String tmp = profileSettingsService.setDevice(id, device);
        if (tmp == null) {
            throw new ProfileSettingsNotFoundException("Error while setting device for id " + id);
        }
        return Response.ok(tmp).build().toString();
    }

}
