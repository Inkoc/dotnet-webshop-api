namespace WebShop.Application.Interfaces;

public interface IDbSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
