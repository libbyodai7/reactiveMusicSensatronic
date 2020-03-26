define(["app/MyClass"],
    function( MyClass ){

        function Main()
        {
            this.init();
            $(window).resize(this.onResize.bind(this));

            this.myObj1 = new MyClass(10);
            this.myObj2 = new MyClass(20);


            return( this );
        }

        var p = Main.prototype;

        p.init = function()
        {
            console.log("Main initialised");

            this.cubeColor = 0xf00000;



            this.initAudio();
            this.initScene();
            this.initLights();
            this.initObjects();

            this.render();
        }

        p.initAudio = function()
        {


            //AUDIO SET UP
            this.audio = new Audio();
          //  this.audioStream = audioContent.createMediaStreamSource( stream );
            this.audio.src = 'music/SensatronicAmbient1.mp3';
            this.audio.controls = true;
            this.audio.loop = true;
            this.audio.autoplay = false;
            //this.audio.crossOrigin = "anonymous";
            document.getElementById('audio_box').appendChild(this.audio);



            // init analyser
            var context = new AudioContext(); // AudioContext object instance
            var analyser = context.createAnalyser(); // AnalyserNode method
            analyser.smoothingTimeConstant = 0.6;
            analyser.minDecibels = -90;
            analyser.maxDecibels = -20;
            analyser.fftSize = 512;

            // Re-route audio playback into the processing graph of the AudioContext
            var source = context.createMediaElementSource(this.audio);
            source.connect(analyser);
            analyser.connect(context.destination);

            this.analyser = analyser;
        }

        p.initScene = function()
        {
            // //THREE.JS SCENE
            this.scene = new THREE.Scene();
            this.scene.fog = new THREE.FogExp2( 0xcccccc, 0.01 );

            //CAMERA
            this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
            this.camera.position.set(0, 0, 100);
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));



            //RENDERER
            this.renderer = new THREE.WebGLRenderer({antialias:true});
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.renderer.setClearColor( this.scene.fog.color );

            //Controls


            this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
            //this.controls.addEventListener( 'change', ren );
            this.controls.enableZoom = false;


            document.body.appendChild( this.renderer.domElement );
        }

        p.initLights = function()
        {
            hemiLight = new THREE.HemisphereLight( 0x404040 );
            this.scene.add( hemiLight );

            light = new THREE.PointLight( 0xffffff, 0.8 );
            this.camera.add( light );
        }

        p.initObjects = function()
        {
            //GROUP OBJECTS
            this.group = new THREE.Group();
            this.cubeGroup = new THREE.Group();
            this.scene.add( this.cubeGroup);

            //Cube Arrays
            this.cubeArray = [];
            this.cubePositionXArray = [];
            this.cubePositionYArray = [];
            this.cubePositionZArray = [];

            //PIVOT
            this.pivot = new THREE.Object3D();
            this.pivot.position.set(0, 0, 0);
            this.pivot.add(this.cubeGroup);
            this.scene.add(this.pivot)


            //CREATE SHAPE
            this.color = 0xf00000;
            //Axis helper
            //var axisHelper = new THREE.AxisHelper( 5 );
            //this.scene.add(axisHelper);


            // make cubes
            //Call list of cubes in random places
            for (var i = 0; i < 100; i++){
                var cubePositionX = Math.floor(Math.random() * 17) - 8;
                var cubePositionY = Math.floor(Math.random() * 17) - 8;
                var cubePositionZ = Math.floor(Math.random() * 17) - 8;
                this.makeCube(cubePositionX, cubePositionY, cubePositionZ, this.cubeColor);
                this.cubePositionXArray.push(cubePositionX);
                this.cubePositionYArray.push(cubePositionY);
                this.cubePositionZArray.push(cubePositionZ);
            }

        }

        p.makeCube = function(x, y, z, color)
        {
            var cubeGeometry = new THREE.BoxGeometry( 1, 1 , 1);
            var material = new THREE.MeshLambertMaterial({ color: color});
            var cube = new THREE.Mesh( cubeGeometry, material);
            cube.position.set ( x, y, z );
            cube.scale.set (1, 1, 1 );
            this.cubeGroup.add(cube);
            this.cubeArray.push(cube);
        }

        p.render = function()
        {
            requestAnimationFrame( this.render.bind(this) );

            wave_array = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(wave_array);

            var wave_array_sum = 0;

            //finds avergage of the frequencies
            for (var i = 0; i < wave_array.length; i++){
                wave_array_sum += parseInt( wave_array[i], 10);
            }

            var avgFreq = wave_array_sum/wave_array.length;
            var moveRandom = Math.floor(Math.random() * 21) - 10;

            var rotateFactorAvg = (avgFreq * 0.0001) + 0.002;

            if (avgFreq > 0) {

                //ROTATE PIVOT
                this.pivot.applyMatrix( new THREE.Matrix4().makeRotationZ(rotateFactorAvg));
                this.pivot.applyMatrix( new THREE.Matrix4().makeRotationY(rotateFactorAvg));
                this.pivot.applyMatrix( new THREE.Matrix4().makeRotationX(rotateFactorAvg));

                for (var i = 0; i < this.cubeArray.length; i++) {

                    var cubeRandom = Math.floor(Math.random() * 21) - 10;
                    var cubeMove = (wave_array[i] * 0.009) + 1;
                    var cubeScale = (wave_array[i] * 0.001) + 0.02;

                    this.cubeArray[i].scale.set (1 + (wave_array[i]*0.005), 1 + (wave_array[i]*0.005), 1 + (wave_array[i]*0.005));
                    this.cubeArray[i].position.set (this.cubePositionXArray[i] * cubeMove, this.cubePositionYArray[i] * cubeMove, this.cubePositionZArray[i] * cubeMove );
                    this.cubeArray[i].rotation.set (cubeScale, cubeScale, cubeScale);
                }
            }

            this.renderer.render(this.scene, this.camera);
        }

        p.onResize = function()
        {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }

        // Return the base class constructor.
        return( Main );
    }
);
