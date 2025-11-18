export interface AppUser {
  id: string;
  displayName: string | null;
  email: string;
  createdAt: string;
}

export interface Post {
  id: string;
  text: string;
  timestamp: string;
  author: {
    id: string;
    displayName: string | null;
    email: string;
  };
}
