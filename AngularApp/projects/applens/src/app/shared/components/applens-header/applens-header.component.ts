import { Component, Injector, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdalService } from 'adal-angular4';
import { UserSettingService } from '../../../modules/dashboard/services/user-setting.service';
import { ResourceInfo } from '../../models/resources';
import { UserSetting } from '../../models/user-setting';
import { DiagnosticApiService } from '../../services/diagnostic-api.service';

@Component({
  selector: 'applens-header',
  templateUrl: './applens-header.component.html',
  styleUrls: ['./applens-header.component.scss']
})
export class ApplensHeaderComponent implements OnInit {
  userPhotoSource: string = "";
  showCallout: boolean = false;
  resourceInfo: ResourceInfo = new ResourceInfo();
  expandCheckCard: boolean = false;
  //Only If user changed setting, then send request to backend
  userSettingChanged: boolean = false;
  constructor(private _adalService: AdalService, private _diagnosticApiService: DiagnosticApiService, private _activatedRoute: ActivatedRoute, private _userSettingService: UserSettingService) { }

  ngOnInit() {
    const alias = this._adalService.userInfo.profile ? this._adalService.userInfo.profile.upn : '';
    const userId = alias.replace('@microsoft.com', '');
    this._diagnosticApiService.getUserPhoto(userId).subscribe(image => {
      this.userPhotoSource = image;
    });
    if (this._activatedRoute.snapshot.data["info"]) {
      this.resourceInfo = this._activatedRoute.snapshot.data["info"];
    }
    this._userSettingService.getUserSetting().subscribe(userSettings => {
      this.expandCheckCard = userSettings ? userSettings.expandAnalysisCheckCard : false;
    });
  }

  navigateToLandingPage() {
    window.location.href = "/";
  }

  toggleExpandCheckCard(event: { checked: boolean }) {
    this.userSettingChanged = true;
    this.expandCheckCard = event.checked;
  }

  //Can add more updated userSetting into it
  private updateUserSetting() {
    this._userSettingService.updateUserSetting(this.expandCheckCard, this.updateUserSettingCallBack);
  }

  private updateUserSettingCallBack(expandAnalysisCard: boolean, userSettings: UserSetting): UserSetting {
    const newUserSetting = { ...userSettings };
    newUserSetting.expandAnalysisCheckCard = expandAnalysisCard;
    return newUserSetting;
  }

  openCallout() {
    this.showCallout = true;
  }

  applyUserSettingChange() {
    if(this.userSettingChanged) {
      this.updateUserSetting();
    }
    this.showCallout = false;
  }

  cancelUserSettingChange() {
    this.showCallout = false;
  }
}
