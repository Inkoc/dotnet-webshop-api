using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using WebShop.DAL.Data;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.DAL.Repositories
{
    public class Repository<T> : IRepository<T> where T : BaseEntity
    {
        protected readonly WebShopDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(WebShopDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddAsync(entity, cancellationToken);
            return entity;
        }

        public virtual void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }

        public async virtual Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AnyAsync(e => e.Id == id, cancellationToken);
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.ToListAsync(cancellationToken);
        }

        public virtual async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet.FindAsync([id], cancellationToken);
        }

        public virtual void Update(T entity)
        {
            _dbSet.Update(entity);
        }
    }
}
