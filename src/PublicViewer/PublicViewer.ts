import {AnimationMixer, EventDispatcher} from 'three';
import launchTasks from '../Viewer/launchTasks';
import {Tasks} from '../Viewer/Tasks';
import Viewer from '../Viewer/Viewer';

export default class PublicViewer extends EventDispatcher {
  private tasks: Tasks = {parallelTasks: []};
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

  public async loadDefaultEnvironment() {
    await this.viewer.loadDefaultEnvironment();
  }

  public playAllAnimations() {
    this.viewer.playAllAnimations();
  }

  public getAllAnimations(): AnimationMixer[] {
    return this.viewer.getAllAnimations();
  }
}
