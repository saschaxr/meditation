import { EntityScriptComponent } from "./EntityScript";
import { AbstractMesh, ActionManager, ExecuteCodeAction } from "@babylonjs/core";

export class TriggerScript  extends EntityScriptComponent {

    public onStart(): void {
        if (!this.gameObject) return;

        // Iterate meshes of this game object
        for (const comp of this.gameObject.components.values()) {
            // check if component has a mesh
            if ((comp as any).mesh) {
                const mesh = (comp as any).mesh as AbstractMesh;

                // create action manager if it doesn't exist
                if (!mesh.actionManager) {
                    mesh.actionManager = new ActionManager(mesh.getScene());
                }

                // register click action
                mesh.actionManager.registerAction(
                    new ExecuteCodeAction(
                        ActionManager.OnPickTrigger,
                        () => {
                            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!You pressed trigger on mesh:", mesh.name);
                        }
                    )
                );
            }
        }
    }
}
