import { Clock, EventDispatcher, Material, Mesh, Object3D, PerspectiveCamera, Texture, WebGLRenderer, WebGLRenderTarget } from 'three';
import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import init from './init';
import takeScreenshot from './renderer/takescreenshot';
import buildBrdf from './textures/buildBrdf';
import IblSpace from './textures/IblSpace';
import loadIbl from './textures/loadIbl';
import type Ibl from './textures/Ibl';
import Scene from './Scene/Scene';

export default class Viewer extends EventDispatcher {
  public element: HTMLElement;

  public renderer: WebGLRenderer;

  public scene: Scene | null = null;
  private scenes: Scene[] = [];

  public camera: PerspectiveCamera;
  public controls: OrbitControls;

  public context = THREE;
  private clock: Clock;

  private updateEvent: () => void;
  private resizeEvent: () => void = () => { };

  private brdfRenderTarget: WebGLRenderTarget;
  private ibl: Ibl | null = null;
  private iblSpace: IblSpace = IblSpace.World;

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

    const { renderer, camera, controls } = init(this.element);

    this.renderer = renderer;
    this.camera = camera;
    this.controls = controls;

    this.updateEvent = () => {
      requestAnimationFrame(() => this.update());
    };
    this.resizeEvent = () => this.resize();

    this.brdfRenderTarget = buildBrdf(this.renderer, this.camera);
  }

  public async loadIbl(irradiancePath: string, radiancePath: string): Promise<void> {
    this.ibl = await loadIbl(irradiancePath, radiancePath);
  }

  public setIblSpace(space: IblSpace) {
    this.iblSpace = space;
  }

  public getScene(name: string): Scene | null {
    const scene = this.scenes.find((scene: Scene) => scene.name == name);
    if (!scene) {
      return null;
    }
    return scene;
  }

  public createScene(name: string): Scene {
    const scene = new Scene(this.renderer);
    scene.name = name;

    scene.userData['brdf'] = this.brdfRenderTarget.texture;
    scene.userData['ibl'] = this.ibl;
    scene.userData['iblSpace'] = this.iblSpace;

    scene.userData['materials'] = new Set();
    scene.userData['textures'] = new Set();

    this.scenes.push(scene);

    return scene;
  }

  public addScene(scene: Scene) {
    this.scenes.push(scene);
  }

  public setScene(scene: Scene) {
    this.scene = scene;
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
    this.update();
  }

  private render(scene: Scene) {
    // 2. Update animations
    const delta = this.clock.getDelta();
    scene.dispatchEvent({ type: 'animate', delta });

    // 3. Update preprocesses
    this.dispatchEvent({
      type: 'updatePreprocesses',
      camera: this.camera,
      renderer: this.renderer
    });

    // 4. Update screen
    this.renderer.render(scene, this.camera);
  }

  private update() {
    // 1. Update controls
    this.controls.update();

    const scene = this.scene;

    if (scene) {
      this.render(scene);
    }

    this.dispatchEvent({ type: 'updated' });
  }

  public launch() {
    if (!this.ibl) {
      throw new Error('Ibl must be loaded before launching the viewer');
    }

    this.addEventListener('updated', this.updateEvent);

    window.addEventListener('resize', this.resizeEvent, false)

    this.resize();
    this.update();
  }

  public dispose() {
    this.removeEventListener('updated', this.updateEvent);
    window.removeEventListener('resize', this.resizeEvent, false);

    this.brdfRenderTarget.dispose();
    if (this.ibl) {
      this.ibl.radiance.dispose();
      this.ibl.irradiance.dispose();
    }

    this.scenes.forEach((scene: Scene) => {
      scene.traverse((object: Object3D) => {
        if (object.type == 'Mesh') {
          const mesh: Mesh = object as Mesh;
          mesh.geometry.dispose();
        }
      })
      scene.userData['materials'].forEach((material: Material) => {
        material.dispose();
      })
      scene.userData['textures'].forEach((texture: Texture) => {
        texture.dispose();
      })
    });

    this.controls.dispose();

    this.element.removeChild(this.renderer.domElement);
    this.renderer.dispose();
  }
}
