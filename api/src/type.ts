// Users
export type createUserParams = {
  phone_number: string;
  password: string;
};
export type loginParams = {
  phone_number: string;
  password: string;
};
export type verifyOTP = {
  id: number;
  OTP: number;
};
export type updateUserParams = {
  old_password: string;
  new_password: string;
};

// Profiles
export type createProfileParams = {
  first_name: string;
  last_name: string;
  profile_pic: string;
  about: string;
};
export type updateProfileParams = {
  first_name: string;
  last_name: string;
  profile_pic: string;
  about: string;
};