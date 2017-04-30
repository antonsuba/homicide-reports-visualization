let width = 900,
    height = 450;

d3.csv('data/CrimeByRelationshipBySex.csv', (d) => {
    return {
        victim_sex: d.victim_sex,
        acquaintance_friend: d.Acquaintance_Friend,
        boyfriend_girlfriend: d.Boyfriend_Girlfriend,
        family: d.Family,
        spouse: d.Spouse,
        ex_spouse: d.Ex_Spouse,
        coworker: d.Coworker,
        neighbor: d.Neighbor,
        stranger: d.Stranger
    };
},
function (error, data){
    let maxData = 126000;

    let crimeByRelationshipBySex = d3.nest()
        .key((d) => d.victim_sex)
        .entries(data);

    let femaleData = [];
    let tempFemale = crimeByRelationshipBySex[0].values[0];
    for(let objKey of Object.keys(tempFemale)){
        if(objKey == 'victim_sex') continue;
        femaleData.push({ key:objKey, value:tempFemale[objKey] })
    }
    femaleData.sort((a,b) => b.value - a.value);

    console.log(femaleData);

    let svg = d3.select('#relationship-graph').append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr('transform', 'translate(150,0)');

    let x = d3.scale.linear()
        .domain([0, maxData])
        .range([0, width]);

    let y = d3.scale.ordinal()
        .rangeRoundBands([0, 500], .1)
        .domain(femaleData.map(d => d.key));

    let yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .orient('left');

    let horizontalChart = svg.append('g')
        .attr('class', 'yAxis')
        .call(yAxis);
    
    let bars = svg.selectAll('.bar')
        .data(femaleData)
        .enter()
        .append('g');

    bars.append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.key))
        .attr('height', 10)
        .attr('x', 0)
        .attr('width', d => x(d.value));

    bars.append('text')
        .attr("class", "label")
        .attr("y", d => y(d.key) + y.rangeBand() / 8 + 4)
        .attr("x", d => x(d.value) + 8)
        .text(d => d.value);
}
);
