import { MathUtils, Matrix4, PerspectiveCamera, Vector3 } from "three";

export default class OffsetCamera extends PerspectiveCamera {
  public xOffset: number = 0;
  public yOffset: number = 0;

  override updateProjectionMatrix() {
    const near = this.near;
    let top = (near * Math.tan(MathUtils.DEG2RAD * 0.5 * this.fov)) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = -0.5 * width;

    if (this.view !== null && this.view.enabled) {
      const view = this.view;
      const fullWidth = view.fullWidth,
        fullHeight = view.fullHeight;

      left += (view.offsetX * width) / fullWidth;
      top -= (view.offsetY * height) / fullHeight;
      width *= view.width / fullWidth;
      height *= view.height / fullHeight;
    }

    const skew = this.filmOffset;
    if (skew !== 0) left += (near * skew) / this.getFilmWidth();

    this.projectionMatrix.makePerspective(
      left,
      left + width,
      top,
      top - height,
      near,
      this.far,
      this.coordinateSystem
    );

    const offsetMatrix = new Matrix4().makeTranslation(
      new Vector3(this.xOffset, this.yOffset, 0)
    );

    this.projectionMatrix.premultiply(offsetMatrix);

    this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
}
