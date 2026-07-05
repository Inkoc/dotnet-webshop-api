using WebShop.Domain.Entities;

namespace WebShop.Domain.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<IEnumerable<Order>> GetByUserAsync(int userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Order>> GetAllWithItemsAsync(CancellationToken cancellationToken = default);
}
