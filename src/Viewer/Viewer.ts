import { AnimationMixer, Clock, EventDispatcher, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import addSkybox from './addSkybox';
import init from './init';
import loadAsset from './loadAsset';
import createMaterial from './materials/Material/createMaterial';
import type Material from './materials/Material/Material';
import playAllAnimations from './playAllAnimations';
import takeScreenshot from './renderer/takescreenshot';
import buildBrdf from './textures/buildBrdf';
import type IblSpace from './textures/IblSpace';
import loadIbl from './textures/loadIbl';
import setIblSpace from './textures/setIblSpace';
import setIblToScene from './textures/setIblToScene';

export default class Viewer extends EventDispatcher {
  public scene: Scene;
  public camera: PerspectiveCamera;
  public renderer: WebGLRenderer;
  public controls: OrbitControls;
  public element: HTMLElement;

  public context = THREE;
  private scenes: Scene[] = [];
  private clock: Clock;

  private animationMixers: AnimationMixer[] = [];

  public constructor(elementId: string) {
    super();
    this.clock = new Clock();

    if (!elementId) {
      throw new Error('init: element id required');
    }

    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error('init: element not found');
    }

    this.element = element;

    const { renderer, scene, camera, controls } = init(this.element);

    this.renderer = renderer;
    this.scene = scene;
    this.scenes.push(this.scene);
    this.camera = camera;
    this.controls = controls;

    this.buildBrdf();
  }

  public async loadAsset(url: string) {
    await loadAsset(this.renderer, this.scene, url);
  }

  public async loadIbl(irradiancePath: string, radiancePath: string): Promise<void> {
    const ibl = await loadIbl(irradiancePath, radiancePath);
    setIblToScene(ibl, this.scene);
  }

  public setIblSpace(space: IblSpace) {
    setIblSpace(this.scene, space);
  }

  public buildBrdf() {
    this.scene.userData['brdf'] = buildBrdf(this.renderer, this.camera);
  }

  public addSkybox() {
    addSkybox(this.scene);
  }

  public createMaterial(): Material {
    return createMaterial(this.scene);
  }

  public getScene(name: string): Scene | null {
    const scene = this.scenes.find((scene: Scene) => scene.name == name);
    if (!scene) {
      return null;
    }
    return scene;
  }

  public createScene(name: string): Scene {
    const scene = new Scene();
    scene.name = name;

    scene.userData['brdf'] = this.scene.userData['brdf'];
    scene.userData['ibl'] = this.scene.userData['ibl'];
    scene.userData['iblSpace'] = this.scene.userData['iblSpace'];

    this.scenes.push(scene);

    return scene;
  }

  public addScene(scene: Scene) {
    this.scenes.push(scene);
  }

  public setScene(scene: Scene) {
    this.scene = scene;
  }

  public launch() {

    if (!this.scene.userData['ibl']) {
      throw new Error('Ibl must be load before launching the viewer');
    }

    this.addEventListener('updated', () => {
      requestAnimationFrame(() => this.update());
    });

    window
      .addEventListener('resize', () => this.resize(), false)

    this.resize();
    this.update();
  }

  public playAllAnimations() {
    this.animationMixers = playAllAnimations(this.scene);
  }

  public getAllAnimations(): AnimationMixer[] {
    return this.animationMixers;
  }

  public takeScreenshot() {
    takeScreenshot(this.renderer);
  }

  private resize() {
    const { parentElement } = this.renderer.domElement;
    if (!parentElement) {
      throw new Error('dom element has no parent');
    }
    const { clientWidth, clientHeight } = parentElement;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
    this.render();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private update() {
    // 1. Update controls
    this.controls.update();

    // 2. Update animations
    const delta = this.clock.getDelta();
    this.scene.dispatchEvent({ type: 'animate', delta });

    // 3. Update preprocesses
    this.dispatchEvent({
      type: 'updatePreprocesses',
      camera: this.camera,
      renderer: this.renderer
    });

    // 4. Update screen
    this.render();

    this.dispatchEvent({ type: 'updated' });
  }
}
