using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Domain.Entities;

namespace WebShop.Domain.Interfaces
{
    public interface IRepository<T> where T : BaseEntity
    {
        Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
        void Update(T entity);
        void Delete(T entity);
        Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
    }
}
