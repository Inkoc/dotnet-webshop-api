using System;
using System.Collections.Generic;
using System.Text;
using WebShop.DAL.Data;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.DAL.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly WebShopDbContext _context;
        private readonly Dictionary<Type, object> _repositories = new();
        private IUserRepository? _users;
        private IProductRepository? _products;
        private bool _disposed;

        public UnitOfWork(WebShopDbContext context)
        {
            _context = context;
        }

        public IUserRepository Users => _users ??= new UserRepository(_context);

        public IProductRepository Products => _products ??= new ProductRepository(_context);

        public void Dispose()
        {
            if (!_disposed)
            {
                _context.Dispose();
                _disposed = true;
            }
            GC.SuppressFinalize(this);
        }

        public IRepository<T> Repository<T>() where T : BaseEntity
        {
            if (_repositories.TryGetValue(typeof(T), out var existing))
            {
                return (IRepository<T>)existing;
            }

            var repo = new Repository<T>(_context);
            _repositories[typeof(T)] = repo;
            return repo;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
