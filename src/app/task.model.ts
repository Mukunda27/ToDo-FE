export interface Task {
  id: string;
  title: string;
  finishByDate: string;
  finishByTime: string;
  list: string;
  important: boolean;
  completed: boolean;
  creator: string;
}
