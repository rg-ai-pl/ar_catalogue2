window.addEventListener('load', init, false);

function init() {
    console.log("Init...");

    // To erase the scroll bar
    document.body.style.overflow = "hidden";

    // Init renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color(), 0); // Sets the clear color and opacity.
    renderer.setSize(640, 480);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';
    document.body.appendChild(renderer.domElement);
    
    // Init scene and camera
    const scene = new THREE.Scene();
    scene.visible = false;
    const camera = new THREE.Camera();
    scene.add(camera);

    // Init light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF);
    scene.add(ambientLight);
    // const directionalLight = new THREE.DirectionalLight( 0xffffff );
    // directionalLight.position.set( 1, 1, 0 ); //.normalize()
    // scene.add(directionalLight);

    // // Create sphere
    // const mesh = new THREE.Mesh(
    //     new THREE.BoxGeometry(1, 1, 1),
    //     //new THREE.SphereGeometry( 1, 32, 32 ),
    //     new THREE.MeshNormalMaterial(),
    // );
    // mesh.position.y = 2.5;
    // scene.add(mesh);

    // Load model
    let model = null;
    const loader = new THREE.GLTFLoader();
    loader.load(
        // resource URL
        "../resources/1320.glb",
        // called when the resource is loaded
        function ( gltf ){
            model = gltf.scene;
            model.name = "1320";
            model.scale.set(0.5, 0.5, 0.5);
            model.position.set(0, 2.0, 0.0);
            model.rotation.x = -Math.PI/2;

            gltf.scene.traverse( function ( child ) {
                if ( child.isMesh ) {
                    console.log("isMesh...")
                }
            });

            scene.add( model );
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has error
        function ( error ) {
            console.log('An error happened');
            console.log(error);
        }
    );
    renderer.gammaFactor = 2.2;
    //renderer.outputEncoding = THREE.LinearEncoding;
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Handle arToolkitSource
    const arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam'
    });
    
    arToolkitSource.init(() => {
        setTimeout(() => {
            onResize();
        }, 2000);
    });
    
    // Handle resize
    addEventListener('resize', () => {
        onResize();
    });
    
    function onResize() {
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
        }
    };
    
    // Create atToolkitContext
    const arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: '../resources/camera_para.dat',
        detectionMode: 'mono'
    });
    
    // Initialize arToolkitContext
    arToolkitContext.init(() => {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });
    
    // Init controls for camera
    const arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
        type: 'pattern',
        patternUrl: '../resources/pattern-HOGEHOGE.patt',
        // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
        changeMatrixMode: 'cameraTransformMatrix'
    });
    
    // Run the rendering loop
    const clock = new THREE.Clock();
    requestAnimationFrame(function animate(){
        requestAnimationFrame(animate);
        if (arToolkitSource.ready) {
            arToolkitContext.update(arToolkitSource.domElement);
            scene.visible = camera.visible;
        }

        const delta = clock.getDelta();
        // mesh.rotation.x += delta * 1.0;
        // mesh.rotation.y += delta * 1.5;
        // model.rotation.x += delta * 1.0;
        // model.rotation.y += delta * 1.5; 

        renderer.render(scene, camera);
    });
}

// When 'f' key is pressed
window.addEventListener('keydown',
    event => {
        if(event.key === 'f'){
            console.log("setFullScreen...");
            setFullScreen();
        }
});

function setFullScreen(element=null){
    const doc = window.document;
    const docEl = (element === null)?  doc.documentElement:element;
    let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    requestFullScreen.call(docEl);
}