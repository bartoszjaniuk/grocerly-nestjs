export type UpdateGroceryListDto = {
  listId: string;
  articles: {
    name: string;
    categoryId: string;
  }[];
};
