import * as momentNs from 'moment';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {
  ResourceServiceInputs, ResourceType, ResourceTypeState, ResourceServiceInputsJsonResponse
} from '../../../shared/models/resources';
import { HttpClient } from '@angular/common/http';
import { DropdownMenuItemType, IDropdownOption, IDropdownProps } from 'office-ui-fabric-react';
import { BehaviorSubject } from 'rxjs';
import { DataTableResponseObject, DetectorControlService, HealthStatus } from 'diagnostic-data';
import { AdalService } from 'adal-angular4';
import { UserSettingService } from '../../dashboard/services/user-setting.service';
import { RecentResource } from '../../../shared/models/user-setting';
import { ResourceDescriptor } from 'diagnostic-data'
import { applensDocs } from '../../../shared/utilities/applens-docs-constant';
const moment = momentNs;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  showResourceTypeOptions = false;
  showCaseCleansingOption = false;
  selectedResourceType: ResourceTypeState;
  resourceName: string;
  defaultResourceTypes: ResourceTypeState[] = [
    {
      resourceType: null,
      resourceTypeLabel: 'App name',
      routeName: (name) => `sites/${name}`,
      displayName: 'App',
      enabled: true,
      caseId: false
    },
    {
      resourceType: null,
      resourceTypeLabel: 'ASE name',
      routeName: (name) => `hostingEnvironments/${name}`,
      displayName: 'App Service Environment',
      enabled: true,
      caseId: false
    },
    // {
    //   resourceType: null,
    //   resourceTypeLabel: 'ARM resource ID',
    //   routeName: (name) => `${name}`,
    //   displayName: 'ARM resource ID',
    //   enabled: true,
    //   caseId: false
    // },
    {
      resourceType: null,
      resourceTypeLabel: 'Session Id',
      routeName: (name) => this.getFakeArmResource('Microsoft.AzurePortal', 'sessions', name),
      displayName: 'Portal Session',
      enabled: true,
      caseId: false
    },
    {
      resourceType: null,
      resourceTypeLabel: 'Virtual machine Id',
      routeName: (name) => this.getFakeArmResource('Microsoft.Compute', 'virtualMachines', name),
      displayName: 'Virtual Machine',
      enabled: true,
      caseId: false
    },
    {
      resourceType: null,
      resourceTypeLabel: 'Container App Name',
      routeName: (name) => `containerapps/${name}`,
      displayName: 'Container App',
      enabled: true,
      caseId: false
    }
  ];
  resourceTypes: ResourceTypeState[] = [];

  startTime: momentNs.Moment;
  endTime: momentNs.Moment;
  enabledResourceTypes: ResourceServiceInputs[];
  inIFrame = false;
  errorMessage = "";
  status = HealthStatus.Critical;

  fabDropdownOptions: IDropdownOption[] = [];
  fabDropdownStyles: IDropdownProps["styles"] = {
    dropdownItemsWrapper: {
      maxHeight: '20vh'
    },
  }
  openTimePickerSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  timePickerStr: string = "";
  get disableSubmitButton(): boolean {
    return !this.resourceName || this.resourceName.length === 0;
  }
  troubleShootIcon: string = "../../../../assets/img/applens-skeleton/main/troubleshoot.svg";
  userGivenName: string = "";
  table: RecentResourceDisplay[];
  applensDocs = applensDocs;

  constructor(private _router: Router, private _http: HttpClient, private _detectorControlService: DetectorControlService, private _adalService: AdalService, private _userInfoService: UserSettingService) {
    this.endTime = moment.utc();
    this.startTime = this.endTime.clone().add(-1, 'days');
    this.inIFrame = window.parent !== window;

    if (this.inIFrame) {
      this.resourceTypes = this.resourceTypes.filter(resourceType => !resourceType.caseId);
    }
  }

  ngOnInit() {
    this.resourceTypes = [...this.defaultResourceTypes];
    this.selectedResourceType = this.resourceTypes[0];


    this.fabDropdownOptions.push({
      key: "Provide Resource Name",
      text: "Provide Resource Name",
      ariaLabel: "Provide Resource Name",
      itemType: DropdownMenuItemType.Header
    });

    this.defaultResourceTypes.forEach(resource => {
      this.fabDropdownOptions.push({
        key: resource.displayName,
        text: resource.displayName,
        ariaLabel: resource.displayName
      });
    });

    // TODO: Use this to restrict access to routes that don't match a supported resource type
    this._http.get<ResourceServiceInputsJsonResponse>('assets/enabledResourceTypes.json').subscribe(jsonResponse => {
      this.enabledResourceTypes = <ResourceServiceInputs[]>jsonResponse.enabledResourceTypes;
      // this.enabledResourceTypes.forEach(type => {
      //   const searchSuffix = type.searchSuffix;
      //   if (searchSuffix && searchSuffix.length > 0 && !this.resourceTypes.find(resource => resource.displayName && searchSuffix && resource.displayName.toLowerCase() === searchSuffix.toLowerCase())) {
      //     this.resourceTypes.push({
      //       resourceType: null,
      //       resourceTypeLabel: 'ARM resource ID',
      //       routeName: (name) => `${name}`,
      //       displayName: `${searchSuffix}`,
      //       enabled: true,
      //       caseId: false
      //     });
      //   }
      // });
      this.fabDropdownOptions.push(
        { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
        { key: 'Provide ARM Id', text: 'Provide ARM Id', itemType: DropdownMenuItemType.Header }
      );

      const list = this.enabledResourceTypes.filter(type => this.defaultResourceTypes.findIndex(defaultResource => defaultResource.displayName === type.displayName) === -1);

      list.sort((a,b) => {
        return a.displayName.localeCompare(b.displayName);
      })

      list.forEach(resource => {
        this.resourceTypes.push({
          resourceType: resource.resourceType,
          resourceTypeLabel: 'ARM resource ID',
          routeName: (name) => `${name}`,
          displayName: `${resource.displayName}`,
          enabled: true,
          caseId: false
        });

        this.fabDropdownOptions.push(
          {
            key: resource.displayName,
            text: resource.displayName,
            ariaLabel: resource.displayName
          }
        )
      });





      // this.resourceTypes.forEach(resource => {
      //   const displayName = resource.displayName;
      //   this.fabDropdownOptions.push({
      //     key: displayName,
      //     text: displayName,
      //     ariaLabel: displayName
      //   });
      // });

      this._userInfoService.getUserSetting().subscribe(userInfo => {
        if (userInfo && userInfo.resources) {
          this.table = this.generateDataTable(userInfo.resources);
        }
      });
    });


    this._detectorControlService.timePickerStrSub.subscribe(s => {
      this.timePickerStr = s;
      this._detectorControlService.timeRangeErrorString
    });

    this.userGivenName = this._adalService.userInfo.profile.given_name;

  }

  selectResourceType(type: ResourceTypeState) {
    if (type.enabled) {
      this.selectedResourceType = type;
      this.showResourceTypeOptions = false;
    }
  }

  selectDropdownKey(e: { option: IDropdownOption, index: number }) {
    const resourceType = this.resourceTypes.find(resource => resource.displayName === e.option.key);
    this.selectResourceType(resourceType);
  }

  private normalizeArmUriForRoute(resourceURI: string, enabledResourceTypes: ResourceServiceInputs[]): string {
    resourceURI = resourceURI.trim();
    const resourceUriPattern = /subscriptions\/(.*)\/resourceGroups\/(.*)\/providers\/(.*)/i;
    const result = resourceURI.match(resourceUriPattern);

    if (result && result.length === 4) {
      let allowedResources: string = "";
      let routeString: string = '';

      if (enabledResourceTypes) {
        enabledResourceTypes.forEach(enabledResource => {
          allowedResources += `${enabledResource.resourceType}\n`;
          const resourcePattern = new RegExp(
            `(?<=${enabledResource.resourceType.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\/).*`, 'i'
          );
          const enabledResourceResult = result[3].match(resourcePattern);

          if (enabledResourceResult) {
            routeString = `subscriptions/${result[1]}/resourceGroups/${result[2]}/providers/${enabledResource.resourceType}/${enabledResourceResult[0]}`;
          }
        });
      }

      this.errorMessage = routeString === '' ?
        'The supplied ARM resource is not enabled in AppLens. Allowed resource types are as follows\n\n' +
        `${allowedResources}` :
        '';

      return routeString;
    } else {
      this.errorMessage = "Invalid ARM resource id. Resource id must be of the following format:\n" +
        `  /subscriptions/<sub id>/resourceGroups/<resource group>/providers/${this.selectedResourceType.resourceType}/` +
        "<resource name>";

      return resourceURI;
    }
  }

  onSubmit() {
    this.resourceName = this.resourceName.trim();

    //If it is ARM resource id
    if (this.defaultResourceTypes.findIndex(resource => this.selectedResourceType.displayName === resource.displayName) === -1) {
      this.resourceName = this.normalizeArmUriForRoute(this.resourceName, this.enabledResourceTypes);
    } else {
      this.errorMessage = "";
    }

    let route = this.selectedResourceType.routeName(this.resourceName);

    if (route === 'srid') {
      window.location.href = `https://azuresupportcenter.msftcloudes.com/caseoverview?srId=${this.resourceName}`;
    }

    let startUtc = this._detectorControlService.startTime;
    let endUtc = this._detectorControlService.endTime;

    let timeParams = {
      startTime: startUtc ? startUtc.format('YYYY-MM-DDTHH:mm') : "",
      endTime: endUtc ? endUtc.format('YYYY-MM-DDTHH:mm') : ""
    }

    let navigationExtras: NavigationExtras = {
      queryParams: timeParams
    }

    if (this.errorMessage === '') {
      this._router.navigate([route], navigationExtras);
    }
  }

  caseCleansingNavigate() {
    this._router.navigate(["caseCleansing"]);
  }

  private getFakeArmResource(rpName: string, serviceName: string, resourceName: string): string {
    let fakeRes = `/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/Fake-RG/providers/${rpName}/${serviceName}/${resourceName}`;
    return fakeRes;
  }

  openTimePicker() {
    this.openTimePickerSubject.next(true);
  }

  private generateDataTable(recentResources: RecentResource[]) {

    let rows: RecentResourceDisplay[];
    rows = recentResources.map(recentResource => {
      var descriptor = ResourceDescriptor.parseResourceUri(recentResource.resourceUri);
      const name = descriptor.resource;
      const type = `${descriptor.provider}/${descriptor.type}`.toLowerCase();
      const resourceType = this.enabledResourceTypes.find(t => t.resourceType.toLocaleLowerCase() === type);
      const display: RecentResourceDisplay = {
        name: name,
        imgSrc: resourceType ? resourceType.imgSrc : "",
        type: resourceType ? resourceType.displayName : "",
        kind: recentResource.kind,
        resourceUri: recentResource.resourceUri
      }
      if (type === "microsoft.web/sites") {
        this.updateDisplayWithKind(recentResource.kind, display);
      }
      return display;
    });
    return rows;
  }

  //To do, Add a utility method to check kind and use in main.component and site.service
  private updateDisplayWithKind(kind: string, recentResourceDisplay: RecentResourceDisplay) {
    if (kind && kind.toLowerCase().indexOf("workflowapp") !== -1) {
      recentResourceDisplay.imgSrc = "assets/img/Azure-LogicAppsPreview-Logo.svg";
      recentResourceDisplay.type = "Logic App";
    } else if (kind && kind.toLowerCase().indexOf("functionapp") !== -1) {
      recentResourceDisplay.imgSrc = "assets/img/Azure-Functions-Logo.png";
      recentResourceDisplay.type = "Function App";
    } else if (kind && kind.toLowerCase().indexOf("linux") !== -1) {
      recentResourceDisplay.imgSrc = "assets/img/Azure-Tux-Logo.png";
      recentResourceDisplay.type = "Linux Web App";
    }
  }

  //Todo, once get startTime,endTime from database,replace with those get from detectorControlService
  private onNavigateRecentResource(recentResource: RecentResourceDisplay) {
    let startUtc = this._detectorControlService.startTime;
    let endUtc = this._detectorControlService.endTime;

    let timeParams = {
      startTime: startUtc ? startUtc.format('YYYY-MM-DDTHH:mm') : "",
      endTime: endUtc ? endUtc.format('YYYY-MM-DDTHH:mm') : ""
    }

    let navigationExtras: NavigationExtras = {
      queryParams: timeParams
    }
    const route = recentResource.resourceUri
    this._router.navigate([route], navigationExtras);
  }

  clickRecentResourceHandler(event: Event, recentResource: RecentResourceDisplay) {
    event.stopPropagation();
    this.onNavigateRecentResource(recentResource);
  }


}

interface RecentResourceDisplay extends RecentResource {
  name: string;
  imgSrc: string;
  type: string;
}


