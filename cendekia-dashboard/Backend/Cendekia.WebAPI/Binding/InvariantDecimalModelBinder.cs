using System.Globalization;
using Microsoft.AspNetCore.Mvc.ModelBinding;
namespace Cendekia.WebAPI.Binding;

// HTML number controls submit a dot regardless of the server's display culture.
public sealed class InvariantDecimalModelBinderProvider : IModelBinderProvider
{
    public IModelBinder? GetBinder(ModelBinderProviderContext context)
        => context.Metadata.ModelType == typeof(decimal) ? new InvariantDecimalModelBinder() : null;
}
public sealed class InvariantDecimalModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext context)
    {
        var value = context.ValueProvider.GetValue(context.ModelName);
        if (value == ValueProviderResult.None) return Task.CompletedTask;
        context.ModelState.SetModelValue(context.ModelName, value);
        if (decimal.TryParse(value.FirstValue, NumberStyles.AllowLeadingSign | NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out var number))
            context.Result = ModelBindingResult.Success(number);
        else context.ModelState.TryAddModelError(context.ModelName, "Gunakan angka dengan titik sebagai pemisah desimal.");
        return Task.CompletedTask;
    }
}
