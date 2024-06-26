import {
  Clock,
  EventDispatcher,
  Material,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Texture,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import init from "./init";
import takeScreenshot from "./renderer/takescreenshot";
import buildBrdf from "./textures/buildBrdf";
import IblSpace from "./textures/IblSpace";
import loadIbl from "./textures/loadIbl";
import type Ibl from "./textures/Ibl";
import Scene from "./Scene/Scene";
import {
  disolveObject,
  type DisolveObjectOptions,
} from "./objects/disolve/disolveObject";
import { resolveObject } from "./objects/disolve/resolveObject";

export type ViewerEvent = {
  taskCompleted: { progression: number };
  updated: {};
  updatePreprocesses: {
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
  };
};

export default class Viewer {
  public element: HTMLElement;

  public renderer: WebGLRenderer;

  public scene: Scene;
  private scenes: Scene[] = [];

  public camera: PerspectiveCamera;
  public controls: OrbitControls;
  public fov: number = 75;

  public context = THREE;
  private clock: Clock;

  private animationFrameHandle = -1;
  private updateEvent: () => void;
  private resizeEvent: () => void = () => {};

  private brdfRenderTarget: WebGLRenderTarget;
  private ibl: Ibl | null = null;
  private iblSpace: IblSpace = IblSpace.World;

  private eventDispatcher = new EventDispatcher<ViewerEvent>();

  public constructor(elementId: string) {
    this.clock = new Clock();

    if (!elementId) {
      throw new Error("init: element id required");
    }

    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error("init: element not found");
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

    this.scene = this.createScene("default");
  }

  public async loadIbl(
    irradiancePath: string,
    radiancePath: string
  ): Promise<void> {
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

    scene.userData["brdf"] = this.brdfRenderTarget.texture;
    scene.userData["ibl"] = this.ibl;
    scene.userData["iblSpace"] = this.iblSpace;

    scene.userData["materials"] = new Set();
    scene.userData["textures"] = new Set();

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
      throw new Error("dom element has no parent");
    }
    const { clientWidth, clientHeight } = parentElement;
    this.camera.aspect = clientWidth / clientHeight;
    const isHorizontal = this.camera.aspect <= 1;
    this.camera.fov = isHorizontal
      ? (Math.atan(Math.tan((this.fov * Math.PI) / 360) / this.camera.aspect) *
          360) /
        Math.PI
      : this.fov;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
    this.update();
  }

  private render(scene: Scene) {
    // 1. Update preprocesses
    this.eventDispatcher.dispatchEvent({
      type: "updatePreprocesses",
      camera: this.camera,
      renderer: this.renderer,
    });

    // 2. Update screen
    this.renderer.render(scene, this.camera);
  }

  private update() {
    // 1. Update controls
    this.controls.update();

    this.eventDispatcher.dispatchEvent({ type: "updated" });

    // 3. Update animations
    const delta = this.clock.getDelta();
    this.scene.getEventDispatcher().dispatchEvent({ type: "animate", delta });

    // 4. Render the scene
    this.render(this.scene);
  }

  // Enable looping behaviour but does not actually call the render loop
  private activateRenderLoop() {
    this.eventDispatcher.addEventListener("updated", this.updateEvent);
    this.clock.getDelta();
  }

  public launch() {
    this.activateRenderLoop();

    window.addEventListener("resize", this.resizeEvent, false);
    // Resize will trigger update
    this.resize();
  }

  public pause() {
    this.eventDispatcher.removeEventListener("updated", this.updateEvent);
    cancelAnimationFrame(this.animationFrameHandle);
  }

  public play() {
    this.activateRenderLoop();
    this.update();
  }

  public async disolveObject(object: Object3D, options: DisolveObjectOptions) {
    await disolveObject(this, object, options);
  }

  public async disolveObjectByName(
    name: string,
    options: DisolveObjectOptions
  ) {
    if (!this.scene) {
      throw new Error("No active scene in viewer");
    }
    const object = this.scene.getObjectByName(name);
    if (!object) {
      throw new Error(`Object with name ${name} does not exists`);
    }
    await this.disolveObject(object, options);
  }

  public async resolveObject(object: Object3D, options: DisolveObjectOptions) {
    await resolveObject(this, object, options);
  }

  public async resolveObjectByName(
    name: string,
    options: DisolveObjectOptions
  ) {
    if (!this.scene) {
      throw new Error("No active scene in viewer");
    }
    const object = this.scene.getObjectByName(name);
    if (!object) {
      throw new Error(`Object with name ${name} does not exists`);
    }
    await this.resolveObject(object, options);
  }

  public dispose() {
    this.pause();
    window.removeEventListener("resize", this.resizeEvent, false);

    this.brdfRenderTarget.dispose();
    if (this.ibl) {
      this.ibl.radiance.dispose();
      this.ibl.irradiance.dispose();
    }

    this.scenes.forEach((scene: Scene) => {
      scene.traverse((object: Object3D) => {
        if (object.type == "Mesh") {
          const mesh: Mesh = object as Mesh;
          mesh.geometry.dispose();
        }
      });
      scene.userData["materials"].forEach((material: Material) => {
        material.dispose();
      });
      scene.userData["textures"].forEach((texture: Texture) => {
        texture.dispose();
      });
    });

    this.controls.dispose();

    this.element.removeChild(this.renderer.domElement);
    this.renderer.dispose();
  }

  public getEventDispatcher() {
    return this.eventDispatcher;
  }
}
