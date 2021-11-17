import { AnimationMixer } from "three/src/animation/AnimationMixer";
import Viewer from "../Viewer/Viewer";

export default class PublicViewer {
  public viewer: Viewer;

  public async init(elementId: string) {
    if (this.viewer) {
      throw new Error("App is already initialized");
    }

    this.viewer = new Viewer();

    await this.viewer.init(elementId);
  }

  public async loadAsset(url: string) {
    if (!this.viewer) {
      throw new Error("App must be initialized first by calling app.init");
    }

    await this.viewer.loadAsset(url);
  }

  public launch() {
    if (!this.viewer) {
      throw new Error("App must be initialized first by calling app.init");
    }

    this.viewer.launch();
  }

  public playAllAnimations() {
    if (!this.viewer) {
      throw new Error("App must be initialized first by calling app.init");
    }

    this.viewer.playAllAnimations();
  }

  public getAllAnimations(): AnimationMixer[] {
    if (!this.viewer) {
      throw new Error("App must be initialized first by calling app.init");
    }

    return this.viewer.getAllAnimations();
  }
}
