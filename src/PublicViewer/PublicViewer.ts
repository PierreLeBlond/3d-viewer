import launchTasks from "./launchTasks";
import type { Tasks } from "./Tasks";
import IblSpace from "../Viewer/textures/IblSpace";
import Viewer from "../Viewer/Viewer";
import type { DisolveObjectOptions } from "../Viewer/objects/disolve/disolveObject";

export default class PublicViewer {
  private tasks: Tasks = { parallelTasks: [] };
  public viewer: Viewer;

  constructor(elementId: string) {
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

  public async loadIbl(
    irradiancePath: string,
    radiancePath: string
  ): Promise<void> {
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

  public pause() {
    this.viewer.pause();
  }

  public play() {
    this.viewer.play();
  }

  public async disolveObjectByName(
    name: string,
    options: DisolveObjectOptions
  ) {
    await this.viewer.disolveObjectByName(name, options);
  }

  public async resolveObjectByName(
    name: string,
    options: DisolveObjectOptions
  ) {
    await this.viewer.resolveObjectByName(name, options);
  }

  public dispose() {
    this.viewer.dispose();
  }

  public getEventDispatcher() {
    return this.viewer.getEventDispatcher();
  }
}
