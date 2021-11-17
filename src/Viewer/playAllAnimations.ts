import { AnimationMixer } from "three/src/animation/AnimationMixer";
import { Object3D } from "three/src/core/Object3D";
import { Scene } from "three/src/scenes/Scene";

export default function playAllAnimations(scene: Scene): AnimationMixer[] {
  const animationMixers: AnimationMixer[] = [];
  scene.traverse((object: Object3D) => {
    if (object.animations.length != 0) {
      const mixer = new AnimationMixer(object);
      object.animations.forEach(clip => {
        const action = mixer.clipAction(clip);
        action.play();
      });
      scene.addEventListener("animate", (event) => {
        mixer.update(event.delta);
      });
      animationMixers.push(mixer);
    }
  });
  return animationMixers;
}
