var exampledata3 = [];
for (let i = 1; i < 255; i++) {
    let umin = 0;
    let umax = 400;
    let uval = (Math.random() * (umax - umin)) + umin;
    let imin = 0;
    let imax = 10;
    let ival = (Math.random() * (imax - imin)) + imin;
    exampledata3.push({
        id: i,
        u: uval,
        i: ival,
        p: uval * ival
    });
}

