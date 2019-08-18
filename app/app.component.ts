import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppService } from './app.service';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public searchBy: any;
  public showSearchAndProfile: boolean;
  public userData: any;
  public cookies: Object;

  constructor(private router: Router, public appservice: AppService, public location: Location, private toastr: ToastrService) {
  }

  // To make Nav bar sticky top
  @HostListener("window:scroll", [])
  onWindowScroll() {
    let header = document.getElementById("github-navbar");
    let sticky = header.offsetTop;

    if (window.pageYOffset > sticky) {
      header.classList.remove("sticky-top");
      header.classList.add("fixed-top");
    } else {
      header.classList.remove("fixed-top");
      header.classList.add("sticky-top");
    }
  }

  ngOnInit() {
    //to hide search bar and profile pic from login page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      let loc = this.location.path()
      if (loc.includes('login')) {
        this.showSearchAndProfile = false;
      }
      else {
        if (this.appservice.getUserInfoFromLocalstorage()) {
          this.userData = this.appservice.getUserInfoFromLocalstorage(); //Geting data from local storage
          this.showSearchAndProfile = true;
        }
        else {
          //To handle situation when unauthorised user tries to access pages
          this.toastr.error('Please login to continue', 'UnAuthorised', { timeOut: 3000 });
          this.router.navigate(['/login']);
        }
      }
    });
  }

  // Function to accept input in search box
  public getSearchValue(event) {
    if (event.keyCode === 13) {
      this.searchBy = event.target.value;
      this.router.navigate([`/search/${this.searchBy}`]);
    }
  }

  //Function to view autherized users profile page
  public goToMyProfile(): any {
    this.router.navigate([`/user/${this.userData.login}`]);
  }

  //Function to log out
  public logout(): any {
    localStorage.clear(); //clear local storage once user logs out
    this.router.navigate(['/login']);
  }
}
