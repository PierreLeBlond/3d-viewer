import { EventDispatcher } from 'three';
import launchTasks from '../Viewer/launchTasks';
import type { Tasks } from '../Viewer/Tasks';
import IblSpace from '../Viewer/textures/IblSpace';
import Viewer from '../Viewer/Viewer';

export default class PublicViewer extends EventDispatcher {
  private tasks: Tasks = { parallelTasks: [] };
  public viewer: Viewer;

  constructor(elementId: string) {
    super();
    this.viewer = new Viewer(elementId);
  }

  public addTasks(tasks: Tasks) {
    if (!this.tasks.parallelTasks) {
      this.tasks.parallelTasks = [];
    }
    this.tasks.parallelTasks.push(tasks);
  }

  public async launch() {
    await this.launchTasks();
    this.viewer.launch();
  }

  public async launchTasks() {
    await launchTasks(this, this.tasks);
    this.tasks = { parallelTasks: [] };
  }

  public async loadIbl(irradiancePath: string, radiancePath: string): Promise<void> {
    await this.viewer.loadIbl(irradiancePath, radiancePath);
  }

  public setIblInViewSpace() {
    this.viewer.setIblSpace(IblSpace.View);
  }

  public setIblInWorldSpace() {
    this.viewer.setIblSpace(IblSpace.World);
  }

  public takeScreenshot() {
    this.viewer.takeScreenshot();
  }

  public dispose() {
    this.viewer.dispose();
  }
}
