
declare var Sonic;

module Told.MemPuzzle {

    export function showLoading(canvasId: string): () => void {

        var canvas = <HTMLCanvasElement> document.getElementById(canvasId);
        var context = canvas.getContext('2d');

        //context.fillStyle = "black";
        //context.fillRect(0, 0, canvas.width, canvas.height);

        //context.beginPath();
        //context.moveTo(10, 10);
        //context.arcTo(100, 100, 200, 200, 50);
        //context.closePath();

        //context.fillStyle = "red";
        //context.fill();
        //context.stroke();

        function drawFlame(color, px, py, radius) {
            this._.fillStyle = color;
            this._.beginPath();
            this._.arc(
                px, py,
                radius, 0,
                Math.PI * 2, false
                );
            this._.closePath();
            this._.fill();
        }

        var x = 50;
        var y = 50;
        var m = 10;

        var sonic = new Sonic({

            //width: window.innerWidth - 60,
            //height: window.innerHeight - 60,
            width: 300,
            height: 300,
            canvas: canvas,

            stepsPerFrame: 4,
            trailLength: 0.8,
            pointDistance: 0.01,
            fps: 20,

            backgroundColor: '#1B0918',

            path: [
                //T
                ['line',
                    0 * m + x, 0 * m + y,
                    5 * m + x, 0 * m + y],
                ['line',
                    2.5 * m + x, 0 * m + y,
                    2.5 * m + x, 10 * m + y],
                // o
                ['arc', 7.5 * m + x, 7.5 * m + y, 2.5 * m, 0, 360],
                // l
                ['line',
                    12.5 * m + x, 0 * m + y,
                    12.5 * m + x, 10 * m + y],
                // d
                ['arc', 17.5 * m + x, 7.5 * m + y, 2.5 * m, 0, 360],
                ['line',
                    20 * m + x, 0 * m + y,
                    20 * m + x, 10 * m + y],
            ],

            step: function (point, index, frame) {

                var sizeMultiplier = 10;
                var radius = sizeMultiplier * (index > 0.5 ? 1 - index : index);

                drawFlame.call(this, '#FF6C08', point.x * index, point.y, radius);
                drawFlame.call(this, '#FFD341', point.x, point.y * index, radius);
                drawFlame.call(this, '#FF3000', point.x, point.y, radius);

            }

        });

        sonic.play();

        //document.body.appendChild(sonic.canvas);

        return () => { sonic.stop(); };

    }
}