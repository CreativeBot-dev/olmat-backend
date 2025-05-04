export class EmailForgotPasswordEvent {
  email: string;
  id: string;
  hash: string;

  constructor(email: string, id: string, hash: string) {
    this.email = email;
    this.id = id;
    this.hash = hash;
  }
}
