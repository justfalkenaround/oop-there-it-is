'use strict';
/*_____ X _____*/

/*_____ OLD SYNTAX _____*/
function VectorOLD(x, y) {
    this.x = x;
    this.y = y;
}

VectorOLD.prototype.distance = function (v) {
    return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
}

/*_____ NEW SYNTAX _____*/
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distance(v) {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    }
}

/*_____ CREATE SOME SAMPLES _____*/
const OLD = new VectorOLD(5, 5);
const CURRENT = new Vector(10, 10);

/*_____ PERFORM DISTANCE CALCULATION _____*/
console.log(OLD.distance(CURRENT));
/*_____ OUTPUTS 7.0710678118654755 _____*/
console.log(CURRENT.distance(OLD));
/*_____ ALSO OUTPUTS 7.0710678118654755 _____*/