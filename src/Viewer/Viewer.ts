import {AnimationMixer, Clock, EventDispatcher, PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import init from './init';
import loadAsset from './loadAsset';
import playAllAnimations from './playAllAnimations';
import loadDefaultEnvironment from './textures/loadDefaultEnvironment';



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

  public async init(elementId: string) {
    if (!elementId) {
      throw new Error('init: element id required');
    }

    const {renderer, scene, camera, controls} = await init(elementId);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
  }

  public async loadAsset(url: string) {
    await loadAsset(this.renderer, this.scene, url);
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

  public async loadDefaultEnvironment() {
    loadDefaultEnvironment(this.scene, this.renderer);
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
