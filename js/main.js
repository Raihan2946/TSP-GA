document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * =========================
         * ELEMENTS
         * =========================
         */

        const canvas =
            document.getElementById(
                "mapCanvas"
            );


        const map =
            new MapManager(canvas);


        let tsp = null;

        let ga = null;

        let isRunning = false;

        let timer = null;

        let maxGenerations = 500;

        let history = [];

        let initialDistance = null;


        /*
         * =========================
         * DOM ELEMENTS
         * =========================
         */

        const cityCountInput =
            document.getElementById(
                "cityCount"
            );


        const populationInput =
            document.getElementById(
                "populationSize"
            );


        const generationInput =
            document.getElementById(
                "generations"
            );


        const crossoverInput =
            document.getElementById(
                "crossoverRate"
            );


        const mutationInput =
            document.getElementById(
                "mutationRate"
            );


        const elitismInput =
            document.getElementById(
                "elitism"
            );


        const selectionInput =
            document.getElementById(
                "selectionMethod"
            );


        const speedInput =
            document.getElementById(
                "speed"
            );


        const crossoverValue =
            document.getElementById(
                "crossoverValue"
            );


        const mutationValue =
            document.getElementById(
                "mutationValue"
            );


        const statusText =
            document.getElementById(
                "statusText"
            );


        /*
         * =========================
         * CHART
         * =========================
         */

        const chartContext =
            document
                .getElementById(
                    "convergenceChart"
                )
                .getContext("2d");


        const convergenceChart =
            new Chart(
                chartContext,
                {

                    type: "line",

                    data: {

                        labels: [],

                        datasets: [

                            {

                                label:
                                    "Best Distance",

                                data: [],

                                borderWidth: 2,

                                pointRadius: 0,

                                tension: 0.25

                            }

                        ]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        animation: false,

                        scales: {

                            x: {

                                title: {

                                    display: true,

                                    text:
                                        "Generation"

                                }

                            },

                            y: {

                                title: {

                                    display: true,

                                    text:
                                        "Distance"

                                }

                            }

                        }

                    }

                }
            );


        /*
         * =========================
         * SLIDERS
         * =========================
         */

        crossoverInput.addEventListener(
            "input",
            () => {

                crossoverValue.textContent =
                    Number(
                        crossoverInput.value
                    ).toFixed(2);
            }
        );


        mutationInput.addEventListener(
            "input",
            () => {

                mutationValue.textContent =
                    Number(
                        mutationInput.value
                    ).toFixed(2);
            }
        );


        /*
         * =========================
         * UPDATE UI
         * =========================
         */

        function updateCityCount() {

            document.getElementById(
                "cityCountDisplay"
            ).textContent =
                map.cities.length;
        }


        function updateGeneration() {

            const generation =
                ga
                    ? ga.generation
                    : 0;


            document.getElementById(
                "generationDisplay"
            ).textContent =
                generation;


            document.getElementById(
                "currentGeneration"
            ).textContent =
                generation;
        }


        function updateBestResult() {

            if (!ga) {
                return;
            }


            const distance =
                ga.getBestDistance();


            const route =
                ga.getBestRoute();


            if (
                !route ||
                !isFinite(distance)
            ) {
                return;
            }


            document.getElementById(
                "bestDistance"
            ).textContent =
                distance.toFixed(2);


            document.getElementById(
                "distanceDisplay"
            ).textContent =
                distance.toFixed(2);


            const routeNames =
                route.map(
                    index =>
                        map.cities[index].name
                );


            routeNames.push(
                routeNames[0]
            );


            document.getElementById(
                "routeDisplay"
            ).textContent =
                routeNames.join(
                    " → "
                );


            /*
             * Improvement
             */

            if (
                initialDistance &&
                initialDistance > 0
            ) {

                const improvement =
                    (
                        (
                            initialDistance -
                            distance
                        ) /
                        initialDistance
                    ) *
                    100;


                document.getElementById(
                    "improvement"
                ).textContent =
                    improvement.toFixed(2) +
                    "%";
            }


            map.setRoute(route);
        }


        function updateChart() {

            convergenceChart.data.labels =
                history.map(
                    item =>
                        item.generation
                );


            convergenceChart.data.datasets[0].data =
                history.map(
                    item =>
                        item.distance
                );


            convergenceChart.update();
        }


        /*
         * =========================
         * CREATE GA
         * =========================
         */

        function createGA() {

            if (
                map.cities.length < 3
            ) {

                alert(
                    "Minimal diperlukan 3 kota."
                );

                return false;
            }


            const populationSize =
                Number(
                    populationInput.value
                );


            const mutationRate =
                Number(
                    mutationInput.value
                );


            const crossoverRate =
                Number(
                    crossoverInput.value
                );


            const elitism =
                Number(
                    elitismInput.value
                );


            const selectionMethod =
                selectionInput.value;


            tsp =
                new TSP(
                    map.cities
                );


            ga =
                new GeneticAlgorithm(

                    tsp,

                    populationSize,

                    mutationRate,

                    crossoverRate,

                    elitism,

                    selectionMethod
                );


            ga.initialize();


            maxGenerations =
                Number(
                    generationInput.value
                );


            history = [];


            initialDistance =
                ga.getBestDistance();


            history.push({

                generation:
                    ga.generation,

                distance:
                    ga.getBestDistance()

            });


            updateGeneration();

            updateBestResult();

            updateChart();


            document.getElementById(
                "populationDisplay"
            ).textContent =
                populationSize;


            return true;
        }


        /*
         * =========================
         * ONE GENERATION
         * =========================
         */

        function runGeneration() {

            if (!ga) {
                return;
            }


            if (
                ga.generation >=
                maxGenerations
            ) {

                stopSimulation();

                statusText.textContent =
                    "Finished";

                return;
            }


            ga.nextGeneration();


            history.push({

                generation:
                    ga.generation,

                distance:
                    ga.getBestDistance()

            });


            updateGeneration();

            updateBestResult();

            updateChart();
        }


        /*
         * =========================
         * START
         * =========================
         */

        function startSimulation() {

            if (!ga) {

                const created =
                    createGA();


                if (!created) {
                    return;
                }
            }


            if (
                ga.generation >=
                maxGenerations
            ) {

                return;
            }


            isRunning = true;

            statusText.textContent =
                "Running";


            clearInterval(timer);


            const interval =
                Number(
                    speedInput.value
                );


            timer =
                setInterval(
                    () => {

                        if (
                            ga.generation >=
                            maxGenerations
                        ) {

                            stopSimulation();

                            statusText.textContent =
                                "Finished";

                            return;
                        }


                        runGeneration();

                    },
                    interval
                );
        }


        /*
         * =========================
         * PAUSE
         * =========================
         */

        function stopSimulation() {

            isRunning = false;

            clearInterval(timer);

            timer = null;

            statusText.textContent =
                "Paused";
        }


        /*
         * =========================
         * RESET
         * =========================
         */

        function resetSimulation() {

            stopSimulation();


            ga = null;

            tsp = null;

            history = [];

            initialDistance = null;


            map.setRoute(null);


            convergenceChart.data.labels =
                [];

            convergenceChart.data.datasets[0].data =
                [];

            convergenceChart.update();


            document.getElementById(
                "generationDisplay"
            ).textContent =
                "0";


            document.getElementById(
                "currentGeneration"
            ).textContent =
                "0";


            document.getElementById(
                "bestDistance"
            ).textContent =
                "-";


            document.getElementById(
                "distanceDisplay"
            ).textContent =
                "-";


            document.getElementById(
                "improvement"
            ).textContent =
                "-";


            document.getElementById(
                "routeDisplay"
            ).textContent =
                "Tambahkan kota untuk memulai.";


            statusText.textContent =
                "Ready";
        }


        /*
         * =========================
         * RANDOM CITIES
         * =========================
         */

        document
            .getElementById(
                "randomCitiesBtn"
            )
            .addEventListener(
                "click",
                () => {

                    stopSimulation();


                    const count =
                        Number(
                            cityCountInput.value
                        );


                    map.randomCities(
                        count
                    );


                    resetSimulation();


                    updateCityCount();
                }
            );


        /*
         * =========================
         * CLEAR MAP
         * =========================
         */

        document
            .getElementById(
                "clearCitiesBtn"
            )
            .addEventListener(
                "click",
                () => {

                    stopSimulation();

                    map.clear();

                    resetSimulation();

                    updateCityCount();
                }
            );


        /*
         * =========================
         * CANVAS CLICK
         * =========================
         */

        canvas.addEventListener(
            "click",
            event => {

                if (isRunning) {
                    return;
                }


                map.handleCanvasClick(
                    event
                );


                updateCityCount();


                /*
                 * Reset GA karena map
                 * berubah
                 */

                ga = null;

                tsp = null;

                history = [];

                initialDistance = null;


                convergenceChart.data.labels =
                    [];

                convergenceChart.data.datasets[0].data =
                    [];

                convergenceChart.update();


                document.getElementById(
                    "generationDisplay"
                ).textContent =
                    "0";


                document.getElementById(
                    "currentGeneration"
                ).textContent =
                    "0";


                document.getElementById(
                    "bestDistance"
                ).textContent =
                    "-";


                document.getElementById(
                    "distanceDisplay"
                ).textContent =
                    "-";


                document.getElementById(
                    "routeDisplay"
                ).textContent =
                    "Map siap untuk simulasi.";
            }
        );


        /*
         * =========================
         * START BUTTON
         * =========================
         */

        document
            .getElementById(
                "startBtn"
            )
            .addEventListener(
                "click",
                () => {

                    startSimulation();
                }
            );


        /*
         * =========================
         * PAUSE BUTTON
         * =========================
         */

        document
            .getElementById(
                "pauseBtn"
            )
            .addEventListener(
                "click",
                () => {

                    stopSimulation();
                }
            );


        /*
         * =========================
         * STEP BUTTON
         * =========================
         */

        document
            .getElementById(
                "stepBtn"
            )
            .addEventListener(
                "click",
                () => {

                    if (!ga) {

                        const created =
                            createGA();


                        if (!created) {
                            return;
                        }
                    }


                    if (
                        ga.generation <
                        maxGenerations
                    ) {

                        runGeneration();

                        statusText.textContent =
                            "Step Mode";
                    }
                }
            );


        /*
         * =========================
         * RESET BUTTON
         * =========================
         */

        document
            .getElementById(
                "resetBtn"
            )
            .addEventListener(
                "click",
                () => {

                    resetSimulation();
                }
            );


        /*
         * =========================
         * INITIALIZATION
         * =========================
         */

        map.randomCities(10);

        updateCityCount();

    }
);