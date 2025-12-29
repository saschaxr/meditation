<!--
//  MainScene.vue
//
//  Created by Kalila L. on May 9th, 2021.
//  Copyright 2021 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
-->

<style lang="scss" scoped>
.fpsCounter,
.versionWatermark {
    position: absolute;
    z-index: 101;
    right: 14px;
    display: block;
    font-size: 1rem;
    font-style: italic;
    opacity: 0.7;
    user-select: none;
    pointer-events: none;
}
.fpsCounter {
    bottom: calc(10px + 1rem);
}
.versionWatermark {
    bottom: 5px;
}
</style>

<template>
    <q-page class="full-height">
        <q-resize-observer @resize="resize" />
        <audio ref="mainSceneAudioElement"></audio>
        <canvas
            :height="canvasHeight"
            :width="canvasWidth"
            :style="{
                position: 'relative',
                zIndex: 2,
                width: canvasWidth + 'px',
                height: canvasHeight + 'px',
                outline: 'none',
            }"
            ref="renderCanvas"
            class="renderCanvas"
            tabindex="0"
        ></canvas>
        <slot name="manager"></slot>
        <LoadingScreen ref="LoadingScreen" />
        <JitsiContainer ref="JitsiContainer" />
        <div v-if="userStore.graphics.fpsCounter" class="fpsCounter">
            {{ applicationStore.renderer.fps.toFixed(0) }} FPS
        </div>
        <div class="versionWatermark">
            {{ applicationStore.theme.versionWatermark }}
        </div>
    </q-page>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { applicationStore, userStore } from "@Stores/index";
import { AudioManager } from "@Modules/scene/audio";
import { Renderer } from "@Modules/scene/renderer";
import { Utility } from "@Modules/utility";
import { Location } from "@Modules/domain/location";
import { AvatarStoreInterface } from "@Modules/avatar/StoreInterface";
import { URL_UPDATE_FREQUENCY } from "@Base/config";
import { DomainManager } from "@Modules/domain";
import LoadingScreen from "@Components/LoadingScreen.vue";
import JitsiContainer from "@Components/JitsiContainer.vue";
import { EntityEventType } from "@Base/modules/entity";
import * as BABYLON from "@babylonjs/core";

type ComponentTemplateRefs = {
    mainSceneAudioElement: HTMLAudioElement;
    renderCanvas: HTMLCanvasElement;
    JitsiContainer: typeof JitsiContainer;
    LoadingScreen: typeof LoadingScreen;
};

export interface ResizeShape {
    height: number;
    width: number;
}

