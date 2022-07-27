import {AnimationMixer, Clock, EventDispatcher, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import addSkybox from './addSkybox';
import init from './init';
import loadAsset from './loadAsset';
import createMaterial from './materials/Material/createMaterial';
import Material from './materials/Material/Material';
import playAllAnimations from './playAllAnimations';
import buildBrdf from './textures/buildBrdf';
import IblSpace from './textures/IblSpace';
import loadIbl from './textures/loadIbl';
import setIblSpace from './textures/setIblSpace';

export default class Viewer extends EventDispatcher {
  public scene: Scene;
  public camera: PerspectiveCamera;
  public renderer: WebGLRenderer;
  public controls: OrbitControls;

  private clock: Clock;

  private animationMixers: AnimationMixer[];

  public constructor() {
    super();
    this.clock = new Clock();
  }

  public init(elementId: string) {
    if (!elementId) {
      throw new Error('init: element id required');
    }

    const {renderer, scene, camera, controls} = init(elementId);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;

    this.buildBrdf();
  }

  public async loadAsset(url: string) {
    await loadAsset(this.renderer, this.scene, url);
  }

  public async loadIbl(path: string, name: string): Promise<void> {
    this.scene.userData.ibl = await loadIbl(path, name);
  }

  public setIblSpace(space: IblSpace) {
    setIblSpace(this.scene, space);
  }

  public buildBrdf() {
    this.scene.userData.brdf = buildBrdf(this.renderer, this.camera);
  }

  public addSkybox() {
    addSkybox(this.scene);
  }

  public createMaterial(): Material {
    return createMaterial(this.scene);
  }

  public launch() {
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

  private resize() {
    const {clientWidth, clientHeight} = this.renderer.domElement.parentElement;
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
    this.scene.dispatchEvent({type: 'animate', delta});

    // 3. Update preprocesses
    this.dispatchEvent({
      type: 'updatePreprocesses',
      camera: this.camera,
      renderer: this.renderer
    });

    // 4. Update screen
    this.render();

    this.dispatchEvent({type: 'updated'});
  }
}
