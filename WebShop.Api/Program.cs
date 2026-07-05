using Microsoft.OpenApi;
using Serilog;
using WebShop.Api.Extensions;
using WebShop.Api.Filters;
using WebShop.Application.Extensions;
using WebShop.DAL.Extensions;

var builder = WebApplication.CreateBuilder(args);

//Serilog
builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration)
          .WriteTo.Console()
          .WriteTo.File("logs/webshop-.log", rollingInterval: RollingInterval.Day));

builder.Services.AddDalServices(builder.Configuration.GetConnectionString("DefaultConnection")!);
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddControllers(options => options.Filters.Add<ValidationFilter>());

//Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "WebShop API",
        Version = "v1",
        Description = "WebShop API demo with JWT authentication"
    });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", null, null),
            new List<string>()
        }
    });
});

var app = builder.Build();

app.UseSerilogRequestLogging();

app.UseExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
