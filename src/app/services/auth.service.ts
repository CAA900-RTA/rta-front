// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { signUp, signIn, signOut, getCurrentUser, confirmSignUp, type SignUpInput, type SignInInput } from 'aws-amplify/auth';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  username: string;
  email?: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkCurrentUser();
  }

  async checkCurrentUser(): Promise<void> {
    try {
      const user = await getCurrentUser();
      this.currentUserSubject.next({
        username: user.username,
        userId: user.userId,
        email: user.signInDetails?.loginId
      });
    } catch (error) {
      this.currentUserSubject.next(null);
    }
  }

  async signUp(email: string, password: string, username: string): Promise<any> {
    const signUpInput: SignUpInput = {
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          preferred_username: username,
        },
      },
    };

    try {
      const result = await signUp(signUpInput);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async confirmSignUp(email: string, code: string): Promise<any> {
    try {
      const result = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<any> {
    const signInInput: SignInInput = {
      username: email,
      password,
    };

    try {
      const result = await signIn(signInInput);
      await this.checkCurrentUser(); // Update current user after successful sign in
      return result;
    } catch (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut();
      this.currentUserSubject.next(null);
    } catch (error) {
      throw error;
    }
  }

  // Add these new methods
  async getCurrentUserAsync(): Promise<User | null> {
    try {
      const user = await getCurrentUser();
      return {
        username: user.username,
        userId: user.userId,
        email: user.signInDetails?.loginId
      };
    } catch (error) {
      return null;
    }
  }

  async isAuthenticatedAsync(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  // Force sign in - sign out existing user first, then sign in
  async forceSignIn(email: string, password: string): Promise<any> {
    try {
      // First, try to sign out any existing user
      await this.signOut();
    } catch (error) {
      // Ignore errors if no user is signed in
      console.log('No existing user to sign out');
    }
    
    // Now sign in with new credentials
    return this.signIn(email, password);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}