export default defineComponent({
    name: "MainScene",

    props: {
        domainServerConnected: {
            type: String,
            required: true,
        },
        metaverseServerConnected: {
            type: String,
            required: true,
        },
    },

    components: {
        LoadingScreen,
        JitsiContainer,
    },

    emits: ["join-conference-room"],

    setup() {
        return {
            applicationStore,
            userStore,
        };
    },

    data() {
        return {
            sceneCreated: false,
            canvasHeight: 200,
            canvasWidth: 200,
            updateUrlReady: true,
            locationUnwatch: () => {
                /* This function will be populated once connected to a domain. */
            },
            previousLocation: undefined as Location | undefined,
            currentNpcMesh: null as BABYLON.AbstractMesh | null, 
            npcAnimationGroups: null as BABYLON.AnimationGroup[] | null,
        };
    },

    watch: {
        // call again the method if the route changes
        $route: "connect",
        // async domainServerConnected(newVal, oldVal) {
        //     if (newVal !== oldVal) {
        //         this.handleDomainServerConnectedChange(newVal);
        //     }
        // }
    },

    methods: {
        // handleDomainServerConnectedChange(state: string) {
        // },
        async boot(): Promise<void> {
            console.log("DEBUG: boot() Methode gestartet.");
            // Initialize the graphics display.
            const canvas = (this.$refs as ComponentTemplateRefs).renderCanvas;
            const loadingScreenComponent = (this.$refs as ComponentTemplateRefs)
                .LoadingScreen;
            const loadingScreenElement =
                loadingScreenComponent.$el as HTMLElement;
            await Renderer.initialize(canvas, loadingScreenElement);
            this.applicationStore.renderer.focusSceneId = 0;

            DomainManager.startGameLoop();

            // Initialize the audio for the scene.
            await AudioManager.initialize((stream) => {
                const element = (this.$refs as ComponentTemplateRefs)
                    .mainSceneAudioElement;
                if (stream) {
                    element.srcObject = stream;
                    void element.play();
                } else {
                    element.pause();
                    element.srcObject = null;
                }
            });

            const scene = Renderer.createScene();      
            try {
                const assetUrl = "https://ams3.digitaloceanspaces.com/doob-highfidelity/MeditationSpaceLarger/NPC/Priscilla_Talking01.glb";
                // Importiere das Mesh und die Animation asynchron
                const importResult = await BABYLON.SceneLoader.ImportMeshAsync(
                    "", // Importiere alle Meshes
                    "", // Root URL (da die URL komplett ist, leer lassen)
                    assetUrl,
                    scene._scene // Nutze die interne Babylon Scene des Vircadia Renderers
                );
                if (importResult.meshes.length > 0) {
                    // Das erste Mesh (Mesh[0]) ist oft der Root-Knoten oder der Container.
                    const rootMesh = importResult.meshes[0]; 
                    this.currentNpcMesh = rootMesh;
                    // Setze das Modell in einen gut sichtbaren Bereich: 
                    // X=0 (Mitte), Y=0 (Boden/Ursprung), Z=5 (5 Meter vor der Standardkamera)
                    //rootMesh.position = new BABYLON.Vector3(33.9, 9.4, 187);
                    rootMesh.position = new BABYLON.Vector3(0, 0, 0);
                    rootMesh.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
                    importResult.meshes.forEach(mesh => {
                        if (mesh.material) {
                            let pbrMaterial = mesh.material as BABYLON.PBRMaterial; 
                            pbrMaterial.ambientTextureStrength = 0.5; // Reduziert die Stärke des Umgebungslichts (Standard: 1.0)
                            pbrMaterial.reflectionTexture.level = 0.5; // Reduziert die Intensität der Reflexionen
                            pbrMaterial.environmentTexture = scene._scene.environmentTexture;
                            pbrMaterial.roughness = 0.9;
                            pbrMaterial.metallic = 0.0;
                            pbrMaterial.lightmapTexture = null; 
                        }
                    });
                    // Optional: Skalierung anpassen, falls der Avatar zu klein ist (z.B. auf 1 Meter hoch)
                    // rootMesh.scaling = new BABYLON.Vector3(1, 1, 1); 
                    console.log("DEBUG: NPC Modell auf Position (0, 0, 5) verschoben.");
               }
                this.npcAnimationGroups = importResult.animationGroups;
                console.log("NPC erfolgreich geladen. Gefundene AnimationGroups:", importResult.animationGroups.map((a) => a.name));
                // Finde und starte die 'talking' Animation (oder die erste gefundene)
                const talkingAnim = importResult.animationGroups.find((a) => a.name.toLowerCase().includes("talk"));
                if (talkingAnim) {
                    talkingAnim.play(true); // true = loop
                    console.log("NPC 'Talking' Animation gestartet.");
                } else if (importResult.animationGroups.length > 0) {
                    // Fallback: Erste Animation starten
                    importResult.animationGroups[0].play(true);
                    console.log("NPC Fallback Animation gestartet.");
                } else {
                    console.warn("Keine AnimationGroups im geladenen GLB gefunden.");
                }
            } catch (error) {
                console.error("Fehler beim Laden des NPC GLB:", error);
            }
            // Handle web entity events.
            scene.onEntityEventObservable.add((entityEvent) => {
                if (entityEvent.type === EntityEventType.JOIN_CONFERENCE_ROOM) {
                    this.$emit("join-conference-room", entityEvent.data);
                }
                if (entityEvent.type === EntityEventType.MOUSE_PRESS) {
                    // HIER die ID der Entity einfügen, auf die geklickt werden soll. 
                    // Angenommen, das ist das Modell, das du als "play.glb" bezeichnest.
                    const playButtonEntityID = "{391f7dd7-2d16-44ed-bd86-77e0721a05e8}"; 
                    
                    if (entityEvent.entityID === playButtonEntityID) {
                        console.log("Play-Button geklickt. Wechsle zu Idle-Avatar.");
                        this.changeNpcToIdle();
                    }
                }
            });

            await scene.loadEntities("/local-assets/Med_space_01.json"); // current solution for local import

            // NOTE: The scene must be loaded to register domain events before connecting to the Domain server.
            await scene.load(
                undefined,
                AvatarStoreInterface.getActiveModelData("file")
            );
            await this.connect();

            Renderer.startRenderLoop([scene]);
        },
        /**
         * Update the size of the scene canvas.
         * @param newSize
         */
        resize(newSize: ResizeShape): void {
            this.canvasHeight = newSize.height;
            this.canvasWidth = newSize.width;
            Renderer.resize();
        },
        /**
         * Unload the scene, dispose of the renderer, and disconnect from the Domain server.
         */
        unload(): void {
            Utility.disconnectActiveDomain();
            Renderer.dispose();
            this.locationUnwatch();
        },
        // Update the world location that's shown in the browser's URL bar.
        updateURL(): void {
            // Rate controlling check.
            if (!this.updateUrlReady) {
                return;
            }

            // Remove the protocol from the displayed location.
            let location = this.userStore.avatar.location
                .replace("ws://", "")
                .replace("wss://", "")
                .replace("http://", "")
                .replace("https://", "");

            if (applicationStore.theme.hideInWorldLocation === "true") {
                location = location.split("/")[0];
            }

            // Show the location in the URL.
            window.history.replaceState(null, "", `#/${location}`);

            // If rate throttling in place then set appropriate timeouts.
            if (URL_UPDATE_FREQUENCY > 0) {
                this.updateUrlReady = false;

                setTimeout(() => {
                    this.updateUrlReady = true;
                }, URL_UPDATE_FREQUENCY);
            }
        },
        /**
         * Connect to the Domain server.
         */
        async connect(): Promise<void> {
            let location: string | undefined = Array.isArray(
                this.$route.params.location
            )
                ? this.$route.params.location.join("/")
                : this.$route.params.location;

            if (!location) {
                location =
                    this.applicationStore.defaultConnectionConfig
                        .DEFAULT_DOMAIN_URL;
            }

            if (!location) {
                return;
            }

            // Check if just the position/rotation values differ from the current location.
            const next = new Location(location);
            await Utility.connectionSetup(
                next.host === this.previousLocation?.host
                    ? next.pathname // Teleport the player, instead of reloading the domain connection.
                    : location
            );
            this.previousLocation = next;

            // If the URL is configured to be updated, bind the watcher function.
            if (URL_UPDATE_FREQUENCY >= 0) {
                this.locationUnwatch = watch(
                    () => this.userStore.avatar.location,
                    () => this.updateURL()
                );
            } else {
                // If URL updating is disbled (by having a negative frequency) then don't bind the watcher function.
                // And remove the path from the URL bar.
                window.history.replaceState(null, "", `#/`);
            }
        },
        
        async changeNpcToIdle(): Promise<void> {
            const scene = Renderer.createScene(); // Du benötigst wieder Zugriff auf die Scene
            // 1. ALTEN NPC ENTFERNEN
            if (this.currentNpcMesh) {
                this.currentNpcMesh.dispose();
                this.currentNpcMesh = null;
                console.log("Alter NPC erfolgreich entfernt.");
            }
            // Alle Animationen stoppen (falls noch welche liefen)
            if (this.npcAnimationGroups) {
                this.npcAnimationGroups.forEach(ag => ag.stop());
                this.npcAnimationGroups = null;
            }
            
            // 2. NEUEN NPC LADEN
            try {
                const idleAssetUrl = "https://ams3.digitaloceanspaces.com/doob-highfidelity/MeditationSpaceLarger/NPC/Priscilla_idle.glb"; 
                const importResult = await BABYLON.SceneLoader.ImportMeshAsync("","",idleAssetUrl, scene._scene);
                console.log("Idle-NPC erfolgreich geladen. AnimationGroups:", importResult.animationGroups.map((a) => a.name));
                // 3. DATEN SPEICHERN UND POSITIONIEREN
                if (importResult.meshes.length > 0) {
                    const rootMesh = importResult.meshes[0];
                    this.currentNpcMesh = rootMesh; // Speichere das Root-Mesh
                    // Positioniere das Modell an der gewünschten Stelle (z.B. 0, 0, 5)
                    rootMesh.position = new BABYLON.Vector3(32, 9, 187);
                    rootMesh.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0); 
                    console.log("DEBUG: Idle-NPC auf Position (0, 0, 5) verschoben.");
                }
                this.npcAnimationGroups = importResult.animationGroups; // Speichere die Animationen
                if (importResult.animationGroups.length > 0) {
                    // Finde die 'idle' Animation (oder nimm die erste)
                    const idleAnim = importResult.animationGroups.find((a) => a.name.toLowerCase().includes("idle"));
                    const animToPlay = idleAnim || importResult.animationGroups[0];
                    animToPlay.play(true); // true = loop
                    console.log(`SUCCESS: Idle Animation '${animToPlay.name}' gestartet.`);
                }
            } catch (error) {
                console.error("FATAL ERROR: Fehler beim Laden des Idle NPC GLB:", error);
            }
        },
    },

    created(): boolean {
        return this.sceneCreated;
    },

    beforeMount() {
        window.addEventListener("beforeunload", () => this.unload());
    },

    // Called after MainScene is loaded onto the page.
    mounted() {
        void this.boot();
    },

    beforeUnmount() {
        window.removeEventListener("beforeunload", () => this.unload());
        this.unload();
    },
});
</script>