
import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, SimpleChange } from '@angular/core';
import { FootService } from "../foot.service";
import { ShadowRenderer } from './../shadowrenderer';
import { BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DestroyableBase } from '../destroyable';
// import { UserService } from 'src/app/shared/services/user.service';
import { ThreeDFeetService } from '../three-d-feet.service';

declare let Detector: any;
declare let THREE: any;
declare let TWEEN: any;

@Component({
    selector: 'app-feet-renderer',
    templateUrl: './feet-renderer.component.html',
    styleUrls: ['./feet-renderer.component.scss']
})

export class FeetRendererComponent extends DestroyableBase implements AfterViewInit, OnChanges {
    footUrls: Array<string> = [];


    /**
     * Stream with the url of the legs. When new values are emitted to the stream, they are reloaded.
     * If the legs need to be loaded depending on the ScanId change to to this.userFPService.getScanHashByScanID(scanID).pipe(map(...))
     */
    public urlFoots$ = new BehaviorSubject<string[]>([]);
    @Input() threeDPosition = 'Init';
    @Input() passportMeasurements = []

    @Input() lfoot:any;
    @Input() rfoot:any;

    /**
     * Observable with the value of loading foot.Needed to display the loading indicator.
     * It is needed in order not to run the animation while the download is in progress.
     */
    public isLoadingFoot$ = new BehaviorSubject<boolean>(true);
    isNaturalZone = false;

    public treeDPosition$ = new BehaviorSubject<string>(this.threeDPosition);

    // let stats;
    public _container;
    public _controls;
    public _camera;
    public _scene;
    public _renderer;
    public _shadowRenderer: ShadowRenderer | undefined;
    public _light;
    public _rimLight;
    public _ambientLight;
    private _parentHeight;
    private _parentWidth;
    private frameId;
    
    public _clock = new THREE.Clock();

    public _mixers = [];
    private _element: ElementRef;
    private _footService: FootService;
    private _threeDPositions: any;
    private _animationRequestID: any;
    private _boxLeftBeforeScale: any;
    private _boxRightBeforeScale: any;
    private _boxLeft: any;
    private _boxRight: any;
    private _drawedLines: any[] = [];
    private _currentWidth = 96;
    private _currentLength = 250;
    private _realWidthLeft;
    private _realLengthLeft;
    private _realWidthRight;
    private _realLengthRight;
    private _LeftLengthWidthDorsal;
    private _RightLengthWidthDorsal;
    private _selectedRatioForHeight;
    private LeftArch;
    private RightArch;
    boxLeft = null;
    boxRight = null;
    instepBoxLeft = null;
    instepBoxRight = null;
    mainGroup = new THREE.Group;
    modelGroup = new THREE.Group;

    drawTimeout = 750;
    main_color = 0x484848;
    size = 0.001;
    lineWidth = this.size;
    dashedSize = 0.0004;
    dashedPadding = 0.005;
    gapSize = 0.0005;
    arrowHeadLength = this.size;
    arrowHeadWidth = this.size;
    archHeight = 0.004;
    currentThreeDPosition = "Length";
    initializePos = false;
    finalResults = null;
    currentData = "";

    /*
    ,
        public userService: UserService
         */
    constructor(element: ElementRef, footService: FootService,
        private ngZone: NgZone,
        private threeDService: ThreeDFeetService) {
        super();

        //read foot URL's from iframe element 
        // var iframeEl = window.frameElement;
        // if (iframeEl && iframeEl.getAttribute('lfoot') != '') {
        //     this.footUrls.push(window.frameElement.getAttribute('lfoot').toString());
        // }
        // if (iframeEl && iframeEl.getAttribute('rfoot') != '') {
        //     this.footUrls.push(window.frameElement.getAttribute('rfoot').toString());
        // }
        this.lfoot = this.threeDService.getLeftFoot();
        this.rfoot = this.threeDService.getRightFoot();
            if(this.lfoot) {
                this.footUrls.push(this.lfoot);
            }
            if(this.rfoot) {
                this.footUrls.push(this.rfoot);
            }
        if(this.footUrls.length === 0) {
            this.footUrls= [
                'https://s3.amazonaws.com/aetrex-scanneros-scans/QA/779fa3cc0dfc27a088539ece60d1166a518a27088c6ed3781a6ee5029e07d3e4/CurrentTest/3DModel/left_foot.obj',
                'https://s3.amazonaws.com/aetrex-scanneros-scans/QA/779fa3cc0dfc27a088539ece60d1166a518a27088c6ed3781a6ee5029e07d3e4/CurrentTest/3DModel/right_foot.obj'
            ]
        }
        console.log('feet obj files are read from iframe attrbutes', this.footUrls);

        this.threeDService.change3DPosition = this.change3DPosition.bind(this);

        this._element = element;
        this._footService = footService;
        this._footService.setDefaults();
        this._footService.current3DType = this._footService._Type3D.toString();

        this._realLengthLeft = this._footService.scan.Left.LengthMm;
        this._realWidthLeft = this._footService.scan.Left.WidthMm;
        this._realLengthRight = this._footService.scan.Right.LengthMm;
        this._realWidthRight = this._footService.scan.Right.WidthMm;



        if (this.footUrls) {
            // this.isNaturalZone = (urls.length > 2) ? true : false;
            this.removeFromSceneAlbert2('rFoot');
            this.removeFromSceneAlbert2('lFoot');
            this.urlFoots$.next(this.footUrls);
            this.isLoadingFoot$.next(true);
            this.threeDPosition = 'PreInit';
            this.updateLighting();
        }
    }

    ngOnInit() {
        this._threeDPositions = {
            PreInit: { x: -64.89671436191402, y: 133.73029609667967, z: -118.34071093613572 },
            Init: { x: 42.33546883625148, y: 64.82966653789856, z: 67.32188867412223 },
            Length: { x: 42.33546883625148, y: 64.82966653789856, z: 67.32188867412223 },
            Width: { x: -11.160508871010546, y: 103.18589792548828, z: -0.013815762631599138 },
            LengthLeft: { x: 79.71414244324305, y: 49.59331006150612, z: 44.24981097706696 },
            LengthRight: { x: -82.49161081240399, y: 47.475757279184286, z: 41.389289631103516 },
            WidthRight: { x: -82.49161081240399, y: 47.475757279184286, z: 41.389289631103516 },
            WidthLeft: { x: 79.71414244324305, y: 49.59331006150612, z: 44.24981097706696 },
            DorsalHeight: { x: -82.49161081240399, y: 47.475757279184286, z: 41.389289631103516 },
            DorsalHeightLeft: { x: -82.49161081240399, y: 47.475757279184286, z: 41.389289631103516 },
            DorsalHeightRight: { x: 79.71414244324305, y: 49.59331006150612, z: 44.24981097706696 },
            InstepHeight: { x: -82.49161081240399, y: 47.475757279184286, z: 41.389289631103516 },
            InstepHeightLeft: { x: -82.49161081240399, y: 47.475757279184286, z: 41.389289631103516 },
            InstepHeightRight: { x: 79.71414244324305, y: 49.59331006150612, z: 44.24981097706696 },
            ArchHeight: { x: -82.49161081240399, y: 47.475757279184286, z: 41.389289631103516 },
            ArchHeightLeft: { x: -82.49161081240399, y: 47.475757279184286, z: 41.389289631103516 },
            ArchHeightRight: { x: 79.71414244324305, y: 49.59331006150612, z: 44.24981097706696 },
            Girth: { x: -82.49161081240399, y: 47.475757279184286, z: 41.389289631103516 },
            GirthLeft: { x: -82.49161081240399, y: 47.475757279184286, z: 41.389289631103516 },
            GirthRight: { x: 79.71414244324305, y: 49.59331006150612, z: 44.24981097706696 },
            MedianShoeSize: { x: -97.28811860356257, y: 33.37367980248364, z: 13.896264060707129 },
            RecommendedShoeSize: { x: -30.116061591275248, y: 10.873292867585818, z: -7.123093934625116 },
            BackBoth: { x: 0, y: 0, z: -120 },
            BackLeft: { x: 0, y: 0, z: -120 },
            BackRight: { x: 0, y: 0, z: -120 },
            ArchLeft: { x: -90, y: 0, z: 0 },
            ArchRight: { x: 90, y: 0, z: 0 }
        };

        this.currentThreeDPosition = "Length";
        this.currentData = "";
    }

