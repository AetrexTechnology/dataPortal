import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer } from "rxjs";

import { forkJoin } from "rxjs";
import { merge, switchMap, switchMapTo, tap } from "rxjs/operators";
import { Group, ObjectLoader, Texture } from "three";
// import { never } from "rxjs/observable/never";
// import { Object3D } from "three/src/core/Object3D";
// import { of } from "rxjs/observable/of";
// import { StorageService } from 'src/app/shared/services/storage.service';
// import { UserFootPassportService } from 'src/app/shared/services/user-foot-passport.service';

declare let THREE: any;

interface GroupModel {
    detail: {
        loaderRootNode: Group
    },
    name: string
}


interface OBJLoader2 {
    load(
        url: string,
        // tslint:disable-next-line:no-unnecessary-generics
        onLoad?: (object: GroupModel) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: Error | ErrorEvent) => void,
    ): void;
}

interface ILoader<T> {
    load(
        url: string,
        // tslint:disable-next-line:no-unnecessary-generics
        onLoad?: (object: T) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: Error | ErrorEvent) => void,
    ): void
}

/**
 * Use this type in the loaderObservable method. Can only be used with version 3 of typescript
 * It is needed to output the type depending on the passed loader to the parameter.
 * @example
 * public loaderObservable<TLoader>(loader: TLoader, objUrl: string, progressObserver: Observer<number> | null = null): Observable<LoaderValueOf<TLoader>>
 * loaderObservable(new THREE.OBJLoader2(), leftFootUrl, progressObserver) and then the type that will return this call will be GroupModel
 * loaderObservable(new THREE.OBJLoader(), leftFootUrl, progressObserver) => Group
 * loaderObservable(new THREE.TextureLoader(), leftFootUrl, progressObserver) => Texture
 */
// type LoaderValueOf<O> = O extends Iload<infer T> ? T : never;

@Injectable()
export class ThreeDFeetService {

    scanHash: any;
    position: BehaviorSubject<string> = new BehaviorSubject('Init');

    constructor(
        // private storageService: StorageService
        // ,        private userFPService: UserFootPassportService
        ) {
    }

    clipingPlane = new THREE.Plane(new THREE.Vector3(0, 2, 0), 0);
    objects = {
        rFoot: null,
        boxRight: null,
        instepBoxRight: null,
        lFoot: null,
        boxLeft: null,
        instepBoxLeft: null,
        materials: {
            materialClipPlane: this.clipingPlane,
            footMaterial: new THREE.MeshStandardMaterial({
                color: 0xe5e5e5,
                polygonOffset: true,
                polygonOffsetFactor: 1, // positive value pushes polygon further away
                polygonOffsetUnits: 1,
                metalness: 0,
                roughness: 0.5,
                side: THREE.DoubleSide,
                transparent: true,
                clippingPlanes: [this.clipingPlane]
            }),
            wireMaterial: new THREE.MeshStandardMaterial({
                color: 0xbbbbbb, metalness: 0,
                roughness: 1,
                clippingPlanes: [this.clipingPlane],
                transparent: true,
                opacity: 1
            }),
            groundMaterial: new THREE.MeshBasicMaterial({
                color: 0xffffff,
                opacity: 0.5,
                transparent: true,
            }),
        }
    };

    finalResults = null;

    preloaded = false;

    change3DPosition: (position: any) => void;

