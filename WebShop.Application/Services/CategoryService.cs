using System;
using System.Collections.Generic;
using System.Text;
using WebShop.Application.DTOs.Category;
using WebShop.Application.Interfaces;
using WebShop.Application.Mapping;
using WebShop.Domain.Entities;
using WebShop.Domain.Interfaces;

namespace WebShop.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoryService(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
        {
            var category = dto.ToEntity();
            await _unitOfWork.Repository<Category>().AddAsync(category, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return category.ToDto();
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var repo = _unitOfWork.Repository<Category>();
            var category = await repo.GetByIdAsync(id, cancellationToken);

            if (category is null) return false;

            repo.Delete(category);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var categories = await _unitOfWork.Repository<Category>().GetAllAsync(cancellationToken);

            return categories.Select(c => c.ToDto());
        }

        public async Task<CategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id, cancellationToken);

            return category?.ToDto();
        }

        public async Task<bool> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
        {
            var repo = _unitOfWork.Repository<Category>();
            var category = await repo.GetByIdAsync(id, cancellationToken);

            if (category is null) return false;

            category.Name = dto.Name;
            category.Description = dto.Description;
            repo.Update(category);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
