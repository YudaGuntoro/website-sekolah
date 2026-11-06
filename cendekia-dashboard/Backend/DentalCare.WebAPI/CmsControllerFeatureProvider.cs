using System.Reflection;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Mvc.Controllers;

namespace DentalCare.WebAPI;

// Only school CMS and authentication endpoints are exposed in this application.
public class CmsControllerFeatureProvider : IApplicationFeatureProvider<ControllerFeature>
{
    public void PopulateFeature(IEnumerable<ApplicationPart> parts, ControllerFeature feature)
    {
        string[] allowed = ["AuthController", "UsersController", "ContentController", "SchoolPublicController", "SpmbController", "WebsiteSettingsController", "SchoolIdentityController", "HomepageImagesController", "SpmbInformationController", "LmpController"];
        foreach (var controller in feature.Controllers.Where(x => !allowed.Contains(x.Name)).ToArray())
            feature.Controllers.Remove(controller);
    }
}
