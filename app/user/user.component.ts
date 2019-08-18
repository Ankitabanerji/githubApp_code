import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';

declare var require: any; //for high charts
var Highcharts = require('highcharts');
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  public username: any;
  public userData: any;
  public isAuthUser: boolean;
  public repoList: any;
  public showRepoList: boolean;
  public gistList: any;
  public showGistList: boolean;
  public followerList: any;
  public showFollowerList: boolean;
  public tabHeaders: any;
  public colors: any; // for circle lables used in repos and gist list
  public showContent: boolean;
  public showTimeOut: boolean;
  public error404: boolean;
  constructor(private toastr: ToastrService, private _route: ActivatedRoute, public appservice: AppService, private router: Router, private el: ElementRef) {
    this.colors = ['#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab', '#00897b', '#7cb342', '#fdd835', '#fb8c00', '#f4511e'];
  }

  ngOnInit() {
    // To fetch url parameters
    this._route.params.subscribe(
      (params) => {
        this.showRepoList = false;
        this.showGistList = false;
        this.showFollowerList = false;
        this.showTimeOut = false;
        this.showContent = false;
        this.error404 = false;
        this.tabHeaders = { // to select tabs
          active: 'Repositories',
          list: ['Repositories', 'Gists', 'Followers']
        }
        this.userData = null; // users profile data
        this.repoList = []; // users' list of repository
        this.gistList = []; // users' list of gist
        this.followerList = []; //users' list of followers
        let authUser = this.appservice.getUserAuthenticationLocalStorage('loggedInuserName');// get data from local storage
        let authToken = this.appservice.getUserAuthenticationLocalStorage('authTokenGit'); // get data from local storage
        this.isAuthUser = false; // to check if given user is logged in user or not
        this.username = params.username;
        //to handle time out
        setTimeout(() => {
          this.showContent = true;
          if (this.userData == null) {
            this.showTimeOut = true;
          }
        }, 20000);

        if (authUser && authToken) { // to check if the user is first authenticated or not
          if (authUser == this.username) { // To fetch logged in user's details
            this.isAuthUser = true;
            this.showContent = true;
            this.userData = this.appservice.getUserInfoFromLocalstorage();
            this.getUsersRepoList(this.userData.login);
            this.getUsersGistList(this.userData.login);
            this.getUsersFollowerList(this.userData.login);
            let repoData = [
              {
                name: 'Public',
                y: this.userData.public_repos,
                dataLabels: {
                  enabled: false
                },
                color: '#72a435'
              },
              {
                name: 'Private',
                y: this.userData.total_private_repos,
                dataLabels: {
                  enabled: false
                },
                color: '#96c950'
              }];
            let gistData = [
              {
                name: 'Public',
                y: this.userData.public_gists,
                dataLabels: {
                  enabled: false
                },
                color: '#f77f00'
              },
              {
                name: 'Private',
                y: this.userData.private_gists,
                dataLabels: {
                  enabled: false
                },
                color: '#fcbf49'
              }];
            setTimeout(() => {
              this.pieChart('repoGraph', 'Repository', repoData, repoData[0].y + repoData[1].y);
              this.pieChart('gistGraph', 'Gists', gistData, gistData[0].y + gistData[1].y);
            }, 500);

          }
          else {
            this.getUsersDetail(this.username); // To fetch other users details
          }
        }
        else { // if user is not authenticated
          console.error('unauthorized user please login');
          this.toastr.error('Please login to continue', 'UnAuthorised', { timeOut: 3000 });
          this.router.navigate(['/login']);
        }
      }
    )
  }

  // Function to fetch other users' details
  public getUsersDetail(name): any {
    this.appservice.getUsersDetail(name).subscribe(
      (data) => {
        this.showContent = true;
        this.userData = data;
        this.getUsersRepoList(name);
        this.getUsersGistList(name);
        this.getUsersFollowerList(name);
      },
      (error) => {
        this.error404 = true;
        this.showContent = true;
        console.error("error occured", error);
      }
    );
  }

  // Function to fetch users' List of repositories
  public getUsersRepoList(userName): any {
    this.appservice.getUsersRepoGistFolDetails(userName, 'repos').subscribe(
      (repolist) => {
        this.showRepoList = true;
        repolist.map((repo) => {
          this.repoList.push({ data: repo, color: this.getRandomColor() })
        });
      },
      (error) => {
        console.error('error occured', error);
      }
    );
  }

  //Function to fetch users' List of gist
  public getUsersGistList(userName): any {
    this.appservice.getUsersRepoGistFolDetails(userName, 'gists').subscribe(
      (gistList) => {
        this.showGistList = true;
        gistList.map(
          (gist) => {
            this.gistList.push({
              'id': gist.id,
              'data': gist.files[Object.keys(gist.files)[0]],
              'createdAt': gist.created_at,
              'description': gist.description,
              'color': this.getRandomColor()
            })
          })
      }
    );
  }

  public getUsersFollowerList(userName): any {
    this.appservice.getUsersRepoGistFolDetails(userName, 'followers').subscribe(
      (followers) => {
        this.showFollowerList = true;
        followers.map((item) => {
          this.followerList.push({
            'login': item.login,
            'dp': item.avatar_url
          });
        });
      },
      (error) => {
        console.error('error occured', error);
      }
    )
  }

  // Pie Chart for authenticated user's profile detail
  public pieChart(id, type, data, total) {
    let selector = this.el.nativeElement.querySelector(`#${id}`);
    Highcharts.chart(selector, {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        width: 100,
        height: 100
      },
      title: {
        text: `${total}`,
        align: 'center',
        verticalAlign: 'middle',
        y: 6
      },
      tooltip: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: false,
          },
          startAngle: -90,
          endAngle: -90,
          center: ['50%', '50%'],
          size: '130%'
        }
      },
      series: [{
        type: 'pie',
        name: type,
        innerSize: '60%',
        data: data
      }]
    });

  }

  // Function to redirect to a link in new tab
  public redirect(url): any {
    window.open(url, '_blank');
  }

  // Function to select a tab
  public selectTab(tab) {
    this.tabHeaders.active = tab;
  }

  // Function to generate random colors from colors array
  public getRandomColor() {
    return Math.floor(Math.random() * this.colors.length)
  }

  public goToUserProfil(name): any {
    this.router.navigate([`/user/${name}`]);
  }
  public viewGist(id): any {
    this.router.navigate([`/gist/${id}`]);
  }
}
