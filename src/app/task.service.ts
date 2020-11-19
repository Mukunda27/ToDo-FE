
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Task } from './task.model';
import { map } from 'rxjs/operators';

import { environment } from '../environments/environment';

const BACKEND_URL = environment.apiUrl + 'task/';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private tasksFetched = new Subject<{ tasks: Task[], totalTasks: number }>();
  tasksPerPage = 9;
  constructor(
    private httpClient: HttpClient) { }

  getTasksUpdateListener() {
    return this.tasksFetched.asObservable();
  }

  createTask(task: Task) {
    const httpBody = {
      title: task.title, finishByDate: task.finishByDate, finishByTime: task.finishByTime,
      list: task.list, important: task.important
    };

    return this.httpClient.post<{ message: string, task: any }>(BACKEND_URL + 'create', httpBody);
  }

  getAllTasks(currentPage: number) {
    const queryParams = `?pagesize=${this.tasksPerPage}&page=${currentPage}`;
    return this.httpClient.get<{ tasks: any, totalTasks: number }>(BACKEND_URL + 'all' + queryParams).pipe(
      map(taskData => {
        return {
          tasks: taskData.tasks.map(task => {
            const transformedTask: Task = {
              id: task._id,
              title: task.title,
              finishByDate: task.finishByDate,
              finishByTime: task.finishByTime,
              list: task.list,
              important: task.important,
              completed: task.completed,
              creator: task.creator.name
            };
            return transformedTask;
          }),
          totalTasks: taskData.totalTasks
        };
      })
    ).subscribe(transformedTaskData => {
      console.log(transformedTaskData);
      this.tasks = transformedTaskData.tasks;
      this.tasksFetched.next({
        tasks: [...this.tasks],
        totalTasks: transformedTaskData.totalTasks
      });
    });
  }

  getAllImportantTasks(currentPage: number) {
    const queryParams = `?pagesize=${this.tasksPerPage}&page=${currentPage}`;
    return this.httpClient.get<{ tasks: any, totalTasks: number }>(BACKEND_URL + 'important' + queryParams).pipe(
      map(taskData => {
        return {
          tasks: taskData.tasks.map(task => {
            const transformedTask: Task = {
              id: task._id,
              title: task.title,
              finishByDate: task.finishByDate,
              finishByTime: task.finishByTime,
              list: task.list,
              important: task.important,
              completed: task.completed,
              creator: task.creator.name
            };

            return transformedTask;
          }),
          totalTasks: taskData.totalTasks
        };
      })
    ).subscribe(transformedTaskData => {
      this.tasks = transformedTaskData.tasks;
      this.tasksFetched.next({
        tasks: [...this.tasks],
        totalTasks: transformedTaskData.totalTasks
      });
    });
  }

  getAllTasksForList(list: string, currentPage: number) {
    const queryParams = `?list=${list}&pagesize=${this.tasksPerPage}&page=${currentPage}`;

    return this.httpClient.get<{ tasks: any, totalTasks: number }>(BACKEND_URL + 'list' + queryParams).pipe(
      map(taskData => {
        return {
          tasks: taskData.tasks.map(task => {
            const transformedTask: Task = {
              id: task._id,
              title: task.title,
              finishByDate: task.finishByDate,
              finishByTime: task.finishByTime,
              list: task.list,
              important: task.important,
              completed: task.completed,
              creator: task.creator.name
            };

            return transformedTask;
          }),
          totalTasks: taskData.totalTasks
        };
      })
    ).subscribe(transformedTaskData => {
      this.tasks = transformedTaskData.tasks;
      this.tasksFetched.next({
        tasks: [...this.tasks],
        totalTasks: transformedTaskData.totalTasks
      });
    });
  }

  getTasksForToday(currentPage: number) {
    const isoDate = new Date().toLocaleDateString();
    const queryParams = `?date=${isoDate}&pagesize=${this.tasksPerPage}&page=${currentPage}`;

    return this.httpClient.get<{ tasks: any, totalTasks: number }>(BACKEND_URL + 'day' + queryParams).pipe(
      map(taskData => {
        return {
          tasks: taskData.tasks.map(task => {
            const transformedTask: Task = {
              id: task._id,
              title: task.title,
              finishByDate: task.finishByDate,
              finishByTime: task.finishByTime,
              list: task.list,
              important: task.important,
              completed: task.completed,
              creator: task.creator.name
            };

            return transformedTask;
          }),
          totalTasks: taskData.totalTasks
        };
      })
    ).subscribe(transformedTaskData => {
      this.tasks = transformedTaskData.tasks;
      this.tasksFetched.next({
        tasks: [...this.tasks],
        totalTasks: transformedTaskData.totalTasks
      });
    });
  }

  updateTaskStatus(completed: boolean, taskID: string) {
    const httpBody = { completed };
    return this.httpClient.put(BACKEND_URL + taskID, httpBody);
  }

  deleteTask(taskID: string) {
    return this.httpClient.delete(BACKEND_URL + taskID);
  }
}
