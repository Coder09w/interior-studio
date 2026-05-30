import "three";

declare module "three" {
  interface MeshStandardMaterial {
    /** Custom runtime property: stores original opacity for ceiling edit mode */
    _origOpacity?: number;
    /** Custom runtime property: stores original transparent flag for ceiling edit mode */
    _origTransparent?: boolean;
    /** Custom runtime property: stores original emissive hex for ceiling edit mode */
    _origEmissiveCeil?: number;
    /** Custom runtime property: stores original emissive hex for selection highlight */
    _origEmissive?: number;
  }
}
