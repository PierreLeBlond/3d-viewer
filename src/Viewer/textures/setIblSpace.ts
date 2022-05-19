import {Scene} from 'three/src/scenes/Scene';
import IblSpace from './IblSpace';

export default function setIblSpace(scene: Scene, iblSpace: IblSpace) {
  scene.userData.iblSpace = iblSpace;
}
