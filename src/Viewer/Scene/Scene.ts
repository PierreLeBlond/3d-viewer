import { AnimationMixer, Scene as ThreeScene, WebGLRenderer } from 'three';
import createMaterial from '../materials/Material/createMaterial';
import type Material from '../materials/Material/Material';
import addSkybox from './addSkybox';
import loadAsset from './loadAsset';
import playAllAnimations from './playAllAnimations';

export default class Scene extends ThreeScene {

  private renderer: WebGLRenderer;

  private animationMixers: AnimationMixer[] = [];

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

}