    setFinalResults(measurements: any) {
        this.finalResults = {
            Borders: {
                left: {
                    MinX: 0,
                    MaxX: 0,
                    MinY: 0,
                    MaxY: 0
                },
                right: {
                    MinX: 0,
                    MaxX: 0,
                    MinY: 0,
                    MaxY: 0
                }
            },

            Statistics: {
                left: {
                    HeelToBallPoint: 0,
                    HeelToToe: 0,
                    TotalArea: 0,
                    TopArea: 0,
                    BottomArea: 0,
                    TotalDist: 0,
                    TopDist: 0,
                    BottomDist: 0,
                    TotalWholeAverage: 0,
                    MaxWeight: 0,
                    MaxWeightTopXLoct: 0,
                    MaxWeightTopYLoct: 0,
                    MaxWeightTop: 0,
                    MaxWeightXLoct: 0,
                    MaxWeightYLoct: 0,
                    MaxWeightBottom: 0,
                    AvgPressure: 0,
                    AvgWeight: 0
                },
                right: {
                    HeelToBallPoint: 0,
                    HeelToToe: 0,
                    TotalArea: 0,
                    TopArea: 0,
                    BottomArea: 0,
                    TotalDist: 0,
                    TopDist: 0,
                    BottomDist: 0,
                    TotalWholeAverage: 0,
                    MaxWeight: 0,
                    MaxWeightTopXLoct: 0,
                    MaxWeightTopYLoct: 0,
                    MaxWeightTop: 0,
                    MaxWeightXLoct: 0,
                    MaxWeightYLoct: 0,
                    MaxWeightBottom: 0,
                    AvgPressure: 0,
                    AvgWeight: 0
                },
                footDiffrentiation: 0,
            },

            HeelToBallPointDetails: {
                left: {
                    TopHighX: 0,
                    TopHighY: 0,
                    TopLowX: 0,
                    TopLowY: 0
                },
                right: {
                    TopHighX: 0,
                    TopHighY: 0,
                    TopLowX: 0,
                    TopLowY: 0
                }
            },

            HeelToToeDetails: {
                left: {
                    BottomMaxX: 0,
                    BottomMaxY: 0,
                    BottomMinX: 0,
                    BottomMinY: 0,
                    TopMaxX: 0,
                    TopMaxY: 0,
                    TopMinX: 0,
                    TopMinY: 0
                },
                right: {
                    BottomMaxX: 0,
                    BottomMaxY: 0,
                    BottomMinX: 0,
                    BottomMinY: 0,
                    TopMaxX: 0,
                    TopMaxY: 0,
                    TopMinX: 0,
                    TopMinY: 0
                }
            },

            ArchLineDetails: {
                TopRightX: 0,
                TopRightY: 0,
                BottomRightX: 0,
                BottomRightY: 0,
                TopLeftX: 0,
                TopLeftY: 0,
                BottomLeftX: 0,
                BottomLeftY: 0
            },

            FinalResults: {
                right: {
                    Length: measurements[0].measurementProperties[1].magnitude,
                    Width: measurements[1].measurementProperties[1].magnitude,
                    DorsalHeightMm: measurements[2].measurementProperties[1].magnitude,
                    ArchHeightMm: measurements[4].measurementProperties[1].magnitude,
                    GirthMm: measurements[6].measurementProperties[1].magnitude,
                    ArchMaxZero1: 0,
                    TotalPressureAmount: 0, // todo find info source meanwhile using totalWholeAvarage
                    MT: false,
                    Arch: measurements[3].measurementProperties[1].magnitude,
                    DorsalType: "Medium",
                },
                left: {
                    Length: measurements[0].measurementProperties[0].magnitude,
                    Width: measurements[1].measurementProperties[0].magnitude,
                    DorsalHeightMm: measurements[2].measurementProperties[0].magnitude,
                    ArchHeightMm: measurements[4].measurementProperties[1].magnitude,
                    GirthMm: measurements[6].measurementProperties[0].magnitude,
                    ArchMaxZero1: 0,
                    TotalPressureAmount: 0, // todo find info source meanwhile using totalWholeAvarage
                    MT: false,
                    Arch: measurements[3].measurementProperties[0].magnitude,
                    DorsalType: "Medium",
                }
            },

            Sizes: {
                male: {},
                female: {}
            },

            IsChild: false,

            /* FeetAverageArray: {
                FeetAvgArray: $rootScope.feetAvgArray,
                WidthSensors: $rootScope.feetArrayWidth,
                HeightSensors: $rootScope.footArrayHeight
            }, */

            Matrix32: null

        }
    }

    getFinalResults() {
        return this.finalResults.FinalResults;
    }


    resetObjects() {
        this.objects.rFoot = null;
        this.objects.boxRight = null;
        this.objects.instepBoxRight = null;
        this.objects.lFoot = null;
        this.objects.boxLeft = null;
        this.objects.instepBoxLeft = null;
        this.preloaded = false;
    }

    getMaterials() {
        return this.objects.materials;
    }

    get(foot) {
        return this.objects[foot];
    }

    getLeftFoot() {
        return this.objects.lFoot;
    }

    getRightFoot() {
        return this.objects.rFoot;
    }

    setLeftFoot(lFoot) {
        this.objects.lFoot = lFoot;
    }

