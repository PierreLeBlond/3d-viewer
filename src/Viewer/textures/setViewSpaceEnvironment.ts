import {Scene} from 'three/src/scenes/Scene';

export default function setViewSpaceEnvironment(scene: Scene, value: boolean) {
  scene.userData.viewSpaceEnvironment = value;
  if (scene.environment) {
    scene.environment.userData.viewSpace = value;
  }
}
