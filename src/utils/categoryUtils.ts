export const matchCategory = (productCategories: string, selectedCategory: string): boolean => {
  const productCats = productCategories.toLowerCase().split(',').map(cat => cat.trim());
  const searchCat = selectedCategory.toLowerCase().trim();
  return productCats.includes(searchCat);
};