    setRightFoot(rFoot) {
        this.objects.rFoot = rFoot;
    }

    getBoxLeft() {
        return this.objects.boxLeft;
    }

    getBoxRight() {
        return this.objects.boxRight;
    }

    setBoxLeft(boxLeft) {
        this.objects.boxLeft = boxLeft;
    }

    setBoxRight(boxRight) {
        this.objects.boxRight = boxRight;
    }

    getInstepBoxLeft() {
        return this.objects.instepBoxLeft;
    }

    getInstepBoxRight() {
        return this.objects.instepBoxRight;
    }

    setInstepBoxLeft(instepBoxLeft) {
        this.objects.instepBoxLeft = instepBoxLeft;
    }

    setInstepBoxRight(instepBoxRight) {
        this.objects.instepBoxRight = instepBoxRight;
    }

    preloadFoot(
        leftFootUrl: string,
        rightFootUrl: string,
        leftFootTexture?,
        rightFootTexture?,
        progressObserver: Observer<number> | null = null,
    ): Observable<any[]> {
        /* return forkJoin([
            of(leftFootTexture).pipe(
                switchMap(texture => {
                    if (texture) {
                        return this.preloadTextureFoot(texture).pipe(
                            switchMap(texture => this.loaderObservable(new THREE.OBJLoader2(), leftFootUrl, progressObserver).pipe(
                                tap((footDetails: GroupModel) => {
                                    this.setupLeftFoot(footDetails, texture);
                                })
                            ))
                        )
                    } else {
                        return this.loaderObservable(new THREE.OBJLoader2(), leftFootUrl, progressObserver).pipe(
                            tap((footDetails: GroupModel) => {
                                this.setupRightFoot(footDetails, texture);
                            })
                        );
                    }
                })
            ),
            of(rightFootTexture).pipe(
                switchMap(texture => {
                    if (texture) {
                        return this.preloadTextureFoot(texture).pipe(
                            switchMap(texture => this.loaderObservable(new THREE.OBJLoader2(), rightFootUrl, progressObserver).pipe(
                                tap((footDetails: GroupModel) => {
                                    this.setupLeftFoot(footDetails, texture);
                                })
                            ))
                        )
                    } else {
                        return this.loaderObservable(new THREE.OBJLoader2(), rightFootUrl, progressObserver).pipe(
                            tap((footDetails: GroupModel) => {
                                this.setupRightFoot(footDetails, texture);
                            })
                        );
                    }
                })
            )
        ]); */

        if (leftFootTexture && rightFootTexture) {
            return forkJoin([
                this.preloadTextureFoot(leftFootTexture).pipe(
                    switchMap(texture => this.loaderObservable(new THREE.OBJLoader2(), leftFootUrl, progressObserver).pipe(
                        tap((footDetails: GroupModel) => {
                            this.setupLeftFoot(footDetails, texture);
                        })
                    ))
                ),
                this.preloadTextureFoot(rightFootTexture).pipe(
                    switchMap(texture => this.loaderObservable(new THREE.OBJLoader2(), rightFootUrl, progressObserver).pipe(
                        tap((footDetails: GroupModel) => {
                            this.setupRightFoot(footDetails, texture);
                        })
                    ))
                )
            ]);
        } else {
            return forkJoin([
                this.loaderObservable(new THREE.OBJLoader2(), leftFootUrl, progressObserver).pipe(
                    tap((footDetails: GroupModel) => {
                        this.setupLeftFoot(footDetails);
                    })
                ),
                this.loaderObservable(new THREE.OBJLoader2(), rightFootUrl, progressObserver).pipe(
                    tap((footDetails: GroupModel) => {
                        this.setupRightFoot(footDetails);
                    })
                )
            ]);
        }
    }

    public setupRightFoot(footDetails: GroupModel, texture?): void {
        const foot = footDetails.detail.loaderRootNode;
        foot.name = "rFoot";
        this.setupFoot(foot, false, texture);
        // foot.traverse(node => {
        //     if (node.material) {
        //         if (Array.isArray(node.material)) {
        //             node.material.forEach(m => m.vertexColors = true);
        //         } else {
        //             node.material.vertexColors = true;
        //         }
        //     }
        // })
        this.setRightFoot(foot);
        var boxRight = new THREE.Box3().setFromObject(foot);
        this.setBoxRight(boxRight);
        var cloneRFoot = this.cloneBufferGeometryToHalf(foot.children[0], 'y');
        var instepBoxRight = new THREE.Box3().setFromObject(cloneRFoot);
        this.setInstepBoxRight(instepBoxRight);
        cloneRFoot = null;
    }

