export function buildTree(flatCategories) {
  const map = {};
  const roots = [];

  flatCategories.forEach((cat) => {
    map[cat._id] = { ...cat, children: [] };
  });

  flatCategories.forEach((cat) => {
    const parentId = cat.categorieParent?._id || cat.categorieParent;
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[cat._id]);
    } else {
      roots.push(map[cat._id]);
    }
  });

  return roots;
}

export function findCategoryBySlug(flatCategories, slug) {
  return flatCategories.find((c) => c.slug === slug || c._id === slug);
}

export function getCategoryBreadcrumb(flatCategories, categoryId) {
  const breadcrumb = [];
  let current = flatCategories.find((c) => c._id === categoryId);

  while (current) {
    breadcrumb.unshift(current);
    const parentId = current.categorieParent?._id || current.categorieParent;
    current = parentId ? flatCategories.find((c) => c._id === parentId) : null;
  }

  return breadcrumb;
}

export function getSubcategoryIds(flatCategories, categoryId) {
  const ids = [categoryId];
  const children = flatCategories.filter(
    (c) => (c.categorieParent?._id || c.categorieParent) === categoryId
  );
  children.forEach((child) => {
    ids.push(...getSubcategoryIds(flatCategories, child._id));
  });
  return ids;
}
