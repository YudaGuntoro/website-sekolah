FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish Cendekia.WebAPI/Cendekia.WebAPI.csproj -c Release -o /publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /publish .
RUN mkdir -p /var/lib/cendekia/keys && chown -R app:app /var/lib/cendekia
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "Cendekia.WebAPI.dll"]
