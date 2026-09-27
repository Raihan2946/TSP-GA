class MapManager {

    constructor(canvas) {

        this.canvas = canvas;

        this.ctx =
            canvas.getContext("2d");

        this.cities = [];

        this.bestRoute = null;

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );
    }


    resize() {

        const rect =
            this.canvas.getBoundingClientRect();


        const dpr =
            window.devicePixelRatio || 1;


        this.canvas.width =
            rect.width * dpr;

        this.canvas.height =
            rect.height * dpr;


        this.ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        this.width =
            rect.width;

        this.height =
            rect.height;


        this.draw();
    }


    addCity(x, y) {

        const name =
            this.generateCityName(
                this.cities.length
            );


        this.cities.push({

            id: this.cities.length,

            name: name,

            x: x,

            y: y

        });


        this.draw();
    }


    generateCityName(index) {

        /*
         * A-Z
         */

        if (index < 26) {

            return String.fromCharCode(
                65 + index
            );
        }


        /*
         * Jika > 26
         */

        const first =
            Math.floor(index / 26) - 1;

        const second =
            index % 26;


        return (
            String.fromCharCode(
                65 + first
            ) +
            String.fromCharCode(
                65 + second
            )
        );
    }


    clear() {

        this.cities = [];

        this.bestRoute = null;

        this.draw();
    }


    setRoute(route) {

        this.bestRoute =
            route
                ? [...route]
                : null;

        this.draw();
    }


    randomCities(count) {

        this.cities = [];

        this.bestRoute = null;


        const padding = 45;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const x =
                padding +
                Math.random() *
                (this.width -
                    padding * 2);


            const y =
                padding +
                Math.random() *
                (this.height -
                    padding * 2);


            this.cities.push({

                id: i,

                name:
                    this.generateCityName(i),

                x: x,

                y: y

            });
        }


        this.draw();
    }


    drawGrid() {

        const ctx = this.ctx;

        const gridSize = 25;


        ctx.save();

        ctx.strokeStyle =
            "rgba(200,205,215,0.35)";

        ctx.lineWidth = 1;


        for (
            let x = 0;
            x < this.width;
            x += gridSize
        ) {

            ctx.beginPath();

            ctx.moveTo(x, 0);

            ctx.lineTo(
                x,
                this.height
            );

            ctx.stroke();
        }


        for (
            let y = 0;
            y < this.height;
            y += gridSize
        ) {

            ctx.beginPath();

            ctx.moveTo(0, y);

            ctx.lineTo(
                this.width,
                y
            );

            ctx.stroke();
        }


        ctx.restore();
    }


    drawRoute() {

        if (
            !this.bestRoute ||
            this.bestRoute.length < 2
        ) {
            return;
        }


        const ctx = this.ctx;


        ctx.save();


        ctx.strokeStyle =
            "#315efb";

        ctx.lineWidth = 3;

        ctx.lineJoin = "round";

        ctx.lineCap = "round";


        ctx.beginPath();


        const firstCity =
            this.cities[
                this.bestRoute[0]
            ];


        ctx.moveTo(
            firstCity.x,
            firstCity.y
        );


        for (
            let i = 1;
            i < this.bestRoute.length;
            i++
        ) {

            const city =
                this.cities[
                    this.bestRoute[i]
                ];


            ctx.lineTo(
                city.x,
                city.y
            );
        }


        // kembali ke awal

        ctx.lineTo(
            firstCity.x,
            firstCity.y
        );


        ctx.stroke();


        ctx.restore();
    }


    drawCities() {

        const ctx = this.ctx;


        for (
            let i = 0;
            i < this.cities.length;
            i++
        ) {

            const city =
                this.cities[i];


            const isStart =
                this.bestRoute &&
                this.bestRoute.length > 0 &&
                this.bestRoute[0] === city.id;


            /*
             * Outer circle
             */

            ctx.beginPath();

            ctx.arc(
                city.x,
                city.y,
                10,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                isStart
                    ? "#16a085"
                    : "#315efb";


            ctx.fill();


            /*
             * White center
             */

            ctx.beginPath();

            ctx.arc(
                city.x,
                city.y,
                4,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "white";

            ctx.fill();


            /*
             * City label
             */

            ctx.font =
                "bold 12px Arial";

            ctx.fillStyle =
                "#172033";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "bottom";


            ctx.fillText(
                city.name,
                city.x,
                city.y - 14
            );
        }
    }


    draw() {

        if (!this.ctx) {
            return;
        }


        this.ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );


        this.drawGrid();

        this.drawRoute();

        this.drawCities();
    }


    handleCanvasClick(event) {

        const rect =
            this.canvas.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


        this.addCity(x, y);
    }
}