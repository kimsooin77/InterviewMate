export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export class SignupResponseDto {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}
