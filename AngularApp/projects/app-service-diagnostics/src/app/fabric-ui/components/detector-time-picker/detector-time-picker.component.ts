import { Component, OnInit, EventEmitter, Output, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetectorControlService, TelemetryService, TelemetryEventNames } from 'diagnostic-data';
import { ICalendarStrings, IDatePickerProps, IChoiceGroupOption } from 'office-ui-fabric-react';
import { addMonths, addDays } from 'office-ui-fabric-react/lib/utilities/dateMath/DateMath';
import * as momentNs from 'moment';
import { Globals } from '../../../globals';

@Component({
  selector: 'detector-time-picker',
  templateUrl: './detector-time-picker.component.html',
  styleUrls: ['./detector-time-picker.component.scss']
})
export class DetectorTimePickerComponent implements OnInit {
  @Output() updateTimerMessage: EventEmitter<string> = new EventEmitter<string>(true);
  showCalendar: boolean = false;
  showTimePicker: boolean = false;
  defaultSelectedKey: string;

  today: Date = new Date(Date.now());
  maxDate: Date = this.convertUTCToLocalDate(this.today);
  minDate: Date = this.convertUTCToLocalDate(addDays(this.today, -30));

  set time(value: string) {
    this.updateTimerMessage.next(value);
  };
  startDate: Date;
  endDate: Date;
  //set Last xx hours
  hourDiff: number;

  startClock: string;
  endClock: string;
  timeDiffError: string = "";

  formatDate: IDatePickerProps['formatDate'] = (date) => {
    //only this format can do both fill in date and select date
    return momentNs(date).format('M/D/YY');
  };

  choiceGroupOptions: IChoiceGroupOption[] = [
    { key: 'Last1Hour', text: 'Last 1 Hour', onClick: () => { this.setTime(1) } },
    { key: 'Last6Hours', text: 'Last 6 Hours', onClick: () => { this.setTime(6) } },
    { key: 'Last12Hour', text: 'Last 12 Hours', onClick: () => { this.setTime(12) } },
    { key: 'Last24Hours', text: 'Last 24 Hours', onClick: () => { this.setTime(24) } },
    { key: 'Custom', text: 'Custom', onClick: () => { this.selectCustom() } },
  ];

  dayPickerString: ICalendarStrings = {
    months:
      [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],

    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

    goToToday: 'Go to today',
    weekNumberFormatString: 'Week number {0}',
  };

  constructor(private activatedRoute: ActivatedRoute, private detectorControlService: DetectorControlService, private router: Router, public globals: Globals, private render: Renderer2,private telemetryService:TelemetryService) {
    //When close if click outside
    this.render.listen('window', 'click', (e: Event) => {
      const clickElement = <HTMLElement>(e.target);
      const timePicker = document.getElementById('timePicker');
      //Get time text div in command bar
      const commandBar = document.querySelector('.ms-CommandBar-secondaryCommand');
      if (timePicker && commandBar && !timePicker.contains(clickElement) && !commandBar.contains(clickElement)) {
        this.closeTimePicker();
      }
    })
  }

  ngOnInit() {
    this.startDate = addDays(this.today, -1);
    this.endDate = this.today;

    this.globals.timePickerInfoSub.subscribe(timerPickerInfo => {
      const option = this.choiceGroupOptions.find(option => timerPickerInfo.selectedKey === option.key);
      this.defaultSelectedKey = option.key;
      //If it's customized then should default the option
      //If not customized then prefill start date and endDate
      if (timerPickerInfo.selectedKey === 'Custom') {
        this.showTimePicker = true;
        this.startDate = timerPickerInfo.startDate;
        this.endDate = timerPickerInfo.endDate;

        //startDate and endDate contains current hour and minute info, only need HH:mm
        this.startClock = this.getHourAndMinute(timerPickerInfo.startDate);
        this.endClock = this.getHourAndMinute(timerPickerInfo.endDate);
      } else {
        //Trigger setTime function to set this.hourDiff
        option.onClick.apply(this);
      }
    });

    this.timeDiffError = '';
    if (this.detectorControlService.timeRangeDefaulted) {
      this.timeDiffError = this.detectorControlService.timeRangeErrorString;
    }

    this.detectorControlService.update.subscribe(validUpdate => {
      if (validUpdate) {
        //Todo, update custom prefill info
        const startTime = this.detectorControlService.startTimeString;
        const endTime = this.detectorControlService.endTimeString;

        const timeFromat = 'M/D/YY HH:mm';
        const formattedStartTime = momentNs.utc(startTime).format(timeFromat);
        const formattedEndTime = momentNs.utc(endTime).format(timeFromat);
        this.time = `UTC Time Range (${formattedStartTime} to ${formattedEndTime})`;
      }
      const routeParams = {
        'startTime': this.detectorControlService.startTime.format('YYYY-MM-DDTHH:mm'),
        'endTime': this.detectorControlService.endTime.format('YYYY-MM-DDTHH:mm')
      };
      if (this.detectorControlService.detectorQueryParamsString != "") {
        routeParams['detectorQueryParams'] = this.detectorControlService.detectorQueryParamsString;
      }
      if (this.activatedRoute.queryParams['searchTerm']) {
        routeParams['searchTerm'] = this.activatedRoute.snapshot.queryParams['searchTerm'];
      }
      this.router.navigate([], { queryParams: routeParams, relativeTo: this.activatedRoute });
    });
  }

  setTime(hourDiff: number) {
    this.showTimePicker = false;
    this.timeDiffError = '';
    this.hourDiff = hourDiff;
  }

  //Click outside or tab to next component
  closeTimePicker() {
    this.globals.openTimePicker = false;
    this.showTimePicker = this.defaultSelectedKey === "Custom";
  }

