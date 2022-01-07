import {
  DetectorControlService, DiagnosticService, DetectorMetaData, DetectorResponse, TelemetryService, TelemetryEventNames, TelemetrySource,
} from 'diagnostic-data';
import { forkJoin, Observable, of } from 'rxjs';
import { Component, AfterViewInit, EventEmitter, Output, Injectable, Input } from '@angular/core';
import { Globals } from '../../../globals';
import { ActivatedRoute, ChildActivationEnd, Router } from '@angular/router';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from  "pdfmake/build/vfs_fonts";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ResiliencyScoreReportHelper } from '../../../shared/utilities/resiliencyScoreReportHelper';
import * as React from 'react';
import { FabCoachmarkComponent } from '../../lib/components/fab-coachmark/coachmark.component';
import { Event as NavigationEvent } from '@angular/router';
import { IButtonProps } from 'office-ui-fabric-react/lib/Button'




@Injectable()
export class ConfigService {
  constructor(private http: HttpClient) { }
}

@Component({
  selector: 'detector-command-bar',
  templateUrl: './detector-command-bar.component.html',
  styleUrls: ['./detector-command-bar.component.scss']
})
export class DetectorCommandBarComponent implements AfterViewInit {
  @Input() disableGenie: boolean = false;
  time: string;
  detector: DetectorMetaData;
  fullReportPath: string;
  gRPDFButton: Element;
  gRPDFButtonChild: Element;
  gRPDFButtonId:string=undefined;
  showTeachingBubble:boolean=false;


  constructor(private globals: Globals, private _detectorControlService: DetectorControlService, private _diagnosticService: DiagnosticService, private _route: ActivatedRoute, private router: Router, private telemetryService: TelemetryService, private http: HttpClient) { }
  toggleOpenState() {
    this.telemetryService.logEvent(TelemetryEventNames.OpenGenie, {
      'Location': TelemetrySource.CategoryPage
    })
    this.globals.openGeniePanel = !this.globals.openGeniePanel;
  }

  sendFeedback() {
    this.telemetryService.logEvent(TelemetryEventNames.OpenFeedbackPanel, {
      'Location': TelemetrySource.CategoryPage
    });
    this.globals.openFeedback = !this.globals.openFeedback;
  }

  generateResiliencyPDF() {
  var localResponse = '../assets/response.temp.json';
  var response = {
  };
  var customerName: string;

  console.log("Calling ResiliencyScore detector");

  //this.http.get<DetectorResponse>(localResponse)
  this._diagnosticService.getDetector("ResiliencyScore", this._detectorControlService.startTimeString, this._detectorControlService.endTimeString)
  .subscribe((httpResponse: DetectorResponse) => {
        response = {
        metadata: httpResponse.metadata,
        dataset: httpResponse.dataset,
        status: httpResponse.status,
        dataProvidersMetadata: httpResponse.dataProvidersMetadata,
        suggestedUtterances: httpResponse.suggestedUtterances,
      };
      console.log("ResiliencyScore detector call finished");
      console.log(response);
      ResiliencyScoreReportHelper.generateResiliencyReport(httpResponse.dataset[0].table);
    },error => {
      console.error(error);
    });

  }



  refreshPage() {
    let childRouteSnapshot = this._route.firstChild.snapshot;
    let childRouteType = childRouteSnapshot.url[0].toString();

    let instanceId = childRouteType === "overview" ? this._route.snapshot.params["category"] : (this._route.snapshot.params["category"] === "DiagnosticTools" ? childRouteSnapshot.url[1].toString() : childRouteType === "detectors" ? childRouteSnapshot.params["detectorName"] : childRouteSnapshot.params["analysisId"]);
    let isDiagnosticToolUIPage = this._route.snapshot.params["category"] === "DiagnosticTools" && childRouteType !== "overview" && instanceId !== "eventviewer" && instanceId !== "freblogs";

    const eventProperties = {
      'Category': this._route.snapshot.params['category'],
      'Location': TelemetrySource.CategoryPage
    };
    if (childRouteType === "detectors") {
      eventProperties['Detector'] = childRouteSnapshot.params['detectorName'];
      eventProperties['Type'] = 'detector';
    } else if (childRouteType === "analysis") {
      eventProperties['Analysis'] = childRouteSnapshot.params["analysisId"];
      eventProperties['Type'] = 'analysis';
    } else if (childRouteType === "overview") {
      eventProperties['Type'] = 'overview';
    } else if (this._route.snapshot.params["category"] === "DiagnosticTools") {
      eventProperties['Type'] = 'DiagnosticTools';
      eventProperties['Tool'] = instanceId ? instanceId : "";
    }

    this.telemetryService.logEvent(TelemetryEventNames.RefreshClicked, eventProperties);
    if (isDiagnosticToolUIPage) {
      // Currently there is no easy way to force reloading the static UI child component under DiagnosticTools Category
      this.router.navigate(['overview'], { relativeTo: this._route, skipLocationChange: true }).then(() => this.router.navigate([`tools/${instanceId}`], { relativeTo: this._route }));
    }
    else if (instanceId) {
      this._detectorControlService.refresh(instanceId);
    }
  }

  toggleOpenTimePicker() {
    this.globals.openTimePicker = !this.globals.openTimePicker;
    this.updateAriaExpanded();
  }

  updateMessage(s: string) {
    this.time = s;
  }

  closeTimePicker() {
    this.globals.openTimePicker = false;
  }

  ngAfterViewInit() {
    // Async to get button element after grandchild is renderded
    setTimeout(() => {
      this.updateAriaExpanded();
    });
  }


  updateAriaExpanded() {
    const btns = document.querySelectorAll("#fab-command-bar button");
    const pdfButtonId = "generatePDFButton";
    if (btns && btns.length > 0) {
      const dropdown = btns[btns.length - 1];
      dropdown.setAttribute("aria-expanded", `${this.globals.openTimePicker}`);
      const PDFButton = btns[btns.length - 2];
      PDFButton.setAttribute("id", pdfButtonId);
    }

    this.gRPDFButtonId = `#${pdfButtonId}`;
  }
}
