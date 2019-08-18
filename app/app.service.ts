import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public url: any;
  constructor(public http: HttpClient) {
    this.url = 'https://api.github.com/';
  }

  //getloggedinUserNameFromLocalstorage
  public getUserInfoFromLocalstorage = () => {
    return JSON.parse(localStorage.getItem('loggedinUserDetail'));
  } // end getloggedinUserNameFromLocalstorage

  //set loggedinUserNameFromLocalstorage
  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('loggedinUserDetail', JSON.stringify(data))
  }// end set loggedinUserNameFromLocalstorage

  public setUserAuthenticationLocalStorage = (data, type) => {
    if (type == 'authTokenGit')
      localStorage.setItem('authTokenGit', JSON.stringify(data))
    if (type == 'loggedInuserName')
      localStorage.setItem('loggedInuserName', JSON.stringify(data))
  }
  public getUserAuthenticationLocalStorage = (type) => {
    if (type == 'authTokenGit')
      return JSON.parse(localStorage.getItem('authTokenGit'));
    else if (type == 'loggedInuserName')
      return JSON.parse(localStorage.getItem('loggedInuserName'));
  }

  public getAuthenticUserDetail(username, password): Observable<any> {
    let auth = username + ":" + password;
    let encodedauth = btoa(auth);
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + encodedauth
      })
    };
    this.setUserAuthenticationLocalStorage(encodedauth, 'authTokenGit');
    return this.http.get(`${this.url}user`, httpOptions);
  }

  public getUsersDetail(username): Observable<any> {
    let encodedauth = this.getUserAuthenticationLocalStorage('authTokenGit');
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + encodedauth
      })
    };
    return this.http.get(`${this.url}users/${username}`, httpOptions);
  }

  public getUsersRepoGistFolDetails(username, type): Observable<any> {
    let encodedauth = this.getUserAuthenticationLocalStorage('authTokenGit');
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + encodedauth
      })
    };
    return this.http.get(`${this.url}users/${username}/${type}`, httpOptions);
  }

  public getUsersGist(id): Observable<any> {
    return this.http.get(`${this.url}gists/${id}`);
  }

  public getUserBySearch(name): Observable<any> {
    let encodedauth = this.getUserAuthenticationLocalStorage('authTokenGit');
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Basic ' + encodedauth
      })
    };
    return this.http.get(`${this.url}search/users?q=${name}+repos:%3E42`, httpOptions);
  }

}
