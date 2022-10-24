import { AnimationMixer, EventDispatcher } from 'three';
import launchTasks from '../Viewer/launchTasks';
import { Tasks } from '../Viewer/Tasks';
import IblSpace from '../Viewer/textures/IblSpace';
import Viewer from '../Viewer/Viewer';

export default class PublicViewer extends EventDispatcher {
  private tasks: Tasks = { parallelTasks: [] };
  public viewer: Viewer = new Viewer();

  public addTasks(tasks: Tasks) {
    this.tasks.parallelTasks.push(tasks);
  }

  public async launch(elementId: string) {
    this.viewer.init(elementId);

    await launchTasks(this, this.tasks);

    this.viewer.launch();
  }

  public async loadAsset(url: string) {
    await this.viewer.loadAsset(url);
  }

  public async loadIbl(path: string, name: string): Promise<void> {
    await this.viewer.loadIbl(path, name);
  }

  public setIblInViewSpace() {
    this.viewer.setIblSpace(IblSpace.View);
  }

  public setIblInWorldSpace() {
    this.viewer.setIblSpace(IblSpace.World);
  }

  public addSkybox() {
    this.viewer.addSkybox();
  }

  public playAllAnimations() {
    this.viewer.playAllAnimations();
  }

  public getAllAnimations(): AnimationMixer[] {
    return this.viewer.getAllAnimations();
  }

  public takeScreenshot() {
    this.viewer.takeScreenshot();
  }
}