    public setupLeftFoot(footDetails: GroupModel, texture?): void {
        const foot = footDetails.detail.loaderRootNode;
        foot.name = "lFoot";
        this.setupFoot(foot, true, texture);
        this.setLeftFoot(foot);
        var boxLeft = new THREE.Box3().setFromObject(foot);
        this.setBoxLeft(boxLeft);
        var cloneLFoot = this.cloneBufferGeometryToHalf(foot.children[0], 'y');
        var instepBoxLeft = new THREE.Box3().setFromObject(cloneLFoot);
        this.setInstepBoxLeft(instepBoxLeft);
        cloneLFoot = null;
    }

    preloadTextureFoot(
        leftFootUrl: string,
        progressObserver: Observer<number> | null = null,
    ): Observable<Texture> {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin('anonymous');
        return this.loaderObservable(textureLoader, leftFootUrl, progressObserver);
    }

    public loaderObservable<T extends ILoader<any>>(loader: T, objUrl: string, progressObserver: Observer<number> | null = null): Observable<any> {
        return new Observable((subscriber) => {
            loader.load(
                objUrl,
                (obj) => {
                    subscriber.next(obj);
                    subscriber.complete();
                },
                (event: ProgressEvent) => {
                    if (progressObserver) {
                        progressObserver.next(event.loaded / event.total);
                    }
                },
                (event) => subscriber.error(event),
            );
        });
    }

    setupFoot(foot, isLeft?, texture?: Texture) {
        if (!isLeft) {
            isLeft = false;
        }
        var target_scale = 1;
        this.reCalculateNormals(foot.children[0]);
        foot.children[0].geometry.computeBoundingBox();
        var boundingBox = foot.children[0].geometry.boundingBox;
        var position = new THREE.Vector3();
        position.subVectors(boundingBox.max, boundingBox.min);
        position.multiplyScalar(0.5);
        position.add(boundingBox.min);
        position.applyMatrix4(foot.children[0].matrixWorld);
        foot.children[0].geometry.center();

        foot.children[0].position.x = isLeft ?
            (boundingBox.max.x - boundingBox.min.x - 0.005) * target_scale :
            -(boundingBox.max.x - boundingBox.min.x - 0.005) * target_scale;

        foot.children[0].position.y = 0;
        foot.children[0].position.z = position.z * target_scale + 0.0002;
        const material = new THREE.MeshBasicMaterial({ vertexColors: true, color: 'white', wireframe: false });
        foot.children[0].name = (isLeft ? "left" : "right") + "FootMesh";
        if (texture) {
            /* const material = new THREE.MeshBasicMaterial({
                map: texture,
              }); */
            foot.children[0].material.needsUpdate = true;
            foot.children[0].material.vertexColors = false;
            // foot.children[0].material.color = 'white';
            foot.children[0].material.metalness = 0.05;
            foot.children[0].material.roughness = 0.9;

            // foot.children[0].material.emissive = '0xf5dcc4';
            // foot.children[0].material.emissiveIntensity = 1;

            foot.children[0].material.map = texture;
            foot.children[0].material.needsUpdate = true;
        } else {
            /* 
            foot.children[0].material = material; */
            foot.children[0].material = this.objects.materials.footMaterial;
            // foot.children[0].material.vertexColors = true;
            foot.children[0].material.needsUpdate = true;
        }
        // var lineGeometry = this.getWireframeGeometry(foot.children[0].geometry);
        // var wireObj = new THREE.LineSegments(lineGeometry, this.objects.materials.wireMaterial);
        // wireObj.position.copy(foot.children[0].position);
        // foot.add(wireObj);
    }

