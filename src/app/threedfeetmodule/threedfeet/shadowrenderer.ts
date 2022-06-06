declare let THREE: any;

export class ShadowRenderer{
    renderer = null;
    scene = null;
    planeW = 40;
    planeH = 40;
    planeOpacity =  0;
    planeColor =  new THREE.Color(0xffffff);
    camHeight =  1;
    shadowBlur = 2.5;
    shadowDarkness =  2;
    shadowOpacity =  0.6;
    shadowGroup =  null;
    renderTarget =  null;
    renderTargetBlur =  null;
    plane =  null;
    blurPlane =  null;
    fillPlane =  null;
    shadowCamera =  null;
    cameraHelper =  null;
    depthMaterial =  null;
    horizontalBlurMaterial =  null;
    verticalBlurMaterial =  null;

    init(renderer, scene, mainGroup) {

        this.renderer = renderer;
        this.scene = scene;

        // the container, if you need to move the plane just move this
        this.shadowGroup = new THREE.Group();
        mainGroup.add(this.shadowGroup);

        // the render target that will show the shadows in the plane texture
        this.renderTarget = new THREE.WebGLRenderTarget( 1024, 1024 );
        this.renderTarget.texture.generateMipmaps = false;

        // the render target that we will use to blur the first render target
        this.renderTargetBlur = new THREE.WebGLRenderTarget( 1024, 1024 );
        this.renderTargetBlur.texture.generateMipmaps = false;

        // make a plane and make it face up
        var planeGeometry = new THREE.PlaneBufferGeometry( this.planeW, this.planeH ).rotateX( Math.PI / 2 );
        var material = new THREE.MeshBasicMaterial( {
            map: this.renderTarget.texture,
            opacity: this.shadowOpacity,
            transparent: true,
        } );
        this.plane = new THREE.Mesh( planeGeometry, material );
        this.shadowGroup.add( this.plane );

        // the y from the texture is flipped!
        this.plane.scale.y = - 1;

        // the plane onto which to blur the texture
        this.blurPlane = new THREE.Mesh( planeGeometry );
        this.blurPlane.visible = false;
        this.shadowGroup.add( this.blurPlane );

        // the plane with the color of the ground
        var material = new THREE.MeshBasicMaterial( {
            color: this.planeColor,
            opacity: this.planeOpacity,
            transparent: true,
        } );
        this.fillPlane = new THREE.Mesh( planeGeometry, material );
        this.fillPlane.rotateX( Math.PI );
        this.fillPlane.position.y -= 0.1;
        this.shadowGroup.add( this.fillPlane );

        // the camera to render the depth material from
        this.shadowCamera = new THREE.OrthographicCamera( - this.planeW / 2, this.planeW / 2, this.planeH / 2, - this.planeH / 2, 0, this.camHeight );
        this.shadowCamera.rotation.x = Math.PI / 2; // get the camera to look up
        this.shadowGroup.add( this.shadowCamera );

        this.cameraHelper = new THREE.CameraHelper( this.shadowCamera );
        //$scope.scene.add(this.cameraHelper);

        // like MeshDepthMaterial, but goes from black to transparent
        var depthMaterial = new THREE.MeshDepthMaterial();
        depthMaterial.userData.darkness = { value: this.shadowDarkness };
        depthMaterial.onBeforeCompile = function ( shader ) {
            shader.uniforms.darkness = depthMaterial.userData.darkness;
            shader.fragmentShader = `
                uniform float darkness;
                ${shader.fragmentShader.replace(
                'gl_FragColor = vec4( vec3( 1.0 - gl_FragCoord.z ), opacity );',
                'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - gl_FragCoord.z ) * darkness );'
                )}
                `;
        };
        depthMaterial.depthTest = false;
        depthMaterial.depthWrite = false;
        this.depthMaterial = depthMaterial;

        this.horizontalBlurMaterial = new THREE.ShaderMaterial( THREE.HorizontalBlurShader );
        this.horizontalBlurMaterial.depthTest = false;

        this.verticalBlurMaterial = new THREE.ShaderMaterial( THREE.VerticalBlurShader );
        this.verticalBlurMaterial.depthTest = false;
    }
    blurShadow (amount: number) {
        this.blurPlane.visible = true;
        // blur horizontally and draw in the renderTargetBlur
        this.blurPlane.material = this.horizontalBlurMaterial;
        this.blurPlane.material.uniforms.tDiffuse.value = this.renderTarget.texture;
        this.horizontalBlurMaterial.uniforms.h.value = amount * 1 / 256;

        this.renderer.setRenderTarget( this.renderTargetBlur );
        this.renderer.render( this.blurPlane, this.shadowCamera, this.renderTargetBlur );

        // blur vertically and draw in the main renderTarget
        this.blurPlane.material = this.verticalBlurMaterial;
        this.blurPlane.material.uniforms.tDiffuse.value = this.renderTargetBlur.texture;
        this.verticalBlurMaterial.uniforms.v.value = amount * 1 / 256;

        this.renderer.setRenderTarget( this.renderTarget );
        this.renderer.render( this.blurPlane, this.shadowCamera, this.renderTarget);

        this.blurPlane.visible = false;
    }
    renderShadow() {
        // remove the background
        var initialBackground = this.scene.background;
        this.scene.background = null;
        // force the depthMaterial to everything
        this.cameraHelper.visible = false;
        this.scene.overrideMaterial = this.depthMaterial;

        // render to the render target to get the depths
        this.renderer.setRenderTarget( this.renderTarget );
        this.renderer.render(this.scene, this.shadowCamera, this.renderTarget);

        // and reset the override material
        this.scene.overrideMaterial = null;
        this.cameraHelper.visible = true;

        this.blurShadow( this.shadowBlur );

        // a second pass to reduce the artifacts
        // (0.4 is the minimum blur amout so that the artifacts are gone)
        this.blurShadow( this.shadowBlur * 0.4 );

        // reset and render the normal scene
        this.renderer.setRenderTarget( null );
        this.scene.background = initialBackground;
    }
}
