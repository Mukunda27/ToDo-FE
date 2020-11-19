import { Component, OnInit, OnDestroy } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Task } from '../../task.model';
import { TaskService } from '../../task.service';
import { ListService } from '../../list.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { faStar, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import startOfToday from 'date-fns/startOfToday';
import { SocketService } from '../../socket.service';
import { User } from '../../user.model';
import { UserService } from '../../user.service';
import { PageEvent } from '@angular/material/paginator';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (isSubmitted));
  }
}

@Component({
  selector: 'app-task-dashboard',
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss']
})
export class TaskDashboardComponent implements OnInit, OnDestroy {
  matcher = new MyErrorStateMatcher();
  faStar = faStar;
  faTrashAlt = faTrashAlt;
  authenticatedUser: User;
  private authenticationStatusSubscription: Subscription;
  creatingTask = false;
  timeOptions = ['AM', 'PM'];
  selectedTimeOption = 'AM';
  predefinedLists = ['shopping', 'fitness'];
  hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  selectedHour: string;
  minutes = ['00', '15', 30, '45'];
  selectedMinute: string;
  allLists = [];
  selectedList: string;
  finishDate = startOfToday();
  private taskSub: Subscription;
  private listSub: Subscription;
  allTasks: Task[];
  taskAreaHeader: string;
  fetching = false;
  taskCreationProgress = false;
  tasksPerPage = 9;
  currentPage = 1;
  maxTasks: number;

  constructor(
    private taskService: TaskService,
    private listService: ListService,
    private route: ActivatedRoute,
    private socketService: SocketService,
    private userService: UserService) {
  }

  ngOnInit(): void {
    this.fetching = true;

    this.authenticationStatusSubscription = this.userService.observeAuthenticationStatus()
      .subscribe(user => {
        this.authenticatedUser = user;
      });

    this.taskSub = this.taskService
      .getTasksUpdateListener()
      .subscribe((taskData: any) => {
        this.fetching = false;
        this.allTasks = taskData.tasks;
        this.maxTasks = taskData.totalTasks;
      });
    this.listSub = this.listService
      .listUpdatedListener()
      .subscribe((listData: { lists: string[] }) => {
        const customLIsts = listData.lists;
        this.allLists = this.predefinedLists.concat(customLIsts);
      });

    this.route.queryParams
      .subscribe(params => {
        this.currentPage = 1;
        this.allTasks = [];
        this.fetching = true;
        this.getTasksBasedOnQueryParams(params);
      });

    this.selectedHour = '06';
    this.selectedMinute = '00';
    this.getAllLists();
  }

  selectTimeOption(option: string) {
    this.selectedTimeOption = option;
  }

  onChangedPage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;


    this.getTasksBasedOnQueryParams(this.route.snapshot.queryParams);
  }

  createTask(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const time = this.selectedHour + ':' + this.selectedMinute + ' ' + this.selectedTimeOption;
    let important = false;
    if (form.value.important) {
      important = form.value.important;
    }

    const task: Task = {
      id: null,
      title: form.value.title,
      finishByDate: new Date(form.value.finishDate).toLocaleDateString(),
      finishByTime: time,
      list: this.selectedList,
      important,
      completed: false
    };
    const statuschangeMessage = `${this.authenticatedUser.name} has created a new task - ${task.title}`;
    this.taskCreationProgress = true;
    this.taskService.createTask(task).subscribe(response => {
      this.taskCreationProgress = false;
      this.socketService.taskStatusChange(statuschangeMessage);
      this.getTasksBasedOnQueryParams(this.route.snapshot.queryParams);
      this.selectedList = '';
      this.selectedHour = '06';
      this.selectedMinute = '00';
      this.creatingTask = false;
    }, error => {
      this.taskCreationProgress = false;
      console.log(error);
    });
  }

  deleteTask(task: Task) {
    const statuschangeMessage = `${this.authenticatedUser.name} has removed the task - ${task.title}`;
    this.taskService.deleteTask(task.id).subscribe(response => {
      this.socketService.taskStatusChange(statuschangeMessage);
      this.getTasksBasedOnQueryParams(this.route.snapshot.queryParams);
    }, error => {
      console.log(error);
    });
  }

  getTasksBasedOnDay(day: string) {
    if (day === 'today') {
      this.taskService.getTasksForToday(this.currentPage);
    } else {
      this.taskService.getAllTasks(this.currentPage);
    }
  }

  getAllLists() {
    const customLIsts = [];
    this.listService.getAllLists().subscribe(response => {
      response.lists.forEach((list: { name: string; }) => {
        customLIsts.push(list.name);
      });
      this.allLists = this.predefinedLists.concat(customLIsts);
    }, error => {
      console.log(error);
    });
  }

  getTasksBasedOnQueryParams(params: Params) {

    if (params.day) {
      this.selectedList = '';
      this.taskAreaHeader = params.day;
      this.getTasksBasedOnDay(params.day);
    }
    if (params.important) {
      this.selectedList = '';
      this.taskAreaHeader = 'Important';
      this.taskService.getAllImportantTasks(this.currentPage);
    }
    if (params.list) {
      this.selectedList = params.list;
      this.taskAreaHeader = params.list;
      this.taskService.getAllTasksForList(params.list, this.currentPage);
    }
  }

  statusChange(e: any, task: Task) {
    let statuschangeMessage: string;
    if (e) {
      statuschangeMessage = `${this.authenticatedUser.name} has completed the task - ${task.title}`;
    } else {
      statuschangeMessage = `${this.authenticatedUser.name} has re-opened the task - ${task.title} `;
    }
    this.taskService.updateTaskStatus(e, task.id).subscribe(response => {
      this.socketService.taskStatusChange(statuschangeMessage);
    }, error => {
      console.log(error);
    });
  }

  ngOnDestroy() {
    this.taskSub.unsubscribe();
    this.listSub.unsubscribe();
  }
}