    getWireframeGeometry(sourceGeometry) {
        var lineGeometry = new THREE.Geometry().fromBufferGeometry(sourceGeometry);
        var lineIndices = [];

        for (var i = 0; i < lineGeometry.faces.length; i++) {
            var face = lineGeometry.faces[i];
            var a = lineGeometry.vertices[face.a];
            var b = lineGeometry.vertices[face.b];
            var c = lineGeometry.vertices[face.c];

            var ab = a.distanceTo(b);
            var bc = b.distanceTo(c);
            var ac = c.distanceTo(a);
            if (ab > bc && ab > ac) {
                lineIndices.push(face.a, face.c, face.b, face.c);
            } else if (bc > ab && bc > ac) {
                lineIndices.push(face.a, face.b, face.a, face.c);
            } else {
                lineIndices.push(face.a, face.b, face.b, face.c);
            }
        }
        var lineBufferGeometry = new THREE.BufferGeometry().fromGeometry(lineGeometry);
        lineBufferGeometry.setIndex(lineIndices);
        return lineBufferGeometry;
    }

    cloneBufferGeometryToHalf(mesh: any, type: any) {
        const positions: number[] = [];
        const normals: number[] = [];
        const colors: number[] = [];
        const xArray: number[] = [];
        const yArray: number[] = [];
        const zArray: number[] = [];
        for (var i = 0; i < mesh.geometry.attributes.position.array.length; i += mesh.geometry.attributes.position.itemSize) {
            zArray.push(mesh.geometry.attributes.position.array[i + 2]);
            yArray.push(mesh.geometry.attributes.position.array[i + 1]);
            xArray.push(mesh.geometry.attributes.position.array[i]);
        }
        const [minZ, maxZ] = this.arrayMinMax(zArray)
        var middleZ = minZ + (maxZ - minZ) / 2;

        const [minX, maxX,] = this.arrayMinMax(xArray)
        var middleX = minX + (maxX - minX) / 2;
        //
        const [minY, maxY,] = this.arrayMinMax(yArray)

        var middleY = minY + (maxY - minY) / 2;

        for (var i = 0; i < mesh.geometry.attributes.position.array.length; i += mesh.geometry.attributes.position.itemSize) {
            if (
                (type === 'x' && mesh.geometry.attributes.position.array[i] < middleX) ||
                (type === 'y' && mesh.geometry.attributes.position.array[i + 1] < middleY) ||
                (type === 'z' && mesh.geometry.attributes.position.array[i + 2] < middleZ)
            ) {
                for (var j = 0; j < mesh.geometry.attributes.position.itemSize; j++) {
                    positions.push(mesh.geometry.attributes.position.array[i + j]);
                    normals.push(mesh.geometry.attributes.normal.array[i + j]);
                    colors.push(mesh.geometry.attributes.color.array[i + j]);
                }
            }
        }
        var geometry = new THREE.BufferGeometry();
        var positionNumComponents = mesh.geometry.attributes.position.itemSize;
        var normalNumComponents = mesh.geometry.attributes.normal.itemSize;
        var colorNumComponents = mesh.geometry.attributes.color.itemSize;
        geometry.addAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
        // geometry.addAttribute(
        //     'normal',
        //     new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
        // geometry.addAttribute(
        //     'color',
        //     new THREE.BufferAttribute(new Float32Array(colors), colorNumComponents));
        var foot = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
        foot.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
        return foot;
    }

    public arrayMinMax(arr): [number, number] {
        return arr.reduce(([min, max], val) => [Math.min(min, val), Math.max(max, val)], [
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
        ]);
    }

    // Re-calculate normals for given object
    reCalculateNormals(obj) {
        var tempGeometry = new THREE.Geometry().fromBufferGeometry(obj.geometry);
        tempGeometry.mergeVertices();
        tempGeometry.computeVertexNormals();
        obj.geometry = new THREE.BufferGeometry().fromGeometry(tempGeometry);
    }

    getZoomValues() {
        let resHeight = window.screen.availHeight;
        let resWidth = window.screen.availWidth;

        let zoomValues;

        if (resHeight > 670) {
            zoomValues = {
                Init: 1.65,
                Length: 1.65,
                Width: 1.25,
                DorsalHeight: 1.65,
                ArchHeight: 1.65,
                Girth: 1.65,
                LengthLeft: 1.9,
                LengthRight: 1.9,
                WidthRight: 1.9,
                WidthLeft: 1.9,
                DorsalHeightLeft: 1.9,
                DorsalHeightRight: 1.9,
                ArchHeightLeft: 1.9,
                ArchHeightRight: 1.9,
                GirthRight: 1.9,
                GirthLeft: 1.9,
                MedianShoeSize: 1.65,
            }
        }
    }

}
