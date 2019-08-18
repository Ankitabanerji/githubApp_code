import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public userInfo: any;
  public userPassword: any;
  public userData: any;

  constructor(public appservice: AppService, public router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    let authUser = this.appservice.getUserAuthenticationLocalStorage('loggedInuserName');// Get data from local storage
    let authToken = this.appservice.getUserAuthenticationLocalStorage('authTokenGit');// Get data from local storage
    if (authUser && authToken) { // Checking whether user is already logged in or not
      this.userData = this.appservice.getUserInfoFromLocalstorage();
      this.router.navigate([`/user/${this.userData.login}`]);
    }
  }

  public login(): any {
    if (!this.userInfo) {
      this.toastr.error('Please enter email/Username', 'Warning', { timeOut: 3000 });
    }
    else if (!this.userPassword) {
      this.toastr.error('Please enter Password', 'Warning', { timeOut: 3000 });
    }
    else {//once the user has filled the form completely fetch data from api and store in local storage
      this.appservice.getAuthenticUserDetail(this.userInfo, this.userPassword).subscribe(
        (data) => {
          this.toastr.success(`Logged In Successfully`, `Hi, ${data.login} !`, { timeOut: 3000 });
          this.appservice.setUserAuthenticationLocalStorage(data.login, 'loggedInuserName');
          this.appservice.setUserInfoInLocalStorage(data);
          this.router.navigate([`/user/${data.login}`]);
        },
        (error) => { //In case users give wrong credentials
          this.toastr.error('Wrong Password or Username Entered', 'Bad Credentials', { timeOut: 3000 });
          console.error("error occured");
        }
      );
    }
  }


}
