(function() {
  var canvas = $('#hero');
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
  var renderer = new THREE.WebGLRenderer({canvas: canvas[0]});
  var clock = new THREE.Clock();
  var group = new THREE.Group();//create an empty container

  // Materials
  var blurryParticle = {
    transparent: true,
    // side: THREE.DoubleSide,
    uniforms: {
      iGlobalTime: { type: "f", value: 1.0 },
      iResolution: { type: "v2", value: new THREE.Vector2() },
      center:      { type: "v3", value: new THREE.Vector2() }
    },
    vertexShader: [
      "uniform float iGlobalTime;",
      "uniform vec2  iResolution;",
      "uniform vec3  center;",

      "varying vec2 vUv;",
      "void main() {",
      "  vUv = uv;",
      "  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
      "}"
    ].join("\n"),

    fragmentShader: [
      "uniform float iGlobalTime;",
      "uniform vec2  iResolution;",
      "uniform vec3  center;",

      "varying vec2 vUv;",
      "void main() {",
        "vec2 pos = gl_FragCoord.xy / iResolution.xy;",
        "pos.x *= iResolution.x / iResolution.y;",
        "vec2 uvv = center.xy / iResolution.xy;",
        "uvv.x *= iResolution.x / iResolution.y;",
        "float dist = length(vUv - 0.5);",
        "float dist2 = length(pos - uvv)/abs(gl_FragCoord.z);",
        "float depth = abs(gl_FragCoord.z);",
        "gl_FragColor = vec4(sin(iGlobalTime), uvv.y, 1.0/depth, (1.5-dist2*5.0));",
      "}"
    ].join("\n")

  };


  camera.position.z = 5;


  var particles = []
  for (i = 0; i < 250; i++) {
    var size = 2.0+1.5*Math.sin(5*Math.random());
    var geom = new THREE.SphereGeometry(size, 2+ Math.abs(5*Math.random()), 5);
    var mat = new THREE.ShaderMaterial(blurryParticle);
    var particle = new THREE.Mesh(geom, mat);
    particle.position.x = 40*Math.random()-20;
    particle.position.y = 40*Math.random()-20;
    particle.position.z = 40*Math.random()-20;

    particle.material.uniforms = {
      iGlobalTime: { type: "f", value: 1.0 },
      iResolution: { type: "v2", value: new THREE.Vector2() },
      center:      { type: "v3", value: new THREE.Vector2() },
      color:       { type: "c", value: new THREE.Color()    }
    };

    particles.push(particle);
    group.add(particle);
  }

  scene.add(group);

  scene.add( new THREE.AmbientLight( 0x222222 ) );

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );




  // Post Processing
  renderer.autoClear = false;

  var composer = new THREE.EffectComposer(renderer);
  composer.addPass( new THREE.RenderPass(scene, camera) );
  var bokeh    = new THREE.BokehPass(scene, camera, {
    focus: 1.0,
    aperture: 0.081,
    maxBlur: 1.0,

    width: 1080,
    height: 1080 
  });
  // composer.addPass( new THREE.ShaderPass(THREE.VerticalBlurShader) );
  // composer.addPass( new THREE.ShaderPass(THREE.HorizontalBlurShader) );
   composer.addPass( bokeh );
  bokeh.renderToScreen = true;

  // var copyPass = new THREE.ShaderPass( THREE.CopyShader );
  // copyPass.renderToScreen = true;
  // composer.addPass( copyPass );

  function toScreen( position, camera, jqdiv ) {

    var pos = position.clone(); 
    projScreenMat = new THREE.Matrix4();
    projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
    pos.applyProjection(projScreenMat);

    return { x: ( pos.x + 1 ) * jqdiv.width() / 2 ,
      y: ( pos.y + 1 ) * jqdiv.height()/ 2 };

      // return pos;
  }

  function updateRenderer(camera, renderer) {
    renderer.setSize(canvas.parent().width(), canvas.parent().height());
    camera.aspect = canvas.width() / canvas.height();
    camera.updateProjectionMatrix();
    composer.setSize(canvas.width(), canvas.height());
  }
  updateRenderer(camera, renderer);
  $(window).resize(function() {
    updateRenderer(camera, renderer);
  });;
  renderer.autoClearColor = true;
  function render() {
    requestAnimationFrame( render );
    var time = clock.getElapsedTime()/2;
    group.position.y += 0.01*Math.cos(time);
    group.rotation.y += 0.005;
    group.rotation.z -= 0.01;
    group.position.y += 0.1*Math.sin(time);
    for(var i = 0; i<particles.length; i++) {
      particles[i].material.uniforms.iResolution.value
      = new THREE.Vector2(canvas.width(), canvas.height());

      particles[i].material.uniforms.iGlobalTime.value = time;

      particles[i].material.uniforms.center.value = toScreen(
        particles[i].position.clone().applyProjection(group.matrixWorld),
        camera, canvas);
    }
    composer.render(1);
  }
  render();
})();
