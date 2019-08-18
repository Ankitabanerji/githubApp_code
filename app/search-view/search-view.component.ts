import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-search-view',
  templateUrl: './search-view.component.html',
  styleUrls: ['./search-view.component.scss']
})
export class SearchViewComponent implements OnInit {
  public userData: any;
  public userName: any;
  public showContent: boolean;
  public noUserFound: boolean;
  public showTimeOut: boolean;
  constructor(private _route: ActivatedRoute, public appservice: AppService, private router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    this._route.params.subscribe(
      (params) => {
        this.showContent = false;
        this.noUserFound = false;
        this.showTimeOut = false;
        let authUser = this.appservice.getUserAuthenticationLocalStorage('loggedInuserName');// get local storage data
        let authToken = this.appservice.getUserAuthenticationLocalStorage('authTokenGit');// get local storage data
        this.userName = params.name;// get name from url
        this.userData = null;

        //To Handle situation when it takes excess time to fetch data 
        setTimeout(() => {
          this.showContent = true;
          if (this.noUserFound == false && this.userData == null) {
            this.showTimeOut = true;
          }
        }, 20000);

        if (authUser && authToken) {// to check if the user is first authenticated or not
          this.appservice.getUserBySearch(this.userName).subscribe(
            (userData) => {
              this.showContent = true;
              this.userData = userData;
              if (this.userData.total_count == 0) {
                this.noUserFound = true;
              }
            },
            (error) => {
              console.error('error occured ', error);
            }
          );
        }
        else {//Prevent access by unauthorized user
          console.error("error occured");
          this.toastr.error('Please login to continue', 'UnAuthorised', { timeOut: 3000 });
          this.router.navigate(['/login']);
        }
      }
    );
  }

  //navigate to user view
  public goToUserView(name): any {
    this.router.navigate([`user/${name}`]);
  }

  //Open new tab
  public viewOnGit(href): any {
    window.open(href, '_blank');
  }
}
