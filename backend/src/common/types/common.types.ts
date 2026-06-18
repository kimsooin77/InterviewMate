export interface JwtPayload {
  sub: number;
  email: string;
}

export interface CurrentUserData {
  id: number;
  email: string;
}
