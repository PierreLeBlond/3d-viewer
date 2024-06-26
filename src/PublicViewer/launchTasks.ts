import { EventDispatcher } from "three";
import type PublicViewer from "./PublicViewer";
import type { Task, Tasks } from "./Tasks";

type TaskEvent = {
  taskCompleted: {};
};

const getMonitoredTask = (
  eventDispatcher: EventDispatcher<TaskEvent>,
  task: Task
) => {
  return async () => {
    await task();
    eventDispatcher.dispatchEvent({ type: "taskCompleted" });
  };
};

const getMonitoredTasks = (
  eventDispatcher: EventDispatcher<TaskEvent>,
  tasks: Tasks
): { monitoredTask: () => Promise<void>; numberOfTasks: number } => {
  if (tasks.task) {
    return {
      monitoredTask: getMonitoredTask(eventDispatcher, tasks.task),
      numberOfTasks: 1,
    };
  } else {
    const monitoredSequentialTasks = tasks.sequentialTasks
      ? tasks.sequentialTasks.map((subTask) =>
          getMonitoredTasks(eventDispatcher, subTask)
        )
      : [];
    const monitoredSequentialTask = async () => {
      for (const subTask of monitoredSequentialTasks) {
        await getMonitoredTask(eventDispatcher, subTask.monitoredTask)();
      }
    };
    const numberOfSequentialTasks = monitoredSequentialTasks.reduce(
      (accu: number, task) => accu + task.numberOfTasks,
      0
    );

    const monitoredParallelTasks = tasks.parallelTasks
      ? tasks.parallelTasks.map((subTask) =>
          getMonitoredTasks(eventDispatcher, subTask)
        )
      : [];
    const monitoredParallelTask = async () => {
      await Promise.all(
        monitoredParallelTasks.map((monitoredParallelTask) =>
          monitoredParallelTask.monitoredTask()
        )
      );
    };
    const numberOfParallelTasks = monitoredParallelTasks.reduce(
      (accu: number, task) => accu + task.numberOfTasks,
      0
    );

    const monitoredTask = async () => {
      await Promise.all([monitoredParallelTask(), monitoredSequentialTask()]);
    };

    return {
      monitoredTask,
      numberOfTasks: numberOfSequentialTasks + numberOfParallelTasks,
    };
  }
};

export default async function launchTasks(
  publicViewer: PublicViewer,
  tasks: Tasks
) {
  const eventDispatcher = new EventDispatcher<TaskEvent>();
  const monitoredTask = getMonitoredTasks(eventDispatcher, tasks);
  let numberOfCompletedTasks = 0;
  eventDispatcher.addEventListener("taskCompleted", () => {
    numberOfCompletedTasks++;
    publicViewer.getEventDispatcher().dispatchEvent({
      type: "taskCompleted",
      progression: numberOfCompletedTasks / monitoredTask.numberOfTasks,
    });
  });
  publicViewer.getEventDispatcher().dispatchEvent({
    type: "taskCompleted",
    progression: 0,
  });
  await monitoredTask.monitoredTask();
}
