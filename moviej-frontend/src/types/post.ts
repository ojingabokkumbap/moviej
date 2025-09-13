export interface Post {
  id: number; // 게시글 ID
  title: string; // 게시글 제목
  content: string; // 게시글 내용
  user: {
    userId: string;
  };
  createdAt?: string; // 작성일
}