  //Press Escape,Click Cancel
  cancelTimeRange() {
    this.closeTimePicker();
    (<HTMLInputElement>document.querySelector('.ms-CommandBar-secondaryCommand button')).focus();
  }

  //clickHandler for apply button
  applyTimeRange() {
    let startDateWithTime: string;
    let endDateWithTime: string;
    let timePickerInfo: TimePickerInfo;
    //customize
    if (this.showTimePicker) {
      startDateWithTime = this.convertDateTimeToString(this.startDate,this.startClock);
      endDateWithTime = this.convertDateTimeToString(this.endDate,this.endClock);
      //for timer picker, date and hour,minute
      let infoStartDate = new Date(this.startDate);
      infoStartDate.setHours(Number.parseInt(this.startClock.split(":")[0]), Number.parseInt(this.startClock.split(":")[1]));
      let infoEndDate = new Date(this.endDate);
      infoEndDate.setHours(Number.parseInt(this.endClock.split(":")[0]), Number.parseInt(this.endClock.split(":")[1]));
      timePickerInfo =
      {
        selectedKey: 'Custom',
        startDate: infoStartDate,
        endDate: infoEndDate
      };
    } else {
      this.today = new Date();
      const localEndTime = this.today;
      const localStartTime = new Date(localEndTime.getTime() - this.hourDiff * 60 * 60 * 1000);
      startDateWithTime = this.convertLocalDateToUTC(localStartTime);
      endDateWithTime = this.convertLocalDateToUTC(localEndTime);

      //find which option contains the hourDiff number
      const infoSelectKey = this.choiceGroupOptions.find(option => option.key.includes(this.hourDiff.toString())).key
      timePickerInfo = {
        selectedKey: infoSelectKey
      };
    }

    this.timeDiffError = this.detectorControlService.getTimeDurationError(startDateWithTime, endDateWithTime);
    if (this.timeDiffError === '') {
      this.detectorControlService.setCustomStartEnd(startDateWithTime, endDateWithTime);
      this.globals.updateTimePickerInfo(timePickerInfo);
    }
    this.globals.openTimePicker = this.timeDiffError !== "";
    //Refoucs to command-bar text message again
    (<HTMLInputElement>document.querySelector('.ms-CommandBar-secondaryCommand button')).focus();

    const eventProperties = {
      'Title': timePickerInfo.selectedKey
    }
    if (timePickerInfo.startDate) {
      const startTimeString = momentNs(timePickerInfo.startDate).format(this.detectorControlService.stringFormat);
      eventProperties['StartTime'] = startTimeString;
    }
    if (timePickerInfo.endDate) {
      const endTimeString = momentNs(timePickerInfo.startDate).format(this.detectorControlService.stringFormat);
      eventProperties['EndTime'] = endTimeString;
    }
    this.telemetryService.logEvent(TelemetryEventNames.TimePickerApplied,eventProperties);
  }

  onSelectStartDateHandler(e: { date: Date }) {
    this.startDate = e.date;
  }
  onSelectEndDateHandler(e: { date: Date }) {
    this.endDate = e.date;
  }


  private convertLocalDateToUTC(date: Date): string {
    const moment = momentNs.utc(date.getTime());
    return moment.format(this.detectorControlService.stringFormat);
  }

  //convert ISO string(UTC time) to LocalDate with same year,month,date...
  private convertUTCToLocalDate(date: Date): Date {
    const moment = momentNs.utc(date);
    return new Date(
      moment.year(),moment.month(),moment.date(),
      moment.hour(),moment.minute()
    );
  }

  //Get HH:mm from date
  private getHourAndMinute(date: Date): string {
    return momentNs(date).format('HH:mm');
  }

  private convertDateTimeToString(date:Date,time:string): string {
    const dateString = momentNs(date).format('YYYY-MM-DD');
    const hour = Number.parseInt(time.split(':')[0]) < 10 ? `0${Number.parseInt(time.split(':')[0])}` : `${Number.parseInt(time.split(':')[0])}`;
    const minute = Number.parseInt(time.split(':')[1]) < 10 ? `0${Number.parseInt(time.split(':')[1])}` : `${Number.parseInt(time.split(':')[1])}`;
    return `${dateString} ${hour}:${minute}`;
  }


  //when click LastXX hours,prefill into custom input, should be UTC time
  selectCustom() {
    this.showTimePicker = true;
    this.timeDiffError = "";

    const end = this.today;
    const start = new Date(end.getTime() - this.hourDiff * 60 * 60 * 1000);
    this.startDate = this.convertUTCToLocalDate(start);
    this.endDate = this.convertUTCToLocalDate(end);

    //startDate and endDate contains current hour and minute info
    //only need HH:mm
    this.startClock = this.getHourAndMinute(this.startDate);
    this.endClock = this.getHourAndMinute(this.endDate);
  }

  getErrorMessageOnTextField(value: string): string {
    var values = value.split(":");
    var errorMessage = "";
    if (!(values.length > 1 && +values[0] <= 24 && +values[1] <= 59)) {
      errorMessage = `Invalid time`;
    }
    return errorMessage;
  }

  escapeHandler(e: KeyboardEvent) {
    //If not enter date or time,ESC will close time picker
    const ele = (<HTMLElement>e.target);
    if (!ele.className.includes('ms-TextField-field')) {
      this.cancelTimeRange();
    }
  }

  tabHandler(e: KeyboardEvent) {
    const ele = <HTMLElement>e.target;
    //Tab to Cancel button will close 
    if (ele.innerText.toLowerCase() === 'cancel') {
      this.closeTimePicker();
    }
  }
}

export interface TimePickerInfo {
  selectedKey: string,
  //if it is customized, then prefill with strart date and time
  startDate?: Date,
  endDate?: Date,
}
