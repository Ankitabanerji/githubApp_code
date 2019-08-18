import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gist',
  templateUrl: './gist.component.html',
  styleUrls: ['./gist.component.scss']
})
export class GistComponent implements OnInit {
  public username: any;
  public userId: any;
  public owner: any;
  public showData: boolean;
  public gistData: any;
  public theme: any;
  public error404: boolean;
  public showTimeOut: boolean;
  constructor(private _route: ActivatedRoute, public appservice: AppService, private router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    this._route.params.subscribe(
      (params) => {
        this.showTimeOut = false;
        this.error404 = false; // for managing 404 errors
        this.theme = 'light'; // default theme
        this.owner = {
          name: '',
          dp: '',
          description: '',
          created_at: '',
        };
        this.showData = false;// whether to show gist or loader
        this.gistData = null;
        let authUser = this.appservice.getUserAuthenticationLocalStorage('loggedInuserName'); //getting authenticated user's user ID from local storage
        let authToken = this.appservice.getUserAuthenticationLocalStorage('authTokenGit');//getting authenticated user's auth token from local storage
        this.userId = params.id;// Getting id fron url

        //To Handle situation when it takes excess time to fetch data 
        setTimeout(() => {
          this.showData = true;
          if (this.gistData == null) {
            this.showTimeOut = true;
          }
        }, 20000);

        if (authUser && authToken) { // to check if the user is first authenticated or not
          this.appservice.getUsersGist(this.userId).subscribe(
            (data) => {
              this.showData = true;
              this.owner.name = data.owner.login;
              this.owner.dp = data.owner.avatar_url;
              this.owner.description = data.description;
              this.owner.created_at = data.created_at
              this.gistData = data.files[Object.keys(data.files)[0]];
            },
            (error) => {
              this.error404 = true;
              this.showData = true;
              console.error("error occured", error);
            }
          );
        }
        else { // If unauthorized then go to login page
          console.error("Aunauthorized user");
          this.toastr.error('Please login to continue', 'UnAuthorised', { timeOut: 3000 });
          this.router.navigate(['/login']);
        }
      }
    );
  }

  //Function to change theme
  public changeTheme(theme): any {
    this.theme = theme;
  }

  // Function to navigate to user view
  public goToUserPage(name): any {
    this.router.navigate([`user/${name}`]);
  }
}
