export type CreateGroceryListDto = {
  name: string;
  userId: string;
  articles: {
    name: string;
    categoryId: string;
  }[];
};
