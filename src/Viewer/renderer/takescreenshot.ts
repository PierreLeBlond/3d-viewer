import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';

const saveBlob = (blob: Blob, filename: string) => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
};

export default function takeScreenshot(renderer: WebGLRenderer) {
  const blob = renderer.domElement.toBlob((blob: Blob) => {
    saveBlob(blob, 'screenshot');
  });
}
