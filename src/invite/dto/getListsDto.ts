type Article = {
  id: string;
  name: string;
  groceryListId: string;
  categoryId: string;
};

type User = {
  id: string;
  email: string;
  avatar: string;
};

export type InvitationListDto = {
  id: string;
  name: string;
  articles: Article[];
  users: { user: User }[];
};
