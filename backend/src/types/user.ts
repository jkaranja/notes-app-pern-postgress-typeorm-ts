export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  profileUrl: string; //image url on cloud nary
  roles: string[]; //with array, you can do user.roles.push('')
  newEmail: string;
  isVerified: boolean;
  verifyEmailToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordTokenExpiresAt: number | null;
}
