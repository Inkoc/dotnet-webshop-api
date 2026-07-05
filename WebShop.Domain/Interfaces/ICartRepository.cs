using WebShop.Domain.Entities;

namespace WebShop.Domain.Interfaces;

public interface ICartRepository : IRepository<Cart>
{
    Task<Cart?> GetByUserAsync(int userId, CancellationToken cancellationToken = default);
}
