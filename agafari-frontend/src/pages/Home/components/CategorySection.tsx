import { CATEGORIES } from '../../../constants/categories';
import { CategoryCard } from '../../../components/shared/CategoryCard';

export function CategorySection() {
  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto md:-mt-16 relative z-10 w-full">
      {/* Mobile Title - Hidden on Desktop because grid overlaps Hero */}
      <div className="md:hidden mb-6 pt-8">
        <h2 className="text-xl font-bold text-text-main mb-1">Browse by Category</h2>
        <p className="text-sm text-text-subtle font-amharic">በምድብ ይፈልጉ</p>
      </div>

      {/* Grid: 2 columns on mobile, 8 columns on large screens */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-8 lg:gap-4 md:grid-cols-4 shadow-sm md:shadow-none">
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
