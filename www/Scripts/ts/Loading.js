var Told;
(function (Told) {
    // LOADING
    (function (MemPuzzle) {
        function showLoading(canvasId) {
            var canvas = document.getElementById(canvasId);
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
            // Based on: http://padolsey.github.io/sonic-creator/#flame
            function drawFlame(color, px, py, radius) {
                this._.fillStyle = color;
                this._.beginPath();
                this._.arc(px, py, radius, 0, Math.PI * 2, false);
                this._.closePath();
                this._.fill();
            }

            var x = 25;
            var y = 25;
            var m = 5;

            var sonic = new Sonic({
                //width: window.innerWidth - 60,
                //height: window.innerHeight - 60,
                width: 150,
                height: 90,
                canvas: canvas,
                stepsPerFrame: 8,
                trailLength: 1.0,
                pointDistance: 0.04,
                fps: 10,
                //stepsPerFrame: 4,
                //trailLength: 0.8,
                //pointDistance: 0.01,
                //fps: 20,
                backgroundColor: '#000000',
                path: [
                    [
                        'line',
                        0 * m + x, 0 * m + y,
                        5 * m + x, 0 * m + y],
                    [
                        'line',
                        2.5 * m + x, 0 * m + y,
                        2.5 * m + x, 10 * m + y],
                    ['arc', 7.5 * m + x, 7.5 * m + y, 2.5 * m, 0, 360],
                    [
                        'line',
                        12.5 * m + x, 0 * m + y,
                        12.5 * m + x, 10 * m + y],
                    ['arc', 17.5 * m + x, 7.5 * m + y, 2.5 * m, 0, 360],
                    [
                        'line',
                        20 * m + x, 0 * m + y,
                        20 * m + x, 10 * m + y]
                ],
                step: function (point, index, frame) {
                    var sizeMultiplier = 5;
                    var radius = sizeMultiplier * (index > 0.5 ? 1 - index : index);

                    drawFlame.call(this, '#FF6C08', point.x * index, point.y, radius);
                    drawFlame.call(this, '#FFD341', point.x, point.y * index, radius);
                    drawFlame.call(this, '#FF3000', point.x, point.y, radius);
                }
            });

            sonic.play();

            //document.body.appendChild(sonic.canvas);
            return function () {
                sonic.stop();
            };
        }
        MemPuzzle.showLoading = showLoading;
    })(Told.MemPuzzle || (Told.MemPuzzle = {}));
    var MemPuzzle = Told.MemPuzzle;
})(Told || (Told = {}));
