export enum UserRole {
  User = 'user',
  Admin = 'admin',
  Banned = 'banned',
}

export const UserRoleValues = Object.values(UserRole) as string[]
