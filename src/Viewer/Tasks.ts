export type Task = () => Promise<void>;

export interface Tasks {
  parallelTasks?: Tasks[];
  sequentialTasks?: Tasks[];
  task?: Task;
}

