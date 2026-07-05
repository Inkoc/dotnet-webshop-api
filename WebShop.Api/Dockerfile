# Build context is the repo root (see docker-compose.yml).
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["WebShop.Api/WebShop.Api.csproj", "WebShop.Api/"]
COPY ["WebShop.Application/WebShop.Application.csproj", "WebShop.Application/"]
COPY ["WebShop.DAL/WebShop.DAL.csproj", "WebShop.DAL/"]
COPY ["WebShop.Domain/WebShop.Domain.csproj", "WebShop.Domain/"]
RUN dotnet restore "WebShop.Api/WebShop.Api.csproj"

COPY WebShop.Api/ WebShop.Api/
COPY WebShop.Application/ WebShop.Application/
COPY WebShop.DAL/ WebShop.DAL/
COPY WebShop.Domain/ WebShop.Domain/
RUN dotnet publish "WebShop.Api/WebShop.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WebShop.Api.dll"]