    ngAfterViewInit() {
        this._footService.fbxPbject = undefined;
        this.set3DModel();
    }

    ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
        if (changes.threeDPosition && !changes.threeDPosition.firstChange) {
            this.rotateCamera2(this.threeDPosition);
        }
        this.lfoot = this.threeDService.getLeftFoot();
        this.rfoot = this.threeDService.getRightFoot();
            this.footUrls= [];
            this.footUrls.push(this.lfoot,this.rfoot);
        if (this.footUrls) {
            // this.isNaturalZone = (urls.length > 2) ? true : false;
            this.removeFromSceneAlbert2('rFoot');
            this.removeFromSceneAlbert2('lFoot');
            this.urlFoots$.next(this.footUrls);
            this.isLoadingFoot$.next(true);
            // this.threeDPosition = 'PreInit';
            this.updateLighting();
        }
    }

    change3DPosition(position: any) {
        this.threeDPosition = position;
        this.rotateCamera2(this.threeDPosition);
    }

    calcParentHeight(container: HTMLElement): void {
        this._parentHeight = container.clientHeight;
        this._parentWidth = container.clientWidth;
    }

    set3DModel(): void {
        this._container = this._element.nativeElement;
        this.calcParentHeight(this._container);

        this.setupRenderer();
        this.createSceneWithLighting();
        this.setupCamera();

        if (!this._footService.fbxPbject) {
            const footRatioLengthRight = this._realLengthRight / this._currentLength;
            const footRatioWidthRight = this._realWidthRight / this._currentWidth;
            const footRatioLengthLeft = this._realLengthLeft / this._currentLength;
            const footRatioWidthLeft = this._realWidthLeft / this._currentWidth;
            this._selectedRatioForHeight = footRatioLengthLeft < footRatioLengthRight ? footRatioLengthLeft : footRatioLengthRight;
            this._footService.fbxPbject = {};

            const LeftWidthMm = this._footService.scan.LeftWidthMm;
            const RightWidthMm = this._footService.scan.RightWidthMm;
            const LeftLengthMm = this._footService.scan.LeftLengthMm;
            const RightLengthMm = this._footService.scan.RightLengthMm;
            this.LeftArch = this._footService.scan.Left.ArchType;
            this.RightArch = this._footService.scan.Right.ArchType;

            this.urlFoots$.pipe(
                switchMap(([leftFootUrl, rightFootUrl, leftFootTexture, rightFootTexture]) => this.threeDService.preloadFoot(
                    leftFootUrl,
                    rightFootUrl,
                    leftFootTexture,
                    rightFootTexture
                )),
                takeUntil(this.destroy$),
            ).subscribe(
                () => {
                    this.isLoadingFoot$.next(false);
                    if (this._footService.showLeftFoot) {
                        this.modelGroup.add(this.threeDService.getLeftFoot());
                    }
                    if (this._footService.showRightFoot) {
                        this.modelGroup.add(this.threeDService.getRightFoot());
                    }

                    this.boxLeft = this.threeDService.getBoxLeft();
                    this.boxRight = this.threeDService.getBoxRight();
                    this.instepBoxLeft = this.threeDService.getInstepBoxLeft();
                    this.instepBoxRight = this.threeDService.getInstepBoxRight();

                    // lineWidth = 0.03 * (this.boxLeft.max.x - this.boxLeft.min.x);
                    var dashedSize = 0.025 * (this.boxLeft.max.x - this.boxLeft.min.x);
                    var dashedPadding = 0.14 * (this.boxLeft.max.x - this.boxLeft.min.x);
                    var gapSize = 0.014 * (this.boxLeft.max.x - this.boxLeft.min.x);
                    var arrowHeadLength = 0.03 * (this.boxLeft.max.x - this.boxLeft.min.x);
                    var arrowHeadWidth = 0.03 * (this.boxLeft.max.x - this.boxLeft.min.x);
                    var archHeight = 0.11 * (this.boxLeft.max.x - this.boxLeft.min.x);
                    this.rotateCamera2(this.threeDPosition);
                    this.animate();
                    this.animations.flyAroundAnimation.start(0)
                }
            )

            this.modelGroup.rotation.x = - Math.PI / 2;

            this.modelGroup.scale.set(175, 175, 175);

            // Somehow models provided in this test are 3 times smaller that the ones that
            // were used for testing in the Albert app. So, increasing the size in 3 times.
            this.modelGroup.scale.multiplyScalar(0.3);

            this.mainGroup.add(this.modelGroup);
        } else {
            if (this._footService.showRightFoot) {
                this._scene.add(this._footService.fbxPbject.rFoot);
            }
            if (this._footService.showLeftFoot) {
                this._scene.add(this._footService.fbxPbject.lFoot);
            }
            if (this._footService.showGrid) {
                this._scene.add(this._footService.fbxPbject.groundGridFoot);
            }
        }

        window.addEventListener('resize', () => {
            if (this._footService.currentType === this._footService._Type3D) {
                this.calcParentHeight(this._container);
                this.onWindowResize();
            }
        }, false);

        this._footService.currentTypeUpdate.subscribe(
            (currentType) => {
                if (this._footService.currentType === this._footService._Type3D) {
                    setTimeout(() => {
                        this.calcParentHeight(this._container);
                        this.onWindowResize();
                    });
                }
            }
        );
        this.mainGroup.add(this.modelGroup);
        this._scene.add(this.mainGroup);
    }

    setupCamera() {
        this._camera = new THREE.PerspectiveCamera(12, this._parentWidth / this._parentHeight, 1, 1000);
        this._camera.position.set(this._threeDPositions['PreInit'].x, this._threeDPositions['PreInit'].y, this._threeDPositions['PreInit'].z);
        this._camera.lookAt(this._scene.position);

        this._controls = new THREE.OrbitControls(this._camera, this._renderer.domElement);
        this._controls.enablePan = false;
        this._controls.target.set(0, 0, 0);
        this._controls.maxPolarAngle = Math.PI * 0.48;
        this._controls.minDistance = 50;
        this._controls.maxDistance = 200;
        this._controls.update();
    }
    createSceneWithLighting() {
        this._scene = new THREE.Scene();
        // this._scene.background = new THREE.Color( '#f8f8f8' );

        this._shadowRenderer = new ShadowRenderer();
        this._shadowRenderer.init(this._renderer, this._scene, this.mainGroup);
        /* this._scene.background = new THREE.ImageUtils.loadTexture('/assets/images/Grid_bg.png'); */

        this._light = new THREE.DirectionalLight(0xffffff, 0.45);
        this._light.position.set(-50, 50, 50);
        this._scene.add(this._light);

        this._ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this._ambientLight.name = "ambientlLight";
        this._scene.add(this._ambientLight);

        this._rimLight = new THREE.PointLight(0x70838e, 1, 200, 2);
        this._rimLight.name = "PointLight";
        this._rimLight.position.set(50, 50, -50);
        this._scene.add(this._rimLight);
    }
    updateLighting() {
        if (!this._light) {
            return;
        }

        if (!this.isNaturalZone) {

            this._light.intensity = 0.45;
            this._light.position.set(-50, 50, 50);

            this._ambientLight.intensity = 0.6;

            this._rimLight.color.setHex('0x70838e');
            this._rimLight.position.set(50, 50, -50);
        }
        else {
            this._light.intensity = 0.5;
            this._light.position.set(50, 50, 50);

            this._ambientLight.intensity = 3;

            this._rimLight.color.setHex('0xffffff');
            this._rimLight.position.set(-50, 50, -50);
        }
    }
    setupRenderer() {
        this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this._renderer.setPixelRatio(1);
        //this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(this._parentWidth, this._parentHeight, false);
        this._renderer.gammaInput = true;
        this._renderer.gammaOutput = true;
        this._renderer.setClearColor(0xffffff, 0);
        this._renderer.localClippingEnabled = true;

        this._container.appendChild(this._renderer.domElement);
    }

    removeFromScene(objName: string): void {
        const selectedObject = this._scene.getObjectByName(objName);
        this._scene.remove(selectedObject);
    }

    addToScene(objName: string): void {
        this._scene.add(this._footService.fbxPbject[objName]);
    }

    removeFromSceneAlbert2(objName: string): void {
        let selectedObjectModel = this.modelGroup.getObjectByName(objName);
        this.modelGroup.remove(selectedObjectModel);
    }

    addToSceneAlbert2(objName: string): void {
        if (objName == 'lFoot') {
            this.modelGroup.add(this.threeDService.getLeftFoot());
        } else {
            this.modelGroup.add(this.threeDService.getRightFoot());
        }
    }

    onWindowResize(): void {
        this.calcParentHeight(this._container);
        const width = window.innerWidth > 1920 ? 1920 : window.innerWidth;
        this._camera.aspect = this._container.clientWidth / this._parentHeight;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(this._container.clientWidth, this._parentHeight);
        // this._renderer.setSize( this._container.parentNode.clientWidth, 769 );
        // this._renderer.setSize( this._container.parentNode.clientWidth, this._container.parentNode.clientHeight );

    }

    // https://angular.io/guide/zone#setting-up-zonejs
    // https://github.com/angular/angular/issues/8804
    animate(): void {
        // We have to run this outside angular zones,
        // because it could trigger heavy changeDetection cycles.
        this.ngZone.runOutsideAngular(() => {
            this.animateRender()
        });
        // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation
        // and requests that the browser call a specified function to update an animation before the next repaint
    }

    private animateRender() {
        this.frameId = requestAnimationFrame(() => { this.animateRender(); });
        TWEEN.update();
        this._controls.update();
        this.render();
    }

    rotateToPos(pos: any, steps: any, stepsNumber: number): void {
        const rotateX = false;
        const rotateY = false;
        const rotateZ = false;
        if (Math.abs(this._camera.position.x - pos.x) > Math.abs(steps.x)) {
            this._camera.position.x -= steps.x;
        } else {
            this._camera.position.x -= (this._camera.position.x - pos.x);
        }
        if (Math.abs(this._camera.position.y - pos.y) > Math.abs(steps.y)) {
            this._camera.position.y -= steps.y;
        } else {
            this._camera.position.y -= (this._camera.position.y - pos.y);
        }
        if (Math.abs(this._camera.position.z - pos.z) > Math.abs(steps.z)) {
            this._camera.position.z -= steps.z;
        } else {
            this._camera.position.z -= (this._camera.position.z - pos.z);
        }
        this._controls.update();
        if (stepsNumber) {
            this._animationRequestID = requestAnimationFrame(() => {
                this.rotateToPos(pos, steps, --stepsNumber);
            });
            // this._controls.target.set(0, 3.5, 0);
        } else {
            window.cancelAnimationFrame(this._animationRequestID);
        }
    }

    rotateCamera(current3Dtype: string): void {
        window.cancelAnimationFrame(this._animationRequestID);
        // this._controls = new THREE.OrbitControls( this._camera, this._renderer.domElement );
        // this._controls.target.set( 0, 0, 0 );
        const pos = { // front
            x: 0.25, y: 18, z: 28,
        };
        const stepsNumber = 80;
        const steps = {
            x: (this._camera.position.x - this._threeDPositions[current3Dtype].x) / stepsNumber,
            y: (this._camera.position.y - this._threeDPositions[current3Dtype].y) / stepsNumber,
            z: (this._camera.position.z - this._threeDPositions[current3Dtype].z) / stepsNumber,
        };
        this.threeDPosition = current3Dtype;
        this.rotateToPos(this._threeDPositions[current3Dtype], steps, stepsNumber);
    }

    rotateCamera2(current3Dtype: string): void {
        this._controls.enabled = false;
        this.clearDrawedLines();
        // this.clearLength();
        // this.clearWidth();

        /**
         * @Todo remove the hardcoded calues
         */
        this.LeftArch = "Medium";
        this.RightArch = "Medium";

        if (current3Dtype == 'Init') {
            this.initializePos = true;
            this.currentThreeDPosition = 'Length';
        }

        if (this.currentData !== current3Dtype) {
            this.clearDrawedLines();
            // this.clearLength();
            // this.clearWidth();
            //setTimeout(() => {
            if (current3Dtype === "Length") {
                this.drawLengthAlbert2();
            } else if (current3Dtype === "LengthLeft") {
                this.drawLeftLengthAlbert2();
            } else if (current3Dtype === "LengthRight") {
                this.drawRightLengthAlbert2();
            } else if (current3Dtype === "Width") {
                this.drawWidthAlbert2();
            } else if (current3Dtype === "WidthLeft") {
                this.drawLeftWidthAlbert2();
            } else if (current3Dtype === "WidthRight") {
                this.drawRightWidthAlbert2();
            } else if (current3Dtype === "DorsalHeight" || current3Dtype === "InstepHeight") {
                this.drawDorsalHeightAlbert2();
            } else if (current3Dtype === "DorsalHeightLeft" || current3Dtype === "InstepHeightLeft") {
                this.drawLeftDorsalHeightAlbert2();
            } else if (current3Dtype === "DorsalHeightRight" || current3Dtype === "InstepHeightRight") {
                this.drawRightDorsalHeightAlbert2();
            } else if (current3Dtype === "ArchHeight") {
                this.drawArchHeightAlbert2();
            } else if (current3Dtype === "ArchHeightLeft") {
                this.drawArchLeftAlbert2(this.LeftArch);
            } else if (current3Dtype === "ArchHeightRight") {
                this.drawArchRightAlbert2(this.RightArch);
            } else if (current3Dtype === "Girth") {
                this.drawGirthAlbert2();
            } else if (current3Dtype === "GirthLeft") {
                this.drawGirthLeftAlbert2();
            } else if (current3Dtype === "GirthRight") {
                this.drawGirthRightAlbert2();
            }
            //}, 500)
        }
        if (current3Dtype != 'Init') {
            this.currentThreeDPosition = current3Dtype;
            this.currentData = current3Dtype;
        } else {
            this.currentData = "";
        }

        window.cancelAnimationFrame(this._animationRequestID);

        if (current3Dtype === "DorsalHeightLeft" || current3Dtype === "ArchHeightLeft" || current3Dtype === "GirthLeft" ||
            current3Dtype === "DorsalHeightRight" || current3Dtype === "ArchHeightRight" || current3Dtype === "GirthRight" ||
            current3Dtype === "LengthLeft" || current3Dtype === "LengthRight" || current3Dtype === "WidthRight" ||
            current3Dtype === "WidthLeft" || current3Dtype === "InstepHeightLeft" || current3Dtype === "InstepHeightRight" || 
            current3Dtype === "BackRight" || current3Dtype === "BackLeft" || current3Dtype === "ArchRight" || current3Dtype === "ArchLeft") {

            if (current3Dtype.indexOf("Right") > -1) {
                this.removeFromSceneAlbert2("lFoot");
                if (this._footService.showRightFoot) {
                    this.addToSceneAlbert2("rFoot");
                }
            } else {
                this.removeFromSceneAlbert2("rFoot");
                if (this._footService.showLeftFoot) {
                    this.addToSceneAlbert2("lFoot");
                }
            }
        } else {
            if (this._footService.showRightFoot) {
                this.addToSceneAlbert2("rFoot");
            }
            if (this._footService.showLeftFoot) {
                this.addToSceneAlbert2("lFoot");
            }
        }

        var fromRadius = Math.sqrt(Math.pow(this._camera.position.x, 2) + Math.pow(this._camera.position.y, 2) + Math.pow(this._camera.position.z, 2));
        var fromPhi = Math.acos(this._camera.position.y / fromRadius);
        var fromTheta = Math.atan2(this._camera.position.x, this._camera.position.z);

        var toRadius = Math.sqrt(Math.pow(this._threeDPositions[current3Dtype].x, 2) + Math.pow(this._threeDPositions[current3Dtype].y, 2) + Math.pow(this._threeDPositions[current3Dtype].z, 2));
        var toPhi = Math.acos(this._threeDPositions[current3Dtype].y / toRadius);
        var toTheta = Math.atan2(this._threeDPositions[current3Dtype].x, this._threeDPositions[current3Dtype].z);

        if (toTheta - fromTheta && toPhi - fromPhi) {
            this.animations.rotateAnimation.start(0, { radius: toRadius, phi: toPhi, theta: toTheta });
        }
    }

    rotateToPos2(startRadius: any, startTheta: any, startPhi: any, endRadius: any, endTheta: any, endPhi: any, stepsNumber: number, count: number): void {
        const currentRadius = startRadius + ((count * (endRadius - startRadius)) / stepsNumber);
        const currentTheta = startTheta + ((count * (endTheta - startTheta)) / stepsNumber);
        const currentPhi = ((endPhi - startPhi) / (endTheta - startTheta)) * (currentTheta - startTheta) + startPhi;
        const nextPoints = {
            x: currentRadius * Math.sin(currentTheta) * Math.sin(currentPhi),
            y: currentRadius * Math.cos(currentTheta),
            z: currentRadius * Math.sin(currentTheta) * Math.cos(currentPhi)
        };

        this._camera.position.x = nextPoints.x;
        this._camera.position.y = nextPoints.y;
        this._camera.position.z = nextPoints.z;
        this._controls.update();
        if (count < stepsNumber) {
            count++;
            this._animationRequestID = requestAnimationFrame(() => {
                this.rotateToPos2(startRadius, startTheta, startPhi, endRadius, endTheta, endPhi, stepsNumber, count);
            });
        } else {
            window.cancelAnimationFrame(this._animationRequestID);
            this._controls.enabled = true;
        }
    }
    rotateCamera3(current3Dtype: string): void {
        this._controls.enabled = false;
        this.clearDrawedLines();
        // this.clearLength();
        // this.clearWidth();
        if (current3Dtype === 'Length') {
            this.drawLength();
        } else if (current3Dtype === 'Width') {
            this.drawWidth();
        }
        window.cancelAnimationFrame(this._animationRequestID);
        const stepsNumber = 200;

        const startRadius = Math.sqrt(Math.pow(this._camera.position.x, 2) + Math.pow(this._camera.position.y, 2) + Math.pow(this._camera.position.z, 2));
        const startTheta = Math.asin(this._camera.position.z / startRadius);
        const startPhi = Math.acos(this._camera.position.x / Math.sqrt(Math.pow(this._camera.position.x, 2) + Math.pow(this._camera.position.y, 2)));

        const endRadius = Math.sqrt(Math.pow(this._threeDPositions[current3Dtype].x, 2) + Math.pow(this._threeDPositions[current3Dtype].y, 2) + Math.pow(this._threeDPositions[current3Dtype].z, 2));
        const endTheta = Math.asin(this._threeDPositions[current3Dtype].z / endRadius);
        const endPhi = Math.acos(this._threeDPositions[current3Dtype].x / Math.sqrt(Math.pow(this._threeDPositions[current3Dtype].x, 2) + Math.pow(this._threeDPositions[current3Dtype].y, 2)));

        if (current3Dtype === 'DorsalHeight' || current3Dtype === 'ArchHeight' || current3Dtype === 'Girth' || current3Dtype === "InstepHeight") {
            this.removeFromScene('rFoot');
        } else {
            this.addToScene('rFoot');
        }
        
        this.rotateToPos3(startRadius, startTheta, startPhi, endRadius, endTheta, endPhi, stepsNumber, current3Dtype, 0);

    }

    rotateToPos3(startRadius: any, startTheta: any, startPhi: any, endRadius: any, endTheta: any, endPhi: any, stepsNumber: number, current3Dtype: string, count: number): void {
        if (Math.abs(startPhi - endPhi) > Math.PI) {
            endPhi = endPhi + Math.PI * 2 * (startPhi - endPhi < 0 ? -1 : 1);
        }
        // const currentX = this._camera.position.x + ((count * (this._threeDPositions[current3Dtype].x - this._camera.position.x)) / stepsNumber );
        // const currentY = this._camera.position.y + ((count * (this._threeDPositions[current3Dtype].y - this._camera.position.y)) / stepsNumber );
        // const currentZ = this._camera.position.z + ((count * (this._threeDPositions[current3Dtype].z - this._camera.position.z)) / stepsNumber );

        const currentRadius = startRadius + (count * (endRadius - startRadius)) / stepsNumber;
        const currentPhi = startPhi + (count * (endPhi - startPhi)) / stepsNumber;
        let currentTheta;
        if (startPhi === endPhi) {
            currentTheta = startTheta + (count * (endTheta - startTheta)) / stepsNumber;
        } else {
            currentTheta = Math.atan((Math.sin(startTheta) * Math.cos(endTheta) * Math.sin(currentPhi - endPhi) - Math.sin(endTheta) * Math.cos(startTheta) * Math.sin(currentPhi - startPhi)) / (Math.cos(startTheta) * Math.cos(endTheta) * Math.sin(startPhi - endPhi)));
            // ./(Math.cos(lat1)*cosd(lat2).*Math.sin(lon1 - lon2)));
        }

        // currentRadius = startRadius + (count * (endRadius - startRadius)) / stepsNumber;

        const nextPoints = {
            x: currentRadius * Math.cos(currentTheta) * Math.cos(currentPhi),
            y: currentRadius * Math.cos(currentTheta) * Math.sin(currentPhi),
            z: currentRadius * Math.sin(currentTheta)
        };

        this._camera.position.x = nextPoints.x;
        this._camera.position.y = nextPoints.y;
        this._camera.position.z = nextPoints.z;
        this._controls.update();
        if (count < stepsNumber) {
            count++;
            this._animationRequestID = requestAnimationFrame(() => {
                this.rotateToPos3(startRadius, startTheta, startPhi, endRadius, endTheta, endPhi, stepsNumber, current3Dtype, count);
            });
        } else {
            window.cancelAnimationFrame(this._animationRequestID);
            this._controls.enabled = true;
        }
    }
    calcLength(): void {

    }
    calcWidth(): void {

    }
    clearDrawedLines(): void {
        for (let i = 0; i < this._drawedLines.length; i++) {
            let selectedObjectModel = this.modelGroup.getObjectByName(this._drawedLines[i]);
            this.modelGroup.remove(selectedObjectModel);
        }
    }
    // clearLength(): void {
    //     let selectedObject = this._scene.getObjectByName("LeftTopArrow");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("LeftBottomArrow");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("leftHeel");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("leftToe");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("RightTopArrow");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("RightBottomArrow");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("rightHeel");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("rightToe");
    //     this._scene.remove( selectedObject );
    // }
    // clearWidth(): void {
    //     let selectedObject = this._scene.getObjectByName("leftSide");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("leftHeel");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("leftToe");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("rightSide");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("rightHeel");
    //     this._scene.remove( selectedObject );
    //     selectedObject = this._scene.getObjectByName("rightToe");
    //     this._scene.remove( selectedObject );
    // }
    drawLength(): void {
        this.drawLeftLength();
        this.drawRightLength();
    }

    drawLeftLength(): void {
        if (!this._boxLeft) {
            return;
        }

        const verticalSpace = 1;
        const horizontalSpace = 0;
        const verticalLineExtraLength = 1;
        const lineZHeight = 1.5;
        const color = 0x9a9a9a;
        const material = new THREE.LineDashedMaterial({
            color: color, dashSize: .3, gapSize: .3, linewidth: 1
        });
        let line, geometry;
        let arrowlength, dir, origin, length, hex, headLength, headWidth;
        // vertical line arrow
        arrowlength = Math.abs(this._boxLeft.max.z + horizontalSpace + horizontalSpace - this._boxLeft.min.z) / 2;
        dir = new THREE.Vector3(0, 0, 1);
        dir.normalize();
        origin = new THREE.Vector3(this._boxLeft.max.x + verticalSpace, lineZHeight, this._boxLeft.min.z + arrowlength + horizontalSpace);
        length = arrowlength;
        hex = color;
        headLength = 0.3;
        headWidth = 0.3;
        const topArrow = new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
        topArrow.name = 'LeftTopArrow';
        this._scene.add(topArrow);
        this._drawedLines.push(topArrow.name);

        arrowlength = Math.abs(this._boxLeft.max.z + horizontalSpace + horizontalSpace - this._boxLeft.min.z) / 2;
        dir = new THREE.Vector3(0, 0, -1);
        dir.normalize();
        origin = new THREE.Vector3(this._boxLeft.max.x + verticalSpace, lineZHeight, this._boxLeft.min.z + arrowlength + horizontalSpace);
        length = arrowlength;
        hex = color;
        headLength = 0.3;
        headWidth = 0.3;
        const bottomArrow = new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
        bottomArrow.name = 'LeftBottomArrow';
        this._scene.add(bottomArrow);
        this._drawedLines.push(bottomArrow.name);

        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(this._boxLeft.max.x + horizontalSpace + verticalSpace + verticalLineExtraLength, lineZHeight, this._boxLeft.min.z - horizontalSpace),
            new THREE.Vector3(this._boxLeft.min.x + horizontalSpace + verticalLineExtraLength, lineZHeight, this._boxLeft.min.z - horizontalSpace),
        );
        geometry.computeLineDistances();
        line = new THREE.Line(geometry, material);
        line.name = 'leftHeel';
        this._scene.add(line);
        this._drawedLines.push(line.name);

        // toe line
        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(this._boxLeft.max.x + horizontalSpace + verticalSpace + verticalLineExtraLength, lineZHeight, this._boxLeft.max.z + horizontalSpace),
            new THREE.Vector3(this._boxLeft.min.x + horizontalSpace + verticalLineExtraLength, lineZHeight, this._boxLeft.max.z + horizontalSpace),
        );
        geometry.computeLineDistances();
        line = new THREE.Line(geometry, material);
        line.name = 'leftToe';
        this._scene.add(line);
        this._drawedLines.push(line.name);
    }

    drawRightLength(): void {
        if (!this._boxRight) {
            return;
        }

        const verticalSpace = 1;
        const horizontalSpace = 0;
        const verticalLineExtraLength = 1;
        const lineZHeight = 1.5;
        const color = 0x9a9a9a;
        const material = new THREE.LineDashedMaterial({
            color: color, dashSize: .3, gapSize: .3, linewidth: 1
        });
        let line, geometry;
        let arrowlength, dir, origin, length, hex, headLength, headWidth;
        // vertical line arrow
        arrowlength = Math.abs(this._boxRight.max.z + horizontalSpace + horizontalSpace - this._boxRight.min.z) / 2;
        dir = new THREE.Vector3(0, 0, 1);
        dir.normalize();
        origin = new THREE.Vector3(this._boxRight.min.x - verticalSpace, lineZHeight, this._boxRight.min.z + arrowlength + horizontalSpace);
        length = arrowlength;
        hex = color;
        headLength = 0.3;
        headWidth = 0.3;
        const topArrow = new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
        topArrow.name = 'RightTopArrow';
        this._scene.add(topArrow);
        this._drawedLines.push(topArrow.name);
        //
        arrowlength = Math.abs(this._boxRight.max.z + horizontalSpace + horizontalSpace - this._boxRight.min.z) / 2;
        dir = new THREE.Vector3(0, 0, -1);
        dir.normalize();
        origin = new THREE.Vector3(this._boxRight.min.x - verticalSpace, lineZHeight, this._boxRight.min.z + arrowlength + horizontalSpace);
        length = arrowlength;
        hex = color;
        headLength = 0.3;
        headWidth = 0.3;
        const bottomArrow = new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
        bottomArrow.name = 'RightBottomArrow';
        this._scene.add(bottomArrow);
        this._drawedLines.push(bottomArrow.name);

        // heel line
        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(this._boxRight.max.x - horizontalSpace - verticalLineExtraLength, lineZHeight, this._boxRight.min.z - horizontalSpace),
            new THREE.Vector3(this._boxRight.min.x - horizontalSpace - verticalSpace - verticalLineExtraLength, lineZHeight, this._boxRight.min.z - horizontalSpace),
        );
        geometry.computeLineDistances();
        line = new THREE.Line(geometry, material);
        line.name = 'rightHeel';
        this._scene.add(line);
        this._drawedLines.push(line.name);

        // toe line
        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(this._boxRight.max.x - horizontalSpace - verticalLineExtraLength, lineZHeight, this._boxRight.max.z + horizontalSpace),
            new THREE.Vector3(this._boxRight.min.x - horizontalSpace - verticalSpace - verticalLineExtraLength, lineZHeight, this._boxRight.max.z + horizontalSpace),
        );
        geometry.computeLineDistances();
        line = new THREE.Line(geometry, material);
        line.name = 'rightToe';
        this._scene.add(line);
        this._drawedLines.push(line.name);
    }
    drawWidth(): void {
        this.drawLeftWidth();
        this.drawRightWidth();
    }
    drawLeftWidth(): void {
        const verticalSpace = 1;
        const horizontalSpace = 0;
        const verticalLineExtraLength = 1;
        const lineZHeight = 1.5;
        const color = 0x9a9a9a;
        const material = new THREE.LineDashedMaterial({
            color: color, dashSize: .3, gapSize: .3, linewidth: 1
        });
        let line, geometry;
        let arrowlength, dir, origin, length, hex, headLength, headWidth;

        // horizontal line arrow
        arrowlength = Math.abs(this._boxLeft.max.x + horizontalSpace + horizontalSpace - this._boxLeft.min.x) / 2;
        dir = new THREE.Vector3(1, 0, 0);
        dir.normalize();
        origin = new THREE.Vector3(this._boxLeft.min.x + arrowlength + horizontalSpace, lineZHeight, this._boxLeft.max.z);
        length = arrowlength;
        hex = color;
        headLength = 0.3;
        headWidth = 0.3;
        const topArrow = new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
        topArrow.name = 'LeftToeLeftArrow';
        this._scene.add(topArrow);
        this._drawedLines.push(topArrow.name);

        arrowlength = Math.abs(this._boxLeft.max.x + horizontalSpace + horizontalSpace - this._boxLeft.min.x) / 2;
        dir = new THREE.Vector3(-1, 0, 0);
        dir.normalize();
        origin = new THREE.Vector3(this._boxLeft.min.x + arrowlength + horizontalSpace, lineZHeight, this._boxLeft.max.z);
        length = arrowlength;
        hex = color;
        headLength = 0.3;
        headWidth = 0.3;
        const bottomArrow = new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
        bottomArrow.name = 'LeftToeRightArrow';
        this._scene.add(bottomArrow);
        this._drawedLines.push(bottomArrow.name);
        //
        // right line
        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(this._boxLeft.max.x - horizontalSpace, lineZHeight, this._boxLeft.max.z + horizontalSpace + verticalSpace + verticalLineExtraLength),
            new THREE.Vector3(this._boxLeft.max.x - horizontalSpace, lineZHeight, this._boxLeft.min.z + (this._boxLeft.max.z - this._boxLeft.min.z) / 2 + horizontalSpace + verticalLineExtraLength),
        );
        geometry.computeLineDistances();
        line = new THREE.Line(geometry, material);
        line.name = 'rightLine';
        this._scene.add(line);
        this._drawedLines.push(line.name);
        //
        // left line
        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(this._boxLeft.min.x - horizontalSpace, lineZHeight, this._boxLeft.max.z + horizontalSpace + verticalSpace + verticalLineExtraLength),
            new THREE.Vector3(this._boxLeft.min.x - horizontalSpace, lineZHeight, this._boxLeft.min.z + (this._boxLeft.max.z - this._boxLeft.min.z) / 2 + horizontalSpace + verticalLineExtraLength),
        );
        geometry.computeLineDistances();
        line = new THREE.Line(geometry, material);
        line.name = 'leftLine';
        this._scene.add(line);
        this._drawedLines.push(line.name);
    }
    drawRightWidth(): void {
        const verticalSpace = 1;
        const horizontalSpace = 0;
        const verticalLineExtraLength = 1;
        const lineZHeight = 1.5;
        const color = 0x9a9a9a;

        const material = new THREE.LineDashedMaterial({
            color: color, dashSize: .3, gapSize: .3, linewidth: 1
        });
        let line, geometry;
        let arrowlength, dir, origin, length, hex, headLength, headWidth;
        // horizontal line arrow
        arrowlength = Math.abs(this._boxRight.max.x + horizontalSpace + horizontalSpace - this._boxRight.min.x) / 2;
        dir = new THREE.Vector3(1, 0, 0);
        dir.normalize();
        origin = new THREE.Vector3(this._boxRight.min.x + arrowlength + horizontalSpace, lineZHeight, this._boxRight.max.z);
        length = arrowlength;
        hex = color;
        headLength = 0.3;
        headWidth = 0.3;
        const topArrow = new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
        topArrow.name = 'RightToeLeftArrow';
        this._scene.add(topArrow);
        this._drawedLines.push(topArrow.name);
        //
        arrowlength = Math.abs(this._boxRight.max.x + horizontalSpace + horizontalSpace - this._boxRight.min.x) / 2;
        dir = new THREE.Vector3(-1, 0, 0);
        dir.normalize();
        origin = new THREE.Vector3(this._boxRight.min.x + arrowlength + horizontalSpace, lineZHeight, this._boxRight.max.z);
        length = arrowlength;
        hex = color;
        headLength = 0.3;
        headWidth = 0.3;
        const bottomArrow = new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
        bottomArrow.name = 'RightToeRightArrow';
        this._scene.add(bottomArrow);
        this._drawedLines.push(bottomArrow.name);

        // right line
        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(this._boxRight.max.x - horizontalSpace, lineZHeight, this._boxRight.max.z + horizontalSpace + verticalSpace + verticalLineExtraLength),
            new THREE.Vector3(this._boxRight.max.x - horizontalSpace, lineZHeight, this._boxRight.min.z + (this._boxRight.max.z - this._boxRight.min.z) / 2 + horizontalSpace + verticalLineExtraLength),
        );
        geometry.computeLineDistances();
        line = new THREE.Line(geometry, material);
        line.name = 'rightLine';
        this._scene.add(line);
        this._drawedLines.push(line.name);
        //
        // left line
        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(this._boxRight.min.x - horizontalSpace, lineZHeight, this._boxRight.max.z + horizontalSpace + verticalSpace + verticalLineExtraLength),
            new THREE.Vector3(this._boxRight.min.x - horizontalSpace, lineZHeight, this._boxRight.min.z + (this._boxRight.max.z - this._boxRight.min.z) / 2 + horizontalSpace + verticalLineExtraLength),
        );
        geometry.computeLineDistances();
        line = new THREE.Line(geometry, material);
        line.name = 'leftLine';
        this._scene.add(line);
        this._drawedLines.push(line.name);
    }
    render(): void {
        this._shadowRenderer.renderShadow();
        this._renderer.render(this._scene, this._camera);
    }
    scaleLeftFoot(vertices: any, newLeftFootLength: any, newLeftFootWidth: any): any {
        const centerOfMass = this.getCenterOfMass(vertices);
        // let normals = l_foot.geometry.attributes.normal.array;

        vertices = this.TranslateVertices(vertices, centerOfMass, true, true);

        const currFootLength = this._currentLength; // document.getElementById("currentLength").value;
        const currFootWidth = this._currentWidth; // document.getElementById("currentWidth").value;

        const footRatioLength = newLeftFootLength / currFootLength;
        const footRatioWidth = newLeftFootWidth / currFootWidth;

        vertices = this.DoFootRatio(vertices, footRatioLength, footRatioWidth);
        vertices = this.TranslateVertices(vertices, centerOfMass, false, true);

        // let selectedObject1 = scene.getObjectByName("l_foot");
        // scene.remove(selectedObject1);
        // l_foot.geometry.attributes.position.array = vertices;
        // l_foot.geometry.attributes.position.needsUpdate = true;
        // scene.add(l_foot);
        return vertices;
    }

    scaleRightFoot(vertices: any, newRightFootLength: any, newRightFootWidth: any): any {
        const centerOfMass = this.getCenterOfMass(vertices);

        vertices = this.TranslateVertices(vertices, centerOfMass, true, false);

        const currFootLength = this._currentLength; // document.getElementById("currentLength").value;
        const currFootWidth = this._currentWidth; // document.getElementById("currentWidth").value;

        const footRatioLength = newRightFootLength / currFootLength;
        const footRatioWidth = newRightFootWidth / currFootWidth;

        vertices = this.DoFootRatio(vertices, footRatioLength, footRatioWidth);
        vertices = this.TranslateVertices(vertices, centerOfMass, false, false);

        // let selectedObject2 = scene.getObjectByName("r_foot");
        // scene.remove(selectedObject2);
        // r_foot.geometry.attributes.position.array = vertices;
        // r_foot.geometry.attributes.position.needsUpdate = true;
        // scene.add(r_foot);
        return vertices;
    }
    DoFootRatio(vertices: any, lengthratio: any, widthratio: any): any {
        const length = vertices.length;

        let min_height_before = 9999;
        let min_height = 9999;
        let max_height = 0;
        for (let i = 0; i < length; i += 3) {
            if (min_height_before > vertices[i + 1]) {
                min_height_before = vertices[i + 1];
            }
            vertices[i + 2] = vertices[i + 2] * lengthratio; // z
            vertices[i] = vertices[i] * widthratio; // x
            vertices[i + 1] = vertices[i + 1] * this._selectedRatioForHeight; // this is the height of the foot - I use the length ratio also.

            if (max_height < vertices[i + 1]) {
                max_height = vertices[i + 1];
            }
            if (min_height > vertices[i + 1]) {
                min_height = vertices[i + 1];
            }
        }

        const diff = min_height - min_height_before;
        for (let i = 0; i < length; i += 3) {
            vertices[i + 1] = vertices[i + 1] - diff;
        }


        return (vertices);
    }
    TranslateVertices(vertices: any, centerOfMass: any, toCenter: any, leftfoot: any): any {
        const length = vertices.length;

        let min_x = 9999;
        let max_x = 0;
        for (let i = 0; i < length; i += 3) {
            if (toCenter) {
                vertices[i] = vertices[i] - centerOfMass[0];
                vertices[i + 1] = vertices[i + 1] - centerOfMass[1];
                vertices[i + 2] = vertices[i + 2] - centerOfMass[2];
            } else {
                vertices[i] = vertices[i] + centerOfMass[0];
                vertices[i + 1] = vertices[i + 1] + centerOfMass[1];
                vertices[i + 2] = vertices[i + 2] + centerOfMass[2];

                if (max_x < vertices[i]) {
                    max_x = vertices[i];
                }
                if (min_x > vertices[i]) {
                    min_x = vertices[i];
                }
            }
        }
        if (!toCenter) {
            let offsetx;
            if (leftfoot) { // left foot
                const min_x_left = this._boxLeftBeforeScale.min.x;
                offsetx = min_x_left - min_x + 1;

                for (let i = 0; i < length; i += 3) {
                    vertices[i] = vertices[i] + offsetx;
                }
            } else { // right foot
                const min_x_right = this._boxRightBeforeScale.min.x;
                offsetx = min_x_right - min_x + 1;

                for (let i = 0; i < length; i += 3) {
                    vertices[i] = vertices[i] - offsetx;
                }
            }
        }

        return (vertices);
    }

    getCenterOfMass(vertices: any): any {
        const length = vertices.length;
        let sumX = 0;
        let sumY = 0;
        let sumZ = 0;
        for (let i = 0; i < length; i += 3) {
            sumX += vertices[i];
            sumY += vertices[i + 1];
            sumZ += vertices[i + 2];
        }

        const xCenter = sumX / (length / 3);
        const yCenter = sumY / (length / 3);
        const zCenter = sumZ / (length / 3);

        return [xCenter, yCenter, zCenter];
    }

    drawDorsal(): void {
        this.drawLeftDorsalHeight();
        this.drawRightDorsalHeight();
    }
    drawLeftDorsalHeight(): void {
        const color = 0x9a9a9a;
        const space = 1;
        const arrowSpace = 0;
        const arrowExtraLength = 0;
        const materialLineWidth = new THREE.LineDashedMaterial({
            color: color, dashSize: .3, gapSize: .3, linewidth: 1
        });
        // Dorsal arrow

        const dorsalPointZ = this._boxLeft.min.z + (this._boxLeft.max.z - this._boxLeft.min.z) / 2;
        const dorsalArrowlength = this._LeftLengthWidthDorsal;
        const dorsalDir = new THREE.Vector3(0, 1, 0);
        dorsalDir.normalize();
        const dorsalOrigin = new THREE.Vector3(this._boxLeft.min.x - arrowSpace, -arrowExtraLength, dorsalPointZ);
        const dorsalHexColor = color;
        const dorsalHeadLength = 0.3;
        const dorsalHeadWidth = 0.3;
        const dorsalArrowHelper = new THREE.ArrowHelper(dorsalDir, dorsalOrigin, dorsalArrowlength + arrowExtraLength, dorsalHexColor, dorsalHeadLength, dorsalHeadWidth);
        dorsalArrowHelper.name = 'LeftDorsalArrow';
        this._scene.add(dorsalArrowHelper);
        this._drawedLines.push(dorsalArrowHelper.name);

        // Bottom line
        const geometryLineWidthBottom = new THREE.Geometry();
        geometryLineWidthBottom.vertices.push(
            new THREE.Vector3(this._boxLeft.max.x, -arrowExtraLength, dorsalPointZ),
            new THREE.Vector3(this._boxLeft.min.x - space, -arrowExtraLength, dorsalPointZ)
        );
        geometryLineWidthBottom.computeLineDistances();
        const lineWidthBottom = new THREE.Line(geometryLineWidthBottom, materialLineWidth);
        lineWidthBottom.name = 'WidthLineLeftBottomForDorsal';
        this._scene.add(lineWidthBottom);
        this._drawedLines.push(lineWidthBottom.name);
        // Top line
        const geometryLineWidthTop = new THREE.Geometry();
        geometryLineWidthTop.vertices.push(
            new THREE.Vector3(this._boxLeft.max.x, 0.1 + dorsalArrowlength, dorsalPointZ),
            new THREE.Vector3(this._boxLeft.min.x - space, 0.1 + dorsalArrowlength, dorsalPointZ)
        );
        geometryLineWidthTop.computeLineDistances();
        const lineWidthTop = new THREE.Line(geometryLineWidthTop, materialLineWidth);
        lineWidthTop.name = 'WidthLineLeftTopForDorsal';
        this._scene.add(lineWidthTop);
        this._drawedLines.push(lineWidthTop.name);
    }

    drawRightDorsalHeight(): void {
        const color = 0x9a9a9a;
        const space = 1;
        const arrowSpace = 0;
        const arrowExtraLength = 0;
        const materialLineWidth = new THREE.LineDashedMaterial({
            color: color, dashSize: .3, gapSize: .3, linewidth: 1
        });
        // Dorsal arrow

        const dorsalPointZ = this._boxRight.min.z + (this._boxRight.max.z - this._boxRight.min.z) / 2;
        const dorsalArrowlength = this._RightLengthWidthDorsal;
        const dorsalDir = new THREE.Vector3(0, 1, 0);
        dorsalDir.normalize();
        const dorsalOrigin = new THREE.Vector3(this._boxRight.min.x - arrowSpace, -arrowExtraLength, dorsalPointZ);
        const dorsalHexColor = color;
        const dorsalHeadLength = 0.3;
        const dorsalHeadWidth = 0.3;
        const dorsalArrowHelper = new THREE.ArrowHelper(dorsalDir, dorsalOrigin, dorsalArrowlength + arrowExtraLength, dorsalHexColor, dorsalHeadLength, dorsalHeadWidth);
        dorsalArrowHelper.name = 'RightDorsalArrow';
        this._scene.add(dorsalArrowHelper);
        this._drawedLines.push(dorsalArrowHelper.name);

        // Bottom line
        const geometryLineWidthBottom = new THREE.Geometry();
        geometryLineWidthBottom.vertices.push(
            new THREE.Vector3(this._boxRight.min.x, -arrowExtraLength, dorsalPointZ),
            new THREE.Vector3(this._boxRight.max.x + space, -arrowExtraLength, dorsalPointZ)
        );
        geometryLineWidthBottom.computeLineDistances();
        const lineWidthBottom = new THREE.Line(geometryLineWidthBottom, materialLineWidth);
        lineWidthBottom.name = 'WidthLineRightBottomForDorsal';
        this._scene.add(lineWidthBottom);
        this._drawedLines.push(lineWidthBottom.name);
        // Top line
        const geometryLineWidthTop = new THREE.Geometry();
        geometryLineWidthTop.vertices.push(
            new THREE.Vector3(this._boxRight.min.x, 0.1 + dorsalArrowlength, dorsalPointZ),
            new THREE.Vector3(this._boxRight.max.x + space, 0.1 + dorsalArrowlength, dorsalPointZ)
        );
        geometryLineWidthTop.computeLineDistances();
        const lineWidthTop = new THREE.Line(geometryLineWidthTop, materialLineWidth);
        lineWidthTop.name = 'WidthLineRightTopForDorsal';
        this._scene.add(lineWidthTop);
        this._drawedLines.push(lineWidthTop.name);
    }

    GetLengthWidthDorsal(vertices: any): any {
        const length = vertices.length;
        let min_height = 9999;
        let max_height = 0;
        let min_length = 9999;
        let max_length = 0;
        let min_width = 9999;
        let max_width = 0;
        for (let i = 0; i < length; i += 3) {
            // Length
            if (max_length < vertices[i + 2]) {
                max_length = vertices[i + 2];
            }
            if (min_length > vertices[i + 2]) {
                min_length = vertices[i + 2];
            }

            // width
            if (max_width < vertices[i]) {
                max_width = vertices[i];
            }
            if (min_width > vertices[i]) {
                min_width = vertices[i];
            }
        }

        // get dorsal
        const middleLength = min_length + ((max_length - min_length) / 2);
        for (let i = 0; i < length; i += 3) {
            if (vertices[i + 2] - 0.1 <= middleLength && middleLength <= vertices[i + 2] + 0.1) {
                // Height
                if (max_height < vertices[i + 1]) {
                    max_height = vertices[i + 1];
                }
                if (min_height > vertices[i + 1]) {
                    min_height = vertices[i + 1];
                }
            }
        }
        // let lengthpx = Math.abs(max_length - min_length);
        // let widthpx = Math.abs(max_width - min_width);
        // let dorsalpx = Math.abs(max_height - min_height);
        const dorsalPeakpx = max_height;
        // return [lengthpx, widthpx, dorsalpx, dorsalPeakpx];
        return dorsalPeakpx;
    }

    drawArch() {
        this.drawArchLeft(this.LeftArch);
        this.drawArchRight(this.RightArch);
    }

    drawArchLeft(archType: string): void {

        let arrowLocation;
        let arrowHeight;

        switch (archType) {
            case 'Flat':
                arrowLocation = -4;
                arrowHeight = 0.5;
                break;

            case 'Low':
                arrowLocation = -4;
                arrowHeight = 0.8;
                break;

            case 'Medium':
                arrowLocation = -4;
                arrowHeight = 1.3;
                break;

            case 'High':
                arrowLocation = -4;
                arrowHeight = 1.5;
                break;
            default:
                arrowLocation = -4;
                arrowHeight = 1.3;
        }

        // find new location after scaling;
        const distanceFromBegeningOnModel = arrowLocation - this._boxLeftBeforeScale.min.z;
        const percentArchLocationOnModel = (100 * distanceFromBegeningOnModel) / Math.abs(this._boxLeftBeforeScale.max.z - this._boxLeftBeforeScale.min.z);
        arrowLocation = this._boxLeft.min.z + (Math.abs(this._boxLeft.max.z - this._boxLeft.min.z) * percentArchLocationOnModel) / 100;

        // new height ratio
        const heightBefore = Math.abs(this._boxLeftBeforeScale.max.y - this._boxLeftBeforeScale.min.y);
        const heightAfter = Math.abs(this._boxLeft.max.y - this._boxLeft.min.y);
        const heightRatio = heightAfter / heightBefore;
        arrowHeight = arrowHeight * heightRatio;

        const color = 0x9a9a9a;
        const space = 1;

        const materialLineWidth = new THREE.LineDashedMaterial({
            color: color, dashSize: .3, gapSize: .3, linewidth: 1
        });

        // arch arrow
        // const lengthWidtharch = GetLengthWidtharch(vertices);
        const archPointZ = this._boxLeftBeforeScale.min.z + (this._boxLeftBeforeScale.max.z - this._boxLeftBeforeScale.min.z) / 2;
        const archArrowlength = arrowHeight; // lengthWidtharch[3]; // Math.abs(boxLeft.max.z - boxLeft.min.z + space + space);

        const archDir = new THREE.Vector3(0, 1, 0);
        archDir.normalize();
        const archOrigin = new THREE.Vector3(this._boxLeftBeforeScale.min.x + space, 0, arrowLocation);

        const archHexColor = color;
        const archHeadLength = 0.3;
        const archHeadWidth = 0.3;
        const archArrowHelper = new THREE.ArrowHelper(archDir, archOrigin, archArrowlength, archHexColor, archHeadLength, archHeadWidth);
        archArrowHelper.name = 'ArchLeftArrow';
        this._scene.add(archArrowHelper);
        this._drawedLines.push(archArrowHelper.name);

        // Bottom line
        const geometryLineWidthBottom = new THREE.Geometry();
        geometryLineWidthBottom.vertices.push(
            new THREE.Vector3(this._boxLeftBeforeScale.min.x, 0.1, arrowLocation),
            new THREE.Vector3(this._boxLeftBeforeScale.max.x + space, 0.1, arrowLocation)
        );

        geometryLineWidthBottom.computeLineDistances();

        const lineWidthBottom = new THREE.Line(geometryLineWidthBottom, materialLineWidth);
        lineWidthBottom.name = 'WidthLineLeftBottomForArch';
        this._scene.add(lineWidthBottom);
        this._drawedLines.push(lineWidthBottom.name);

        // Top line
        const geometryLineWidthTop = new THREE.Geometry();
        geometryLineWidthTop.vertices.push(
            new THREE.Vector3(this._boxLeftBeforeScale.min.x, 0.1 + archArrowlength, arrowLocation),
            new THREE.Vector3(this._boxLeftBeforeScale.min.x + (this._boxLeftBeforeScale.max.x - this._boxLeftBeforeScale.min.x) / 2, 0.1 + archArrowlength, arrowLocation)
        );

        geometryLineWidthTop.computeLineDistances();

        const lineWidthTop = new THREE.Line(geometryLineWidthTop, materialLineWidth);
        lineWidthTop.name = 'WidthLineLeftTopForArch';
        this._scene.add(lineWidthTop);
        this._drawedLines.push(lineWidthTop.name);
    }

    drawArchRight(archType: string): void {
        let arrowLocation;
        let arrowHeight;

        switch (archType) {
            case 'Flat':
                arrowLocation = -4;
                arrowHeight = 0.5;
                break;

            case 'Low':
                arrowLocation = -4;
                arrowHeight = 0.8;
                break;

            case 'Medium':
                arrowLocation = -4;
                arrowHeight = 1.3;
                break;

            case 'High':
                arrowLocation = -4;
                arrowHeight = 1.5;
                break;
            default:
                arrowLocation = -4;
                arrowHeight = 1.3;
        }

        // find new location after scaling;
        const distanceFromBegeningOnModel = arrowLocation - this._boxRightBeforeScale.min.z;
        const percentArchLocationOnModel = (100 * distanceFromBegeningOnModel) / Math.abs(this._boxRightBeforeScale.max.z - this._boxRightBeforeScale.min.z);
        arrowLocation = this._boxRight.min.z + (Math.abs(this._boxRight.max.z - this._boxRight.min.z) * percentArchLocationOnModel) / 100;

        // new height ratio
        const heightBefore = Math.abs(this._boxRightBeforeScale.max.y - this._boxRightBeforeScale.min.y);
        const heightAfter = Math.abs(this._boxRight.max.y - this._boxRight.min.y);
        const heightRatio = heightAfter / heightBefore;
        arrowHeight = arrowHeight * heightRatio;

        const color = 0x9a9a9a;
        const space = 1;

        const materialLineWidth = new THREE.LineDashedMaterial({
            color: color, dashSize: .3, gapSize: .3, linewidth: 1
        });

        // Arch arrow
        // const lengthWidthDorsal = GetLengthWidthDorsal(vertices);
        const archPointZ = this._boxRightBeforeScale.min.z + (this._boxRightBeforeScale.max.z - this._boxRightBeforeScale.min.z) / 2;
        const archArrowlength = arrowHeight; // lengthWidthDorsal[3]; // Math.abs(boxLeft.max.z - boxLeft.min.z + space + space);

        const archDir = new THREE.Vector3(0, 1, 0);
        archDir.normalize();
        const archOrigin = new THREE.Vector3(this._boxRightBeforeScale.max.x - space, 0, arrowLocation);

        const archHexColor = color;
        const archHeadLength = 0.3;
        const archHeadWidth = 0.3;
        const archArrowHelper = new THREE.ArrowHelper(archDir, archOrigin, archArrowlength, archHexColor, archHeadLength, archHeadWidth);
        archArrowHelper.name = 'ArchRightArrow';
        this._scene.add(archArrowHelper);
        this._drawedLines.push(archArrowHelper.name);

        // Bottom line
        const geometryLineWidthBottom = new THREE.Geometry();
        geometryLineWidthBottom.vertices.push(
            new THREE.Vector3(this._boxRightBeforeScale.max.x, 0.1, arrowLocation),
            new THREE.Vector3(this._boxRightBeforeScale.min.x - space, 0.1, arrowLocation)
        );

        geometryLineWidthBottom.computeLineDistances();

        const lineWidthBottom = new THREE.Line(geometryLineWidthBottom, materialLineWidth);
        lineWidthBottom.name = 'WidthLineRightBottomForArch';
        this._scene.add(lineWidthBottom);
        this._drawedLines.push(lineWidthBottom.name);

        // Top line
        const geometryLineWidthTop = new THREE.Geometry();
        geometryLineWidthTop.vertices.push(
            new THREE.Vector3(this._boxRightBeforeScale.max.x, 0.1 + archArrowlength, arrowLocation),
            new THREE.Vector3(this._boxRightBeforeScale.min.x + (this._boxRightBeforeScale.max.x - this._boxRightBeforeScale.min.x) / 2, 0.1 + archArrowlength, arrowLocation)
        );

        geometryLineWidthTop.computeLineDistances();

        const lineWidthTop = new THREE.Line(geometryLineWidthTop, materialLineWidth);
        lineWidthTop.name = 'WidthLineRightTopForArch';
        this._scene.add(lineWidthTop);
        this._drawedLines.push(lineWidthTop.name);
    }

    tween = null;
    animations = {
        appearingAnimation: {
            durationSec: 4,
            from: { x: 0.2 },
            to: { x: 15 }, // @@ adjust to foot height
            start: (delay) => {
                if (!delay) {
                    delay = 0;
                }
                var i = this.animations.appearingAnimation.from;
                this.tween = new TWEEN.Tween(i)
                    .to(this.animations.appearingAnimation.to, this.animations.appearingAnimation.durationSec * 1000)
                    .onUpdate((t) => {
                        if (this.threeDService.getMaterials().footMaterial) {
                            this.threeDService.getMaterials().materialClipPlane.constant = i.x;
                        }
                        this.threeDService.getMaterials().wireMaterial.opacity = t;
                        this._shadowRenderer.plane.material.opacity = Math.pow(t, 2);
                        // this.footService.fbxPbject.gridMaterial.opacity = t * 0.5;
                        this.threeDService.getMaterials().footMaterial.opacity = t * 6;
                    }).easing(TWEEN.Easing.Quadratic.InOut);
                this.tween.update();
                this.tween.delay(delay).start();
            },
            stop: () => {
                if (!this.tween)
                    return;
                this.tween.stop();
                this.tween = null;
            }
        },
        flyAroundAnimation: {
            durationSec: 3.5,
            // to: {radius: 103.78770004111516, phi: 0.9525773185637397, theta: -0.48251790586736154},
            to: { radius: 101.41815806148391, phi: 0.8879862278968219, theta: 0.5599207383332273 },
            start: (delay) => {
                if (!delay) {
                    delay = 0;
                }
                if (!this._camera) {
                    return;
                }
                var camPos = this._camera.position;
                var i = new THREE.Spherical(0, 0, 0)
                    .setFromCartesianCoords(camPos.x, camPos.y, camPos.z);
                this.tween = new TWEEN.Tween(i)
                    .to(this.animations.flyAroundAnimation.to, this.animations.flyAroundAnimation.durationSec * 1000)
                    .onUpdate((t) => {
                        var pt = new THREE.Vector3(0, 0, 0).setFromSpherical(i);
                        if (this._camera) {
                            this._camera.position.set(pt.x, pt.y, pt.z);
                            this._camera.lookAt(this._scene.position);
                        }
                    })
                    .onComplete(() => {

                    })
                    .easing(TWEEN.Easing.Quadratic.InOut);
                this.tween.update();
                this.tween.delay(delay).start();
            },
            stop: () => {
                if (!this.tween)
                    return;
                this.tween.stop();
                this.tween = null;
            }
        },
        rotateAnimation: {
            durationSec: .5,
            start: (delay, to) => {
                // window.requestAnimationFrame(this.animations.rotateAnimation.start(delay, to));
                if (!delay) {
                    delay = 0;
                }
                this._controls.enabled = false;
                var camPos = this._camera.position;
                var i = new THREE.Spherical(0, 0, 0)
                    .setFromCartesianCoords(camPos.x, camPos.y, camPos.z);
                this.tween = new TWEEN.Tween(i)
                    .to(to, this.animations.rotateAnimation.durationSec * 1000)
                    .onUpdate((t) => {
                        var pt = new THREE.Vector3(0, 0, 0).setFromSpherical(i);
                        this._camera.position.set(pt.x, pt.y, pt.z);
                        this._camera.lookAt(this._scene.position);
                    })
                    .onComplete(() => {

                        this._controls.enabled = true;
                    })
                    .easing(TWEEN.Easing.Quadratic.InOut);
                this.tween.update();
                this.tween.delay(delay).start();
            },
            stop: () => {
                if (!this.tween)
                    return;
                this.tween.stop();
            }
        },
        arrowAnimation2: {
            //         function animateArrow(length) {
            //     if(length >= arrowLength) {
            //         length = arrowLength;
            //     }
            //     topArrow.setLength(length, this.arrowHeadLength, this.arrowHeadWidth);
            //     length += step;
            //     $timeout(function(){
            //         animateArrow(length);
            //     })
            // }
        },
        arrowLengthAnimation: {
            durationSec: 1,
            start: (delay, arrow, from, to, arrowHeadLength, arrowHeadWidth) => {
                if (!delay) {
                    delay = 0;
                }
                this.tween = new TWEEN.Tween(from)
                    .to(to, this.animations.arrowLengthAnimation.durationSec * 1000)
                    .onUpdate((percentage) => {
                        if (!percentage) {
                            percentage = 1;
                        }
                        arrow.setLength(arrowHeadLength + ((to - arrowHeadLength) * percentage), arrowHeadLength, arrowHeadWidth);
                    })
                    .onComplete(() => { })
                    .easing(TWEEN.Easing.Quadratic.InOut);
                this.tween.update();
                this.tween.delay(delay).start();
            },
            stop: () => {
                if (!this.tween)
                    return;
                this.tween.stop();
            }
        },
        lineAnimation: {
            durationSec: 1,
            start: (delay, line, from, to) => {
                if (!delay) {
                    delay = 0;
                }



                this.tween = new TWEEN.Tween(from)
                    .to(to, this.animations.lineAnimation.durationSec * 1000)
                    .onUpdate((percentage) => {
                        if (!percentage) {
                            percentage = 1;
                        }
                        var obj = [to.x * percentage, to.y * percentage, to.z * percentage];

                        line.geometry.vertices.push(new THREE.Vector3(to.x * percentage, to.y, to.z));
                        // line.geometry.vertices[ 1 ].set( to.x * percentage, to.y * percentage, to.z * percentage );
                        line.geometry.verticesNeedUpdate = true;
                    })
                    .onComplete(() => { })
                    .easing(TWEEN.Easing.Quadratic.InOut);
                this.tween.update();
                this.tween.delay(delay).start();
            },
            stop: () => {
                if (!this.tween)
                    return;
                this.tween.stop();
            }
        },
        lineAnimation2: {
            durationSec: 1,
            start: (delay, line, from, to, type, animatePosition) => {
                if (!delay) {
                    delay = 0;
                }

                var posX = line.position.x;
                var posY = line.position.y;
                var posZ = line.position.z;
                var lengthX = from.x + (to.x - from.x) / 2;
                var lengthY = from.y + (to.y - from.y) / 2;
                var lengthZ = from.z + (to.z - from.z) / 2;
                this.tween = new TWEEN.Tween(from)
                    .to(to, this.animations.lineAnimation2.durationSec * 1000)
                    .onUpdate(function (percentage) {
                        if (!percentage) {
                            percentage = 1;
                        }
                        var obj = [to.x * percentage, to.y * percentage, to.z * percentage];

                        // line.geometry.maxInstancedCount = 1*percentage;
                        // line.geometry.maxInstancedCount = 0.5;
                        // line.geometry.vertices.push(new THREE.Vector3(  to.x * percentage, to.y, to.z)) ;
                        // line.geometry.vertices[ 1 ].set( to.x * percentage, to.y * percentage, to.z * percentage );
                        if (type === 'x') {
                            line.scale.set(1 * percentage, 1, 1);
                            // if(animatePosition) {
                            line.position.set(lengthX - lengthX * percentage, 0, 0);
                            // }
                        }
                        if (type === 'y') {
                            line.scale.set(1, 1 * percentage, 1);
                            // if(animatePosition) {
                            line.position.set(0, lengthY - lengthY * percentage, 0);
                            // }
                        }
                        if (type === 'z') {
                            line.scale.set(1, 1, 1 * percentage);
                            // if(animatePosition) {
                            line.position.set(0, 0, lengthZ - lengthZ * percentage);
                            // }
                        }
                        line.geometry.verticesNeedUpdate = true;
                    })
                    .onComplete(() => { })
                    .easing(TWEEN.Easing.Quadratic.InOut);
                this.tween.update();
                this.tween.delay(delay).start();
            },
            stop: () => {
                if (!this.tween)
                    return;
                this.tween.stop();
            }
        },
        fadeAnimation: {
            durationSec: 1,
            start: (delay, object, from, to, callback) => {
                if (!delay) {
                    delay = 0;
                }

                this._shadowRenderer.plane.material.opacity = Math.pow(5, 2);
                this.tween = new TWEEN.Tween(from)
                    .to(to, this.animations.fadeAnimation.durationSec * 1000)
                    .onUpdate(function (percentage) {
                        if (!percentage) {
                            percentage = 1;
                        }
                        if (to > from) {
                            for (var i in object.children) {
                                object.children[i].material.opacity = to * percentage;
                            }
                            // object.scale.set(to * percentage, to * percentage, to * percentage);
                        } else {
                            for (var i in object.children) {
                                object.children[i].material.opacity = from - ((from - to) * percentage);
                            }
                            // object.scale.set(from - ((from - to) * percentage), from - ((from - to) * percentage), from - ((from - to) * percentage));
                        }
                    })
                    .onComplete(() => {
                        callback();
                    })
                    .easing(TWEEN.Easing.Quadratic.InOut);
                this.tween.update();
                this.tween.delay(delay).start();
            },
            stop: () => {
                if (!this.tween)
                    return;
                this.tween.stop();
            }
        },
    }


    drawLineToesAlbert2(foot) {
        var lineStart = { x: this['box' + foot].min.x + this.arrowHeadLength, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        var lineEnd = { x: this['box' + foot].max.x - this.arrowHeadLength, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        var from = new THREE.Vector3(lineStart.x, lineStart.y - (this.dashedPadding / 2), lineStart.z);
        var to = new THREE.Vector3(lineEnd.x, lineEnd.y - (this.dashedPadding / 2), lineEnd.z);
        this.drawLineFromToAlbert2(from, to, false);
    }
    drawLineSideOutAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['box' + foot].max.x, y: this['box' + foot].min.y + this.arrowHeadLength, z: this['box' + foot].min.z };
            lineEnd = { x: this['box' + foot].max.x, y: this['box' + foot].max.y - this.arrowHeadLength, z: this['box' + foot].min.z };
            from = new THREE.Vector3(lineStart.x + this.dashedPadding / 2, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding / 2, lineEnd.y, lineEnd.z);
        } else {
            lineStart = { x: this['box' + foot].min.x, y: this['box' + foot].min.y + this.arrowHeadLength, z: this['box' + foot].min.z };
            lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].max.y - this.arrowHeadLength, z: this['box' + foot].min.z };
            from = new THREE.Vector3(lineStart.x - this.dashedPadding / 2, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding / 2, lineEnd.y, lineEnd.z);
        }

        this.drawLineFromToAlbert2(from, to, false);
    }
    drawLineSideInAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['box' + foot].min.x, y: this['box' + foot].min.y + this.arrowHeadLength, z: this['box' + foot].min.z };
            lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].max.y - this.arrowHeadLength, z: this['box' + foot].min.z };
            from = new THREE.Vector3(lineStart.x - this.dashedPadding / 2, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding / 2, lineEnd.y, lineEnd.z);
        } else {
            lineStart = { x: this['box' + foot].max.x, y: this['box' + foot].min.y + this.arrowHeadLength, z: this['box' + foot].min.z };
            lineEnd = { x: this['box' + foot].max.x, y: this['box' + foot].max.y - this.arrowHeadLength, z: this['box' + foot].min.z };
            from = new THREE.Vector3(lineStart.x + this.dashedPadding / 2, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding / 2, lineEnd.y, lineEnd.z);
        }
        this.drawLineFromToAlbert2(from, to, false);
    }
    drawLineHeelAlbert2(foot) {
        var lineStart = { x: this['box' + foot].min.x + this.arrowHeadLength, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
        var lineEnd = { x: this['box' + foot].max.x - this.arrowHeadLength, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
        var from = new THREE.Vector3(lineStart.x, lineStart.y + (this.dashedPadding / 2), lineStart.z);
        var to = new THREE.Vector3(lineEnd.x, lineEnd.y + (this.dashedPadding / 2), lineEnd.z);
        this.drawLineFromToAlbert2(from, to, false);
    }
    drawLineVerticalMiddleSideInAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.arrowHeadLength };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z - this.arrowHeadLength };
            from = new THREE.Vector3(lineStart.x - this.dashedPadding / 2, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding / 2, lineEnd.y, lineEnd.z);
        } else {
            lineStart = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.arrowHeadLength };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z - this.arrowHeadLength };
            from = new THREE.Vector3(lineStart.x + this.dashedPadding / 2, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding / 2, lineEnd.y, lineEnd.z);
        }
        this.drawLineFromToAlbert2(from, to, false);
    }
    drawLineVerticalMiddleSideOutAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.arrowHeadLength };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z - this.arrowHeadLength };
            from = new THREE.Vector3(lineStart.x + this.dashedPadding / 2, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding / 2, lineEnd.y, lineEnd.z);
        } else {
            lineStart = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.arrowHeadLength };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z - this.arrowHeadLength };
            from = new THREE.Vector3(lineStart.x - this.dashedPadding / 2, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding / 2, lineEnd.y, lineEnd.z);
        }
        this.drawLineFromToAlbert2(from, to, false);
    }
    drawArrowsOutAlbert2(foot) {
        var lineEnd;
        var origin;
        if (foot === 'Left') {
            lineEnd = { x: this['box' + foot].max.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        } else {
            lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        }
        var arrowLength = (this['box' + foot].max.y - this['box' + foot].min.y) / 2;
        if (foot === 'Left') {
            origin = new THREE.Vector3(lineEnd.x + (this.dashedPadding / 2), lineEnd.y + arrowLength, lineEnd.z);
        } else {
            origin = new THREE.Vector3(lineEnd.x - (this.dashedPadding / 2), lineEnd.y + arrowLength, lineEnd.z);
        }
        var direction = new THREE.Vector3(0, 1, 0).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);

        direction = new THREE.Vector3(0, -1, 0).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);
    }
    drawArrowsInAlbert2(foot) {
        var lineEnd;
        var origin;
        if (foot === 'Left') {
            lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        } else {
            lineEnd = { x: this['box' + foot].max.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        }
        var arrowLength = (this['box' + foot].max.y - this['box' + foot].min.y) / 2;
        if (foot === 'Left') {
            origin = new THREE.Vector3(lineEnd.x - (this.dashedPadding / 2), lineEnd.y + arrowLength, lineEnd.z);
        } else {
            origin = new THREE.Vector3(lineEnd.x + (this.dashedPadding / 2), lineEnd.y + arrowLength, lineEnd.z);
        }
        var direction = new THREE.Vector3(0, 1, 0).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);

        direction = new THREE.Vector3(0, -1, 0).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);
    }
    drawArrowsToesAlbert2(foot) {
        var lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        var arrowLength = (this['box' + foot].max.x - this['box' + foot].min.x) / 2;
        var origin = new THREE.Vector3(lineEnd.x + arrowLength, lineEnd.y - (this.dashedPadding / 2), lineEnd.z);
        var direction = new THREE.Vector3(1, 0, 0).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);

        direction = new THREE.Vector3(-1, 0, 0).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);
    }
    drawArrowsHeelAlbert2(foot) {
        var lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
        var arrowLength = (this['box' + foot].max.x - this['box' + foot].min.x) / 2;
        var origin = new THREE.Vector3(lineEnd.x + arrowLength, lineEnd.y + (this.dashedPadding / 2), lineEnd.z);
        var direction = new THREE.Vector3(1, 0, 0).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);

        direction = new THREE.Vector3(-1, 0, 0).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);
    }
    drawArrowsVerticalMiddleInAlbert2(foot) {
        var lineEnd;
        var origin;
        if (foot === 'Left') {
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
        } else {
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
        }
        var arrowLength = (this['instepBox' + foot].max.z - this['instepBox' + foot].min.z) / 2;
        if (foot === 'Left') {
            origin = new THREE.Vector3(lineEnd.x - (this.dashedPadding / 2), lineEnd.y, lineEnd.z + arrowLength);
        } else {
            origin = new THREE.Vector3(lineEnd.x + (this.dashedPadding / 2), lineEnd.y, lineEnd.z + arrowLength);
        }
        var direction = new THREE.Vector3(0, 0, 1).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);

        direction = new THREE.Vector3(0, 0, -1).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);
    }
    drawArrowsVerticalMiddleOutAlbert2(foot) {
        var lineEnd;
        var origin;
        if (foot === 'Left') {
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
        } else {
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
        }
        var arrowLength = (this['instepBox' + foot].max.z - this['instepBox' + foot].min.z) / 2;
        if (foot === 'Left') {
            origin = new THREE.Vector3(lineEnd.x + (this.dashedPadding / 2), lineEnd.y, lineEnd.z + arrowLength);
        } else {
            origin = new THREE.Vector3(lineEnd.x - (this.dashedPadding / 2), lineEnd.y, lineEnd.z + arrowLength);
        }
        var direction = new THREE.Vector3(0, 0, 1).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);

        direction = new THREE.Vector3(0, 0, -1).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);
    }
    drawArrowsVerticalMiddleArchOutAlbert2(foot) {
        var lineEnd;
        var origin;
        if (foot === 'Left') {
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
        } else {
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
        }
        var arrowLength = (this.archHeight - this['instepBox' + foot].min.z) / 2;
        if (foot === 'Left') {
            origin = new THREE.Vector3(lineEnd.x + (this.dashedPadding / 2), lineEnd.y, lineEnd.z + arrowLength);
        } else {
            origin = new THREE.Vector3(lineEnd.x - (this.dashedPadding / 2), lineEnd.y, lineEnd.z + arrowLength);
        }
        var direction = new THREE.Vector3(0, 0, 1).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);

        direction = new THREE.Vector3(0, 0, -1).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);
    }
    drawArrowsVerticalMiddleArchInAlbert2(foot, moveY) {
        var lineEnd;
        var origin;
        if (!moveY) {
            moveY = 0;
        }
        if (foot === 'Left') {
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y + moveY, z: this['instepBox' + foot].min.z };
        } else {
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y - moveY, z: this['instepBox' + foot].min.z };
        }
        var arrowLength = (this.archHeight - this['instepBox' + foot].min.z) / 2;
        if (foot === 'Left') {
            origin = new THREE.Vector3(lineEnd.x - (this.dashedPadding / 2), lineEnd.y + moveY, lineEnd.z + arrowLength);
        } else {
            origin = new THREE.Vector3(lineEnd.x + (this.dashedPadding / 2), lineEnd.y - moveY, lineEnd.z + arrowLength);
        }
        var direction = new THREE.Vector3(0, 0, 1).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);

        direction = new THREE.Vector3(0, 0, -1).normalize();
        this.drawArrowAlbert2(foot, arrowLength, origin, direction);
    }
    drawDashedToesAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['box' + foot].max.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
            lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
            from = new THREE.Vector3(lineStart.x + this.dashedPadding, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y, lineEnd.z);
        } else {
            lineStart = { x: this['box' + foot].min.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
            lineEnd = { x: this['box' + foot].max.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
            from = new THREE.Vector3(lineStart.x - this.dashedPadding, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y, lineEnd.z);
        }
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedSideOutAlbert2(foot) {
        var lineStart = { x: this['box' + foot].max.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        var lineEnd = { x: this['box' + foot].max.x, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
        var from = new THREE.Vector3(lineStart.x, lineStart.y - this.dashedPadding, lineStart.z);
        var to = new THREE.Vector3(lineEnd.x, lineEnd.y + this.dashedPadding, lineEnd.z);
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedSideOutToToesAlbert2(foot) {
        var lineStart = { x: this['box' + foot].max.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        var lineEnd = { x: this['box' + foot].max.x, y: this['box' + foot].min.y + (this['box' + foot].max.y - this['box' + foot].min.y) / 2, z: this['box' + foot].min.z };
        var from = new THREE.Vector3(lineStart.x, lineStart.y - this.dashedPadding, lineStart.z);
        var to = new THREE.Vector3(lineEnd.x, lineEnd.y + this.dashedPadding, lineEnd.z);
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedSideOutToHeelAlbert2(foot) {
        var lineStart = { x: this['box' + foot].max.x, y: this['box' + foot].max.y - (this['box' + foot].max.y - this['box' + foot].min.y) / 2, z: this['box' + foot].min.z };
        var lineEnd = { x: this['box' + foot].max.x, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
        var from = new THREE.Vector3(lineStart.x, lineStart.y - this.dashedPadding, lineStart.z);
        var to = new THREE.Vector3(lineEnd.x, lineEnd.y + this.dashedPadding, lineEnd.z);
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedSideInAlbert2(foot) {
        var lineStart = { x: this['box' + foot].min.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        var lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
        var from = new THREE.Vector3(lineStart.x, lineStart.y - this.dashedPadding, lineStart.z);
        var to = new THREE.Vector3(lineEnd.x, lineEnd.y + this.dashedPadding, lineEnd.z);
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedSideInToToesAlbert2(foot) {
        var lineStart = { x: this['box' + foot].min.x, y: this['box' + foot].min.y, z: this['box' + foot].min.z };
        var lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].min.y + (this['box' + foot].max.y - this['box' + foot].min.y) / 2, z: this['box' + foot].min.z };
        var from = new THREE.Vector3(lineStart.x, lineStart.y - this.dashedPadding, lineStart.z);
        var to = new THREE.Vector3(lineEnd.x, lineEnd.y + this.dashedPadding, lineEnd.z);
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedSideInToHeelAlbert2(foot) {
        var lineStart = { x: this['box' + foot].min.x, y: this['box' + foot].max.y - (this['box' + foot].max.y - this['box' + foot].min.y) / 2, z: this['box' + foot].min.z };
        var lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
        var from = new THREE.Vector3(lineStart.x, lineStart.y - this.dashedPadding, lineStart.z);
        var to = new THREE.Vector3(lineEnd.x, lineEnd.y + this.dashedPadding, lineEnd.z);
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedHeelAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['box' + foot].max.x, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
            lineEnd = { x: this['box' + foot].min.x, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
            from = new THREE.Vector3(lineStart.x + this.dashedPadding, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y, lineEnd.z);
        } else {
            lineStart = { x: this['box' + foot].min.x, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
            lineEnd = { x: this['box' + foot].max.x, y: this['box' + foot].max.y, z: this['box' + foot].min.z };
            from = new THREE.Vector3(lineStart.x - this.dashedPadding, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y, lineEnd.z);
        }
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedMiddleBottomInAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y, lineEnd.z);

        } else {
            lineStart = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y, lineEnd.z);

        }
        this.drawLineFromToAlbert2(from, to, true, true);
    }
    drawDashedMiddleBottomInHalfAlbert2(foot, moveY) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (!moveY) {
            moveY = 0;
        }
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].max.x / 2, y: this['instepBox' + foot].max.y + moveY, z: this['instepBox' + foot].min.z };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y + moveY, z: this['instepBox' + foot].min.z };
            from = new THREE.Vector3(lineStart.x + this.dashedPadding, lineStart.y + moveY, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y + moveY, lineEnd.z);

        } else {
            lineStart = { x: this['instepBox' + foot].min.x / 2, y: this['instepBox' + foot].max.y - moveY, z: this['instepBox' + foot].min.z };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y - moveY, z: this['instepBox' + foot].min.z };
            from = new THREE.Vector3(lineStart.x - this.dashedPadding, lineStart.y - moveY, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y - moveY, lineEnd.z);

        }
        this.drawLineFromToAlbert2(from, to, true, true);
    }
    drawDashedMiddleTopInAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        var spaceTop = 0.00035;
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z + spaceTop };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z + spaceTop };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y, lineEnd.z);
        } else {
            lineStart = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z + spaceTop };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z + spaceTop };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y, lineEnd.z);
        }
        this.drawLineFromToAlbert2(from, to, true, true);
    }
    drawDashedMiddleTopInHalfAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].max.x / 2, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z };
            from = new THREE.Vector3(lineStart.x + this.dashedPadding, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y, lineEnd.z);

        } else {
            lineStart = { x: this['instepBox' + foot].min.x / 2, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z };
            from = new THREE.Vector3(lineStart.x - this.dashedPadding, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y, lineEnd.z);

        }
        this.drawLineFromToAlbert2(from, to, true, true);
    }
    drawDashedMiddleBottomOut(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y, lineEnd.z);

        } else {
            lineStart = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y, lineEnd.z);

        }
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedMiddleTopOutAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y, lineEnd.z);

        } else {
            lineStart = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].max.z };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y, lineEnd.z);

        }
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedMiddleArchOutAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.archHeight };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.archHeight };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y, lineEnd.z);

        } else {
            lineStart = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.archHeight };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.archHeight };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y, lineEnd.z);

        }
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedMiddleArchInAlbert2(foot) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.archHeight };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.archHeight };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y, lineEnd.z);

        } else {
            lineStart = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.archHeight };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y, z: this['instepBox' + foot].min.z + this.archHeight };
            from = new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y, lineEnd.z);

        }
        this.drawLineFromToAlbert2(from, to, true);
    }
    drawDashedMiddleArchInHalfAlbert2(foot, moveY) {
        var lineStart;
        var lineEnd;
        var from;
        var to;
        if (!moveY) {
            moveY = 0;
        }
        if (foot === 'Left') {
            lineStart = { x: this['instepBox' + foot].max.x / 2, y: this['instepBox' + foot].max.y + moveY, z: this['instepBox' + foot].min.z + this.archHeight };
            lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].max.y + moveY, z: this['instepBox' + foot].min.z + this.archHeight };
            from = new THREE.Vector3(lineStart.x + this.dashedPadding, lineStart.y + moveY, lineStart.z);
            to = new THREE.Vector3(lineEnd.x - this.dashedPadding, lineEnd.y + moveY, lineEnd.z);

        } else {
            lineStart = { x: this['instepBox' + foot].min.x / 2, y: this['instepBox' + foot].max.y - moveY, z: this['instepBox' + foot].min.z + this.archHeight };
            lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].max.y - moveY, z: this['instepBox' + foot].min.z + this.archHeight };
            from = new THREE.Vector3(lineStart.x - this.dashedPadding, lineStart.y - moveY, lineStart.z);
            to = new THREE.Vector3(lineEnd.x + this.dashedPadding, lineEnd.y - moveY, lineEnd.z);

        }
        this.drawLineFromToAlbert2(from, to, true, true);
    }
    drawLineFromToAlbert2(from, to, dashed, arrowInside?, lineWidth?) {
        var points = [];
        points.push(from);
        points.push(to);
        this.drawLineAlbert2(points, dashed, arrowInside, lineWidth);
    }
    once = false;
    drawLineAlbert2(points, dashed, __arrowInside, _lineWidth) {
        var positions = [];
        var colors = [];
        var arrowInside = false;
        if (__arrowInside) {
            arrowInside = true;
        }
        if (_lineWidth) {
            this.lineWidth = _lineWidth;
        }
        var spline = new THREE.CatmullRomCurve3(points);

        var divisions = Math.round(12 * points.length);

        var color = new THREE.Color();

        // for ( var i = 0, l = divisions; i < l; i++ ) {
        //     //

        //     var point = spline.getPoint( i / l );

        //     positions.push( point.x, point.y, point.z );
        //     color.setHex( main_color);
        //     colors.push( color.r, color.g, color.b );
        // }
        positions.push(points[0].x, points[0].y, points[0].z);
        colors.push(color.r, color.g, color.b);
        positions.push(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].z);
        colors.push(color.r, color.g, color.b);



        var geometry = new THREE.LineGeometry();
        geometry.setPositions(positions);
        geometry.setColors(colors);

        var matLine = new THREE.LineMaterial({

            color: this.main_color,
            linewidth: this.lineWidth, // in pixels
            vertexColors: true,
            // dashScale: 2,
            dashSize: this.dashedSize,
            gapSize: this.gapSize,
            //resolution:  // to be set by renderer, eventually
            dashed: true

        });
        if (dashed) {
            matLine.defines.USE_DASH = ""
        }

        var line = new THREE.Line2(geometry, matLine);
        line.computeLineDistances();
        line.name = this.currentThreeDPosition;
        this._drawedLines.push(line.name);
        this.modelGroup.add(line);
        var from = points[0];
        var to = points[1];
        var type;
        var animatePosition = false;
        if (dashed) {
            animatePosition = true;
        }
        if (points[0].x === points[1].x && points[0].y === points[1].y) {
            type = 'z';
            line.scale.set(1, 1, 0.00000001);
            if (dashed) {
                from.z -= from.z;
            }
        }
        else if (points[0].x === points[1].x) {
            type = 'y';
            line.scale.set(1, 0.00000001, 1);
            if (dashed) {
                from.y += from.y - (from.y - to.y) / 2;
            }
        } else if (points[0].y === points[1].y) {
            type = 'x';
            line.scale.set(0.00000001, 1, 1);
            if (dashed) {
                if (!arrowInside) {
                    from.x += from.x;
                } else {
                    from.x -= from.x;
                }
            }
        }
        var delay = 0;
        if (dashed) {


            delay = 750;
            // line.scale.set(1, 1, 1);


            if (!this.once) {
                this.once = true;
                // line.translateOnAxis(new THREE.Vector3(1, 0, 0), points[1].x - points[0].x);
                // line.rotateOnAxis(new THREE.Vector3(0,1,0) , Math.PI)
                // line.up = (new THREE.Vector3( 0, -1, 0));
                // line.geometry.rotateY(Math.PI);
                // line.geometry.translate(0.04,0,0);
            }
        } else {
            this.animations.lineAnimation2.start(delay, line, from, to, type, animatePosition);
        }
        this.animations.lineAnimation2.start(delay, line, from, to, type, animatePosition);
    }
    drawArrowAlbert2(foot, arrowLength, origin, direction) {
        var Arrow = new THREE.ArrowHelper(
            // first argument is the direction
            direction,
            // second argument is the origin
            origin,
            // length
            this.arrowHeadLength + 0.000000001,
            // color
            this.main_color,
            // arrow head length
            this.arrowHeadLength,
            // arrow head width
            this.arrowHeadWidth
        );
        Arrow.name = foot + "Arrow";
        this.modelGroup.add(Arrow);
        this._drawedLines.push(Arrow.name);
        this.animations.arrowLengthAnimation.start(0, Arrow, this.arrowHeadLength + 0.000000001, arrowLength, this.arrowHeadLength, this.arrowHeadWidth)

    }






    drawLengthAlbert2() {
        setTimeout(() => {
            if (this.currentData === "Length") {
                this.drawLeftLengthAlbert2();
                this.drawRightLengthAlbert2();
            }
        }, this.drawTimeout)
    }
    drawLeftLengthAlbert2() {
        setTimeout(() => {
            if (this.currentData === "LengthLeft" || this.currentData === "Length") {
                this.drawLineSideOutAlbert2('Left');
                this.drawArrowsOutAlbert2('Left');
                this.drawDashedToesAlbert2('Left');
                this.drawDashedHeelAlbert2('Left');
            }
        }, this.drawTimeout)
    }
    drawRightLengthAlbert2() {
        setTimeout(() => {
            if (this.currentData === "LengthRight" || this.currentData === "Length") {
                this.drawLineSideOutAlbert2('Right');
                this.drawArrowsOutAlbert2('Right');
                this.drawDashedToesAlbert2('Right');
                this.drawDashedHeelAlbert2('Right');
            }
        }, this.drawTimeout)
    }

    drawWidthAlbert2() {
        setTimeout(() => {
            if (this.currentData === "Width") {
                this.drawLeftWidthAlbert2();
                this.drawRightWidthAlbert2();
            }
        }, this.drawTimeout);
    }
    drawLeftWidthAlbert2() {
        setTimeout(() => {
            if (this.currentData === "WidthLeft" || this.currentData === "Width") {
                // this.drawLineToes('Left');
                // this.drawArrowsToes('Left');
                // this.drawDashedSideOutToToes('Left');
                // this.drawDashedSideInToToes('Left');
                var foot = 'Left';

                var lineStart = { x: this['instepBox' + foot].min.x + this.arrowHeadLength, y: this['instepBox' + foot].min.y, z: this['instepBox' + foot].min.z };
                var lineEnd = { x: this['instepBox' + foot].max.x - this.arrowHeadLength, y: this['instepBox' + foot].min.y, z: this['instepBox' + foot].min.z };
                var from = new THREE.Vector3(lineStart.x, lineStart.y - (this.dashedPadding / 2), lineStart.z);
                var to = new THREE.Vector3(lineEnd.x, lineEnd.y - (this.dashedPadding / 2), lineEnd.z);
                this.drawLineFromToAlbert2(from, to, false);

                lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].min.y, z: this['instepBox' + foot].min.z };
                var arrowLength = (this['instepBox' + foot].max.x - this['instepBox' + foot].min.x) / 2;
                var origin = new THREE.Vector3(lineEnd.x + arrowLength, lineEnd.y - (this.dashedPadding / 2), lineEnd.z);
                var direction = new THREE.Vector3(1, 0, 0).normalize();
                this.drawArrowAlbert2(foot, arrowLength, origin, direction);

                direction = new THREE.Vector3(-1, 0, 0).normalize();
                this.drawArrowAlbert2(foot, arrowLength, origin, direction);

                var lineStart = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].min.y, z: this['instepBox' + foot].min.z };
                lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].min.y + (this['instepBox' + foot].max.y - this['instepBox' + foot].min.y) / 2, z: this['instepBox' + foot].min.z };
                var from = new THREE.Vector3(lineStart.x, lineStart.y - this.dashedPadding, lineStart.z);
                var to = new THREE.Vector3(lineEnd.x, lineEnd.y + this.dashedPadding, lineEnd.z);
                this.drawLineFromToAlbert2(from, to, true);

                var lineStart = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].min.y, z: this['instepBox' + foot].min.z };
                lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].min.y + (this['instepBox' + foot].max.y - this['instepBox' + foot].min.y) / 2, z: this['instepBox' + foot].min.z };
                var from = new THREE.Vector3(lineStart.x, lineStart.y - this.dashedPadding, lineStart.z);
                var to = new THREE.Vector3(lineEnd.x, lineEnd.y + this.dashedPadding, lineEnd.z);
                this.drawLineFromToAlbert2(from, to, true);
            }
        }, this.drawTimeout);
    }
    drawRightWidthAlbert2() {
        setTimeout(() => {
            if (this.currentData === "WidthRight" || this.currentData === "Width") {
                // this.drawLineToes('Right');
                // this.drawArrowsToes('Right');
                // this.drawDashedSideOutToToes('Right');
                // this.drawDashedSideInToToes('Right');
                var foot = 'Right';

                var lineStart = { x: this['instepBox' + foot].min.x + this.arrowHeadLength, y: this['instepBox' + foot].min.y, z: this['instepBox' + foot].min.z };
                var lineEnd = { x: this['instepBox' + foot].max.x - this.arrowHeadLength, y: this['instepBox' + foot].min.y, z: this['instepBox' + foot].min.z };
                var from = new THREE.Vector3(lineStart.x, lineStart.y - (this.dashedPadding / 2), lineStart.z);
                var to = new THREE.Vector3(lineEnd.x, lineEnd.y - (this.dashedPadding / 2), lineEnd.z);
                this.drawLineFromToAlbert2(from, to, false);

                lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].min.y, z: this['instepBox' + foot].min.z };
                var arrowLength = (this['instepBox' + foot].max.x - this['instepBox' + foot].min.x) / 2;
                var origin = new THREE.Vector3(lineEnd.x + arrowLength, lineEnd.y - (this.dashedPadding / 2), lineEnd.z);
                var direction = new THREE.Vector3(1, 0, 0).normalize();
                this.drawArrowAlbert2(foot, arrowLength, origin, direction);

                direction = new THREE.Vector3(-1, 0, 0).normalize();
                this.drawArrowAlbert2(foot, arrowLength, origin, direction);

                var lineStart = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].min.y, z: this['instepBox' + foot].min.z };
                lineEnd = { x: this['instepBox' + foot].max.x, y: this['instepBox' + foot].min.y + (this['instepBox' + foot].max.y - this['instepBox' + foot].min.y) / 2, z: this['instepBox' + foot].min.z };
                var from = new THREE.Vector3(lineStart.x, lineStart.y - this.dashedPadding, lineStart.z);
                var to = new THREE.Vector3(lineEnd.x, lineEnd.y + this.dashedPadding, lineEnd.z);
                this.drawLineFromToAlbert2(from, to, true);

                var lineStart = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].min.y, z: this['instepBox' + foot].min.z };
                lineEnd = { x: this['instepBox' + foot].min.x, y: this['instepBox' + foot].min.y + (this['instepBox' + foot].max.y - this['instepBox' + foot].min.y) / 2, z: this['instepBox' + foot].min.z };
                var from = new THREE.Vector3(lineStart.x, lineStart.y - this.dashedPadding, lineStart.z);
                var to = new THREE.Vector3(lineEnd.x, lineEnd.y + this.dashedPadding, lineEnd.z);
                this.drawLineFromToAlbert2(from, to, true);
            }
        }, this.drawTimeout);
    }

    drawDorsalHeightAlbert2() {
        setTimeout(() => {
            if (this.currentData === "DorsalHeight" || this.currentData === "InstepHeight") {
                this.drawLeftDorsalHeightAlbert2();
                this.drawRightDorsalHeightAlbert2();
            }
        }, this.drawTimeout);
    }
    drawLeftDorsalHeightAlbert2() {
        setTimeout(() => {
            if (this.currentData === "DorsalHeightLeft" || this.currentData === "DorsalHeight" || this.currentData === "InstepHeight" || this.currentData === "InstepHeightLeft") {
                this.drawDashedMiddleBottomInAlbert2('Left');
                this.drawDashedMiddleTopInAlbert2('Left');
                this.drawLineVerticalMiddleSideInAlbert2('Left');
                this.drawArrowsVerticalMiddleInAlbert2('Left');
            }
        }, this.drawTimeout);
    }
    drawRightDorsalHeightAlbert2() {
        setTimeout(() => {
            if (this.currentData === "DorsalHeightRight" || this.currentData === "DorsalHeight" || this.currentData === "InstepHeight" || this.currentData === "InstepHeightRight") {
                this.drawDashedMiddleBottomInAlbert2('Right');
                this.drawDashedMiddleTopInAlbert2('Right');
                this.drawLineVerticalMiddleSideInAlbert2('Right');
                this.drawArrowsVerticalMiddleInAlbert2('Right');
            }
        }, this.drawTimeout);
    }

    GetLengthWidthDorsalAlbert2(vertices) {
        var length = vertices.length;
        var min_height = 9999;
        var max_height = 0;
        var min_length = 9999;
        var max_length = 0;
        var min_width = 9999;
        var max_width = 0;
        for (var i = 0; i < length; i += 3) {
            // Length
            if (max_length < vertices[i + 2])
                max_length = vertices[i + 2];
            if (min_length > vertices[i + 2])
                min_length = vertices[i + 2];

            // width
            if (max_width < vertices[i])
                max_width = vertices[i];
            if (min_width > vertices[i])
                min_width = vertices[i];
        }

        // get dorsal
        var middleLength = min_length + ((max_length - min_length) / 2);
        for (var i = 0; i < length; i += 3) {
            if (vertices[i + 2] - 0.1 <= middleLength && middleLength <= vertices[i + 2] + 0.1) {
                // Height
                if (max_height < vertices[i + 1])
                    max_height = vertices[i + 1];
                if (min_height > vertices[i + 1])
                    min_height = vertices[i + 1];
            }
        }
        // var lengthpx = Math.abs(max_length - min_length);
        // var widthpx = Math.abs(max_width - min_width);
        // var dorsalpx = Math.abs(max_height - min_height);
        var dorsalPeakpx = max_height;


        // return [lengthpx, widthpx, dorsalpx, dorsalPeakpx];
        return dorsalPeakpx;
    }

    drawArchHeightAlbert2() {
        setTimeout(() => {
            if (this.currentData === "ArchHeight") {
                this.drawArchLeftAlbert2(this.LeftArch);
                this.drawArchRightAlbert2(this.RightArch);
            }
        }, this.drawTimeout);
    }

    drawArchLeftAlbert2(archType) {
        var moveBackArch = 0.085 * (this.boxLeft.max.x - this.boxLeft.min.x);
        setTimeout(() => {
            if (this.currentData === "ArchHeightLeft" || this.currentData === "ArchHeight") {
                this.drawDashedMiddleBottomInHalfAlbert2('Left', moveBackArch);
                this.drawDashedMiddleArchInHalfAlbert2('Left', moveBackArch);
                this.drawArrowsVerticalMiddleArchInAlbert2('Left', moveBackArch);
            }
        }, this.drawTimeout);
    }
    drawArchRightAlbert2(archType) {
        var moveBackArch = 0.085 * (this.boxLeft.max.x - this.boxLeft.min.x);
        setTimeout(() => {
            if (this.currentData === "ArchHeightRight" || this.currentData === "ArchHeight") {
                this.drawDashedMiddleBottomInHalfAlbert2('Right', -moveBackArch);
                this.drawDashedMiddleArchInHalfAlbert2('Right', -moveBackArch);
                this.drawArrowsVerticalMiddleArchInAlbert2('Right', -moveBackArch);
            }
        }, this.drawTimeout);
    }

    drawGirthAlbert2() {
        setTimeout(() => {
            if (this.currentData === "Girth") {
                this.drawGirthLeftAlbert2();
                this.drawGirthRightAlbert2();
            }
        }, this.drawTimeout);
    }

    drawGirthLeftAlbert2() {
        var geometry;
        var middleX = (this.instepBoxLeft.max.x - this.instepBoxLeft.min.x) / 2;
        var middleY = (this.instepBoxLeft.max.y - this.instepBoxLeft.min.y) / 2;
        var middleZ = (this.instepBoxLeft.max.z - this.instepBoxLeft.min.z) / 2;
        var moveY = 0;

        var startPoint = { x: this.instepBoxLeft.min.x, y: this.instepBoxLeft.max.y - moveY, z: middleZ };
        var nextTopPoint = { x: this.instepBoxLeft.min.x, y: this.instepBoxLeft.max.y - moveY, z: this.instepBoxLeft.max.z };
        var middlePoint = { x: this.instepBoxLeft.min.x + middleX, y: this.instepBoxLeft.max.y - moveY, z: this.instepBoxLeft.max.z }
        var nextTopPoint2 = { x: this.instepBoxLeft.max.x, y: this.instepBoxLeft.max.y - moveY, z: this.instepBoxLeft.max.z };
        var endPoint = { x: this.instepBoxLeft.max.x, y: this.instepBoxLeft.max.y - moveY, z: middleZ };

        // var color = 0x323437;
        // var material = new THREE.LineDashedMaterial({color: color, dashSize: .3, gapSize: .3, linewidth: 1});
        // var dashedMaterial = new THREE.LineDashedMaterial( { color: color, dashSize: this.dashedSize, gapSize: this.gapSize, linewidth: 1 } )
        var dashed = false;
        var matLine = new THREE.LineMaterial({

            color: this.main_color,
            linewidth: this.lineWidth, // in pixels
            vertexColors: true,
            // dashScale: 2,
            dashSize: this.dashedSize,
            gapSize: this.gapSize,
            //resolution:  // to be set by renderer, eventually
            dashed: dashed

        });
        if (dashed) {
            matLine.defines.USE_DASH = ""
        }
        // draw curve line
        var increaseCurve = 0.001;
        var moveTop = (this.instepBoxLeft.max.z - this.instepBoxLeft.min.z) / 2;
        var shorterLine = (this.instepBoxLeft.max.x - this.instepBoxLeft.min.x) * 0.15;
        var moveX = (this.instepBoxLeft.max.x - this.instepBoxLeft.min.x) * 0.15;
        var animationTime = 0;
        var curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(startPoint.x + shorterLine - moveX, startPoint.y, startPoint.z + moveTop),
            // new THREE.Vector3(nextTopPoint.x, nextTopPoint.y, nextTopPoint.z + padding),
            new THREE.Vector3(middlePoint.x - moveX, middlePoint.y, middlePoint.z + increaseCurve + moveTop),
            // new THREE.Vector3(nextTopPoint2.x, nextTopPoint2.y, nextTopPoint2.z + padding),
            new THREE.Vector3(endPoint.x - shorterLine - moveX, endPoint.y, endPoint.z + moveTop)
        )

        // curve = new THREE.CatmullRomCurve3( [
        //     new THREE.Vector3(startPoint.x + shorterLine - moveX, startPoint.y, startPoint.z + moveTop),
        //     new THREE.Vector3(nextTopPoint.x + shorterLine - moveX, nextTopPoint.y, nextTopPoint.z + moveTop),
        //     new THREE.Vector3(middlePoint.x + shorterLine - moveX, middlePoint.y, middlePoint.z + increaseCurve + moveTop),
        //     new THREE.Vector3(nextTopPoint2.x - shorterLine - moveX, nextTopPoint2.y, nextTopPoint2.z + moveTop),
        //     new THREE.Vector3(endPoint.x - shorterLine - moveX, endPoint.y, endPoint.z + moveTop)
        // ] );

        // geometry = new THREE.Geometry();
        // geometry.vertices = curve.getPoints(50);
        // var curveLine = new THREE.Line( geometry, material );
        // curveLine.computeLineDistances();

        var points = curve.getPoints(50);
        var positions = [];
        // for(var i in points) {
        //     positions.push(points[i].x)
        //     positions.push(points[i].y)
        //     positions.push(points[i].z)
        // }
        var colors = [];
        var color = new THREE.Color();
        // for(var i in positions) {
        //     colors.push( color.r, color.g, color.b );
        // }
        var lineAdded = false;
        var curveLine;

        this.addLineLeft(positions, colors, curveLine, matLine, lineAdded);
        var middleIndex = Math.floor(points.length / 2);

        /* this.addPoints(prevIndex, nextIndex, positions, colors, curveLine, matLine, lineAdded) */

        // draw left arrow
        var LeftTopArrow = new THREE.ArrowHelper(
            // first argument is the direction
            new THREE.Vector3(0, 0, -1).normalize(),
            // second argument is the origin
            new THREE.Vector3(0, 0, 0),
            // length
            this.arrowHeadLength + .0000001,
            // color
            this.main_color,
            // arrow head length
            this.arrowHeadLength,
            // arrow head width
            this.arrowHeadWidth
        );
        var angleY = (startPoint.z - middlePoint.z) / (startPoint.x - middlePoint.x);
        var angleX = startPoint.y - middlePoint.y ? (startPoint.z - middlePoint.z) / (startPoint.y - middlePoint.y) : startPoint.y - middlePoint.y;

        var LeftTopArrowObj = new THREE.Object3D();
        LeftTopArrowObj.position.x = startPoint.x + shorterLine - moveX;
        LeftTopArrowObj.position.y = startPoint.y;
        LeftTopArrowObj.position.z = startPoint.z + moveTop;
        LeftTopArrowObj.rotation.order = 'YXZ';
        LeftTopArrowObj.rotation.x = 0;
        LeftTopArrowObj.rotation.y = angleY;
        LeftTopArrowObj.rotation.z = 0;

        LeftTopArrowObj.add(LeftTopArrow);
        LeftTopArrowObj.name = "LeftTopArrow";
        this.modelGroup.add(LeftTopArrowObj);
        this._drawedLines.push(LeftTopArrowObj.name);
        LeftTopArrowObj.visible = false;

        // draw left arrow
        var RightTopArrow = new THREE.ArrowHelper(
            // first argument is the direction
            new THREE.Vector3(0, 0, -1).normalize(),
            // second argument is the origin
            new THREE.Vector3(0, 0, 0),
            // length
            this.arrowHeadLength + .0000001,
            // color
            this.main_color,
            // arrow head length
            this.arrowHeadLength,
            // arrow head width
            this.arrowHeadWidth
        );
        var angle = (middlePoint.z - endPoint.z) / (middlePoint.x - endPoint.x);
        var RightTopArrowObj = new THREE.Object3D();
        RightTopArrowObj.position.x = endPoint.x - shorterLine - moveX;
        RightTopArrowObj.position.y = endPoint.y;
        RightTopArrowObj.position.z = endPoint.z + moveTop;
        RightTopArrowObj.rotation.order = 'XYZ';
        RightTopArrowObj.rotation.x = 0;
        RightTopArrowObj.rotation.y = angle;
        RightTopArrowObj.rotation.z = 0;

        RightTopArrowObj.add(RightTopArrow);
        RightTopArrowObj.name = "RightTopArrow";
        this.modelGroup.add(RightTopArrowObj);
        this._drawedLines.push(RightTopArrowObj.name);
        RightTopArrowObj.visible = false;


        setTimeout(() => {
            if (this.currentData === "GirthLeft" || this.currentData === "Girth") {
                this.addPointsLeft(middleIndex, middleIndex + 1, positions, colors, curveLine, matLine, lineAdded, color, points, animationTime);
                this.animateArrowsLeft(middleIndex - 1, middleIndex + 1, points, animationTime, LeftTopArrowObj, RightTopArrowObj);
            }
        }, this.drawTimeout);
    }

    addLineLeft(positions, colors, curveLine, matLine, lineAdded) {
        if (positions.length > 1) {
            var geometry = new THREE.LineGeometry();
            geometry.setPositions(positions);
            geometry.setColors(colors);
            curveLine = new THREE.Line2(geometry, matLine);
            curveLine.computeLineDistances();

            curveLine.name = "curveLine";
            this.modelGroup.add(curveLine);
            this._drawedLines.push(curveLine.name);

            lineAdded = true;
        }
    }

    addPointsLeft(prevIndex, nextIndex, positions, colors, curveLine, matLine, lineAdded, color, points, animationTime) {
        var pointsAdded = false;
        if (points[prevIndex]) {
            positions.unshift(points[prevIndex].z);
            positions.unshift(points[prevIndex].y)
            positions.unshift(points[prevIndex].x)
            colors.unshift(color.r, color.g, color.b);
            pointsAdded = true;
        }
        if (points[nextIndex]) {
            positions.push(points[nextIndex].x)
            positions.push(points[nextIndex].y)
            positions.push(points[nextIndex].z);
            colors.push(color.r, color.g, color.b);
            pointsAdded = true;
        }
        if (!lineAdded) {
            this.addLineLeft(positions, colors, curveLine, matLine, lineAdded);
        } else {
            var geometry = new THREE.LineGeometry();
            geometry.setPositions(positions);
            geometry.setColors(colors);
            curveLine.geometry = geometry;
            curveLine.computeLineDistances();
        }
        if (pointsAdded) {
            setTimeout(() => {
                /* if (this.currentData === "GirthLeft") { */
                this.addPointsLeft(prevIndex - 1, nextIndex + 1, positions, colors, curveLine, matLine, lineAdded, color, points, animationTime);
                /* } */
            }, animationTime)
        }
    }

    animateArrowsLeft(prevIndex, nextIndex, points, animationTime, LeftTopArrowObj, RightTopArrowObj) {
        // LeftTopArrowObj.rotation.y = angle;
        if (points[prevIndex]) {
            // var angle = (startPoint.z - points[prevIndex].z)/(startPoint.x - points[prevIndex].x);
            LeftTopArrowObj.position.x = points[prevIndex].x;
            LeftTopArrowObj.position.y = points[prevIndex].y;
            LeftTopArrowObj.position.z = points[prevIndex].z;
        }
        if (points[nextIndex]) {
            // var angle = (points[nextIndex].z - endPoint.z)/(points[nextIndex].x - endPoint.x);
            RightTopArrowObj.position.x = points[nextIndex].x;
            RightTopArrowObj.position.y = points[nextIndex].y;
            RightTopArrowObj.position.z = points[nextIndex].z;
            // RightTopArrowObj.rotation.y = angle;
        }
        LeftTopArrowObj.visible = true;
        RightTopArrowObj.visible = true;
        if (points[prevIndex]) {
            setTimeout(() => {
                /* if (this.currentData === "GirthLeft") { */
                this.animateArrowsLeft(prevIndex - 1, nextIndex + 1, points, animationTime, LeftTopArrowObj, RightTopArrowObj);
                /* } */
            }, animationTime)
        }
    }

    drawGirthRightAlbert2() {
        var geometry;

        var middleX = (this.instepBoxRight.max.x - this.instepBoxRight.min.x) / 2;
        var middleY = (this.instepBoxRight.max.y - this.instepBoxRight.min.y) / 2;
        var middleZ = (this.instepBoxRight.max.z - this.instepBoxRight.min.z) / 2;
        var moveY = 0;

        // var startPoint = {x: this.instepBoxRight.min.x, y: this.instepBoxRight.max.y - moveY, z: middleZ};
        // var nextTopPoint = {x: this.instepBoxRight.min.x, y: this.instepBoxRight.max.y - moveY, z: this.instepBoxRight.max.z};
        // var middlePoint = {x: this.instepBoxRight.min.x + middleX, y: this.instepBoxRight.max.y - moveY, z: this.instepBoxRight.max.z}
        // var nextTopPoint2 = {x: this.instepBoxRight.max.x, y: this.instepBoxRight.max.y - moveY, z: this.instepBoxRight.max.z};
        // var endPoint = {x: this.instepBoxRight.max.x, y: this.instepBoxRight.max.y - moveY, z: middleZ};

        var startPoint = { x: this.instepBoxRight.min.x, y: this.instepBoxRight.max.y - moveY, z: middleZ };
        var nextTopPoint = { x: this.instepBoxRight.min.x, y: this.instepBoxRight.max.y - moveY, z: this.instepBoxRight.max.z };
        var middlePoint = { x: this.instepBoxRight.min.x + middleX, y: this.instepBoxRight.max.y - moveY, z: this.instepBoxRight.max.z }
        var nextTopPoint2 = { x: this.instepBoxRight.max.x, y: this.instepBoxRight.max.y - moveY, z: this.instepBoxRight.max.z };
        var endPoint = { x: this.instepBoxRight.max.x, y: this.instepBoxRight.max.y - moveY, z: middleZ };

        // var color = 0x323437;
        // var material = new THREE.LineDashedMaterial({color: color, dashSize: .3, gapSize: .3, linewidth: 1});
        // var dashedMaterial = new THREE.LineDashedMaterial( { color: color, dashSize: this.dashedSize, gapSize: this.gapSize, linewidth: 1 } )
        var dashed = false;
        var matLine = new THREE.LineMaterial({

            color: this.main_color,
            linewidth: this.lineWidth, // in pixels
            vertexColors: true,
            // dashScale: 2,
            dashSize: this.dashedSize,
            gapSize: this.gapSize,
            //resolution:  // to be set by renderer, eventually
            dashed: dashed

        });
        if (dashed) {
            matLine.defines.USE_DASH = ""
        }
        // draw curve line
        // var increaseCurve = 0.001;
        // var moveTop = 0.01;
        // var shorterLine = 0.005;
        // var moveX = -0.005;
        // var animationTime = 0;
        var increaseCurve = 0.001;
        // var moveTop = 0.01;
        var moveTop = (this.instepBoxRight.max.z - this.instepBoxRight.min.z) / 2;
        var shorterLine = (this.instepBoxRight.max.x - this.instepBoxRight.min.x) * 0.15;
        var moveX = -(this.instepBoxRight.max.x - this.instepBoxRight.min.x) * 0.15;
        var animationTime = 0;
        var curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(startPoint.x + shorterLine - moveX, startPoint.y, startPoint.z + moveTop),
            // new THREE.Vector3(nextTopPoint.x, nextTopPoint.y, nextTopPoint.z + padding),
            new THREE.Vector3(middlePoint.x - moveX, middlePoint.y, middlePoint.z + increaseCurve + moveTop),
            // new THREE.Vector3(nextTopPoint2.x, nextTopPoint2.y, nextTopPoint2.z + padding),
            new THREE.Vector3(endPoint.x - shorterLine - moveX, endPoint.y, endPoint.z + moveTop)
        )
        // geometry = new THREE.Geometry();
        // geometry.vertices = curve.getPoints(50);
        // var curveLine = new THREE.Line( geometry, material );
        // curveLine.computeLineDistances();

        var points = curve.getPoints(50);
        var positions = [];
        // for(var i in points) {
        //     positions.push(points[i].x)
        //     positions.push(points[i].y)
        //     positions.push(points[i].z)
        // }
        var colors = [];
        var color = new THREE.Color();
        // for(var i in positions) {
        //     colors.push( color.r, color.g, color.b );
        // }

        var lineAdded = false;
        var curveLine;
        this.addLineRight(positions, colors, curveLine, matLine, lineAdded);

        var middleIndex = Math.floor(points.length / 2);

        // draw left arrow
        var LeftTopArrow = new THREE.ArrowHelper(
            // first argument is the direction
            new THREE.Vector3(0, 0, -1).normalize(),
            // second argument is the origin
            new THREE.Vector3(0, 0, 0),
            // length
            this.arrowHeadLength + .0000001,
            // color
            this.main_color,
            // arrow head length
            this.arrowHeadLength,
            // arrow head width
            this.arrowHeadWidth
        );
        var angle = (startPoint.z - middlePoint.z) / (startPoint.x - middlePoint.x);
        var LeftTopArrowObj = new THREE.Object3D();
        LeftTopArrowObj.position.x = startPoint.x + shorterLine - moveX;
        LeftTopArrowObj.position.y = startPoint.y;
        LeftTopArrowObj.position.z = startPoint.z + moveTop;
        LeftTopArrowObj.rotation.order = 'XYZ';
        LeftTopArrowObj.rotation.x = 0;
        LeftTopArrowObj.rotation.y = angle;
        LeftTopArrowObj.rotation.z = 0;

        LeftTopArrowObj.add(LeftTopArrow);
        LeftTopArrowObj.name = "LeftTopArrow";
        this.modelGroup.add(LeftTopArrowObj);
        this._drawedLines.push(LeftTopArrowObj.name);
        LeftTopArrowObj.visible = false;

        // draw left arrow
        var RightTopArrow = new THREE.ArrowHelper(
            // first argument is the direction
            new THREE.Vector3(0, 0, -1).normalize(),
            // second argument is the origin
            new THREE.Vector3(0, 0, 0),
            // length
            this.arrowHeadLength + .0000001,
            // color
            this.main_color,
            // arrow head length
            this.arrowHeadLength,
            // arrow head width
            this.arrowHeadWidth
        );
        var angle = (middlePoint.z - endPoint.z) / (middlePoint.x - endPoint.x);
        var RightTopArrowObj = new THREE.Object3D();
        RightTopArrowObj.position.x = endPoint.x - shorterLine - moveX;
        RightTopArrowObj.position.y = endPoint.y;
        RightTopArrowObj.position.z = endPoint.z + moveTop;
        RightTopArrowObj.rotation.order = 'XYZ';
        RightTopArrowObj.rotation.x = 0;
        RightTopArrowObj.rotation.y = angle;
        RightTopArrowObj.rotation.z = 0;

        RightTopArrowObj.add(RightTopArrow);
        RightTopArrowObj.name = "RightTopArrow";
        this.modelGroup.add(RightTopArrowObj);
        this._drawedLines.push(RightTopArrowObj.name);
        RightTopArrowObj.visible = false;



        setTimeout(() => {
            if (this.currentData === "GirthRight" || this.currentData === "Girth") {
                this.addPointsRight(middleIndex, middleIndex + 1, positions, colors, curveLine, matLine, lineAdded, color, points, animationTime);
                this.animateArrowsRight(middleIndex - 1, middleIndex + 1, points, animationTime, LeftTopArrowObj, RightTopArrowObj);
            }
        }, this.drawTimeout);
    }

    addLineRight(positions, colors, curveLine, matLine, lineAdded) {
        if (positions.length > 1) {
            var geometry = new THREE.LineGeometry();
            geometry.setPositions(positions);
            geometry.setColors(colors);
            curveLine = new THREE.Line2(geometry, matLine);
            curveLine.computeLineDistances();

            curveLine.name = "curveLine";
            this.modelGroup.add(curveLine);
            this._drawedLines.push(curveLine.name);

            lineAdded = true;
        }
    }

    addPointsRight(prevIndex, nextIndex, positions, colors, curveLine, matLine, lineAdded, color, points, animationTime) {
        var pointsAdded = false;
        if (points[prevIndex]) {
            positions.unshift(points[prevIndex].z);
            positions.unshift(points[prevIndex].y)
            positions.unshift(points[prevIndex].x)
            colors.unshift(color.r, color.g, color.b);
            pointsAdded = true;
        }
        if (points[nextIndex]) {
            positions.push(points[nextIndex].x)
            positions.push(points[nextIndex].y)
            positions.push(points[nextIndex].z);
            colors.push(color.r, color.g, color.b);
            pointsAdded = true;
        }
        if (!lineAdded) {
            this.addLineRight(positions, colors, curveLine, matLine, lineAdded);
        } else {
            var geometry = new THREE.LineGeometry();
            geometry.setPositions(positions);
            geometry.setColors(colors);
            curveLine.geometry = geometry;
            curveLine.computeLineDistances();
        }
        if (pointsAdded) {
            setTimeout(() => {
                /* if (this.currentData === "GirthRight") { */
                this.addPointsRight(prevIndex - 1, nextIndex + 1, positions, colors, curveLine, matLine, lineAdded, color, points, animationTime);
                /* } */
            }, animationTime)
        }
    }

    animateArrowsRight(prevIndex, nextIndex, points, animationTime, LeftTopArrowObj, RightTopArrowObj) {
        // LeftTopArrowObj.rotation.y = angle;
        if (points[prevIndex]) {
            // var angle = (startPoint.z - points[prevIndex].z)/(startPoint.x - points[prevIndex].x);
            LeftTopArrowObj.position.x = points[prevIndex].x;
            LeftTopArrowObj.position.y = points[prevIndex].y;
            LeftTopArrowObj.position.z = points[prevIndex].z;
        }
        if (points[nextIndex]) {
            // var angle = (points[nextIndex].z - endPoint.z)/(points[nextIndex].x - endPoint.x);
            RightTopArrowObj.position.x = points[nextIndex].x;
            RightTopArrowObj.position.y = points[nextIndex].y;
            RightTopArrowObj.position.z = points[nextIndex].z;
            // RightTopArrowObj.rotation.y = angle;
        }
        LeftTopArrowObj.visible = true;
        RightTopArrowObj.visible = true;
        if (points[prevIndex]) {
            setTimeout(() => {
                /* if (this.currentData === "GirthRight") { */
                this.animateArrowsRight(prevIndex - 1, nextIndex + 1, points, animationTime, LeftTopArrowObj, RightTopArrowObj);
                /*  } */
            }, animationTime)
        }
    }

    cleanThreeJs() {
        for (var i = this._scene.children.length - 1; i >= 0; i--) {
            var object = this._scene.children[i];
            if (object.type === 'Mesh' || object.type === 'LineSegments') {
                this._scene.remove(object);
                if (object.material) {
                    object.material.dispose();
                    if (object.material.map) {
                        object.material.map.dispose();
                    }
                }
                if (object.geometry) {
                    object.geometry.dispose();
                    if (object.geometry.attributes && object.geometry.attributes.normal) {
                        object.geometry.attributes.normal.array = null;
                        object.geometry.attributes.normal.position = null;
                        object.geometry.attributes.normal.uv = null;
                    }
                }
                object.indices = [];
                object.vertices = [];
                object.uvs = [];
            }
            if (object.type === 'OrthographicCamera') {
                this._scene.remove(object);
            }
            if (object.type === 'PointLight') {
                this._scene.remove(object);
            }
            if (object.type === 'AmbientLight') {
                this._scene.remove(object);
            }
            if (object.type === 'DirectionalLight') {
                this._scene.remove(object);
            }
            if (object.type === 'Group') {
                this._scene.remove(object);
            }
            object = null;
        }

        this.animations.rotateAnimation.stop();
        this.animations.arrowLengthAnimation.stop();
        this.animations.lineAnimation.stop();
        this.animations.fadeAnimation.stop();
        this._renderer.forceContextLoss();

        this.mainGroup = null;
        this.modelGroup = null;
        this._camera = null;
        this._controls.dispose();
        this._controls = null;
        this._scene = null;
        this._light = null;
        this._renderer.renderLists.dispose();
        this._renderer.clear();
        this._renderer.dispose();
        this._renderer = null;
        this._shadowRenderer.shadowGroup = null;
        this._shadowRenderer.renderTarget = null;
        this._shadowRenderer.renderTargetBlur = null;
        this._shadowRenderer.plane = null;
        this._shadowRenderer.blurPlane = null;
        this._shadowRenderer.fillPlane = null;
        this._shadowRenderer.shadowCamera = null;
        this._shadowRenderer.cameraHelper = null;
        this._shadowRenderer.horizontalBlurMaterial = null;
        this._shadowRenderer.verticalBlurMaterial = null;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this._footService.fbxPbject = undefined;
        if (this.frameId != null) {
            cancelAnimationFrame(this.frameId);
        }
        this.cleanThreeJs();
        this.threeDService.resetObjects();
        this.urlFoots$.next(null);
        this.urlFoots$.complete();
    }
}
