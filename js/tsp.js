class TSP {

    constructor(cities) {

        this.cities = cities;

        this.distanceMatrix = [];

        this.calculateDistanceMatrix();
    }


    calculateDistance(cityA, cityB) {

        const dx = cityA.x - cityB.x;

        const dy = cityA.y - cityB.y;

        return Math.sqrt(
            dx * dx +
            dy * dy
        );
    }


    calculateDistanceMatrix() {

        const n = this.cities.length;

        this.distanceMatrix =
            Array.from(
                { length: n },
                () => Array(n).fill(0)
            );


        for (let i = 0; i < n; i++) {

            for (let j = i + 1; j < n; j++) {

                const distance =
                    this.calculateDistance(
                        this.cities[i],
                        this.cities[j]
                    );


                this.distanceMatrix[i][j] =
                    distance;

                this.distanceMatrix[j][i] =
                    distance;
            }
        }
    }


    routeDistance(route) {

        if (
            !route ||
            route.length === 0
        ) {
            return Infinity;
        }


        let totalDistance = 0;


        for (
            let i = 0;
            i < route.length - 1;
            i++
        ) {

            totalDistance +=
                this.distanceMatrix[
                    route[i]
                ][
                    route[i + 1]
                ];
        }


        // kembali ke kota awal

        totalDistance +=
            this.distanceMatrix[
                route[route.length - 1]
            ][
                route[0]
            ];


        return totalDistance;
    }


    fitness(route) {

        const distance =
            this.routeDistance(route);

        if (distance === 0) {
            return Infinity;
        }

        return 1 / distance;
    }
}