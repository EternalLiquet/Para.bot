FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Para.bot.csproj", "./"]
RUN dotnet restore "Para.bot.csproj"

COPY . .
RUN dotnet publish "Para.bot.csproj" -c Release -o /app/publish --no-restore
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish ./

ENTRYPOINT ["dotnet", "Para.bot.dll"]
