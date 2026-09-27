class GeneticAlgorithm {

    constructor(
        tsp,
        populationSize = 100,
        mutationRate = 0.02,
        crossoverRate = 0.8,
        elitism = 2,
        selectionMethod = "tournament"
    ) {

        this.tsp = tsp;

        this.populationSize =
            populationSize;

        this.mutationRate =
            mutationRate;

        this.crossoverRate =
            crossoverRate;

        this.elitism =
            elitism;

        this.selectionMethod =
            selectionMethod;

        this.population = [];

        this.generation = 0;

        this.bestRoute = null;

        this.bestDistance = Infinity;

        this.initialDistance = null;
    }


    initialize() {

        this.population = [];

        this.generation = 0;

        this.bestRoute = null;

        this.bestDistance = Infinity;


        const cityCount =
            this.tsp.cities.length;


        if (cityCount < 2) {
            return;
        }


        for (
            let i = 0;
            i < this.populationSize;
            i++
        ) {

            const route =
                this.randomRoute(cityCount);

            this.population.push(route);
        }


        this.evaluatePopulation();
    }


    randomRoute(length) {

        const route =
            Array.from(
                { length },
                (_, index) => index
            );


        for (
            let i = route.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );


            [
                route[i],
                route[j]
            ] = [
                route[j],
                route[i]
            ];
        }


        return route;
    }


    evaluatePopulation() {

        let generationBestRoute = null;

        let generationBestDistance =
            Infinity;


        for (const route of this.population) {

            const distance =
                this.tsp.routeDistance(route);


            if (
                distance <
                generationBestDistance
            ) {

                generationBestDistance =
                    distance;

                generationBestRoute =
                    [...route];
            }
        }


        if (
            generationBestDistance <
            this.bestDistance
        ) {

            this.bestDistance =
                generationBestDistance;

            this.bestRoute =
                [...generationBestRoute];

            if (this.generation === 0) {

                this.initialDistance =
                    generationBestDistance;
            }
        }
    }


    tournamentSelection() {

        const tournamentSize = 3;

        let best = null;

        let bestDistance = Infinity;


        for (
            let i = 0;
            i < tournamentSize;
            i++
        ) {

            const randomIndex =
                Math.floor(
                    Math.random() *
                    this.population.length
                );


            const candidate =
                this.population[randomIndex];


            const distance =
                this.tsp.routeDistance(
                    candidate
                );


            if (
                distance <
                bestDistance
            ) {

                bestDistance =
                    distance;

                best =
                    candidate;
            }
        }


        return [...best];
    }


    rouletteSelection() {

        const fitnessValues =
            this.population.map(
                route =>
                    this.tsp.fitness(route)
            );


        const totalFitness =
            fitnessValues.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        let random =
            Math.random() *
            totalFitness;


        for (
            let i = 0;
            i < this.population.length;
            i++
        ) {

            random -=
                fitnessValues[i];


            if (random <= 0) {

                return [
                    ...this.population[i]
                ];
            }
        }


        return [
            ...this.population[
                this.population.length - 1
            ]
        ];
    }


    selectParent() {

        if (
            this.selectionMethod ===
            "roulette"
        ) {

            return this.rouletteSelection();

        }


        return this.tournamentSelection();
    }


    orderCrossover(parent1, parent2) {

        const length =
            parent1.length;


        if (length < 2) {
            return [...parent1];
        }


        const child =
            Array(length).fill(null);


        let start =
            Math.floor(
                Math.random() * length
            );


        let end =
            Math.floor(
                Math.random() * length
            );


        if (start > end) {

            [
                start,
                end
            ] = [
                end,
                start
            ];
        }


        // Copy section from parent 1

        for (
            let i = start;
            i <= end;
            i++
        ) {

            child[i] =
                parent1[i];
        }


        // Fill remaining positions
        // according to parent 2

        let currentIndex =
            (end + 1) % length;


        for (let i = 0; i < length; i++) {

            const gene =
                parent2[
                    (end + 1 + i) % length
                ];


            if (!child.includes(gene)) {

                child[currentIndex] =
                    gene;

                currentIndex =
                    (currentIndex + 1) %
                    length;
            }
        }


        return child;
    }


    mutate(route) {

        if (
            Math.random() >
            this.mutationRate
        ) {
            return;
        }


        const i =
            Math.floor(
                Math.random() *
                route.length
            );


        let j =
            Math.floor(
                Math.random() *
                route.length
            );


        while (j === i) {

            j =
                Math.floor(
                    Math.random() *
                    route.length
                );
        }


        [
            route[i],
            route[j]
        ] = [
            route[j],
            route[i]
        ];
    }


    createNextGeneration() {

        const newPopulation = [];


        /*
         * ELITISM
         */

        const sortedPopulation =
            [...this.population]
                .sort(
                    (a, b) =>
                        this.tsp.routeDistance(a) -
                        this.tsp.routeDistance(b)
                );


        const eliteCount =
            Math.min(
                this.elitism,
                this.populationSize
            );


        for (
            let i = 0;
            i < eliteCount;
            i++
        ) {

            newPopulation.push(
                [...sortedPopulation[i]]
            );
        }


        /*
         * CROSSOVER
         */

        while (
            newPopulation.length <
            this.populationSize
        ) {

            const parent1 =
                this.selectParent();

            const parent2 =
                this.selectParent();


            let child;


            if (
                Math.random() <
                this.crossoverRate
            ) {

                child =
                    this.orderCrossover(
                        parent1,
                        parent2
                    );

            } else {

                child =
                    [...parent1];
            }


            /*
             * MUTATION
             */

            this.mutate(child);


            newPopulation.push(child);
        }


        this.population =
            newPopulation;
    }


    nextGeneration() {

        if (
            !this.population ||
            this.population.length === 0
        ) {

            this.initialize();

            return;
        }


        this.createNextGeneration();


        this.generation++;


        this.evaluatePopulation();
    }


    getBestRoute() {

        return this.bestRoute
            ? [...this.bestRoute]
            : null;
    }


    getBestDistance() {

        return this.bestDistance;
    }
}