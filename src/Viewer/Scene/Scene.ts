import {
  AnimationMixer,
  EventDispatcher,
  Scene as ThreeScene,
  WebGLRenderer,
} from "three";
import createMaterial from "../materials/Material/createMaterial";
import type Material from "../materials/Material/Material";
import addSkybox from "./addSkybox";
import loadAsset from "./loadAsset";
import playAllAnimations from "./playAllAnimations";

type SceneEvent = {
  animate: {
    delta: number;
  };
};

export default class Scene extends ThreeScene {
  private renderer: WebGLRenderer;

  private animationMixers: AnimationMixer[] = [];

  private eventDispatcher = new EventDispatcher<SceneEvent>();

  constructor(renderer: WebGLRenderer) {
    super();

    this.renderer = renderer;
  }

  public async loadAsset(url: string, optionalResourcePath?: string) {
    await loadAsset(this.renderer, this, url, optionalResourcePath);
  }

  public addSkybox() {
    addSkybox(this);
  }

  public createMaterial(): Material {
    return createMaterial(this);
  }

  public playAllAnimations() {
    this.animationMixers = playAllAnimations(this);
  }

  public getAllAnimations(): AnimationMixer[] {
    return this.animationMixers;
  }

  public getEventDispatcher() {
    return this.eventDispatcher;
  }
}
