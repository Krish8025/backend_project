export const ROLES_KEY = 'roles';

export interface JwtPayload {
  sub: number;
  email: string;
  role_id: number;
  role_name?: string;
}
