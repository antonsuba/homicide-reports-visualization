//=========================
// Global Vars
//=========================
let width = 820,
    height = 450;

let firstChartState = 1;
let firstChartArray = [[],[]];


//=========================
// Initialize First Chart
//=========================
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
    let margin = {
        left:70,
        right:70
    }

    let crimeByRelationshipBySex = d3.nest()
        .key((d) => d.victim_sex)
        .entries(data);

    for(let i = 0; i < 2; i++){
        let tempArray = crimeByRelationshipBySex[i].values[0];

        for(let objKey of Object.keys(tempArray)){
            if(objKey == 'victim_sex') continue;
            firstChartArray[i].push({ key:objKey, value:tempArray[objKey] })
        }
        firstChartArray[i].sort((a,b) => b.value - a.value);
    }


    console.log("firstChartArray ", firstChartArray);

    let svg = d3.select('#relationship-graph').append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr('transform', `translate(${margin.left}, 0)`);

    let x = d3.scale.linear()
        .domain([0, maxData])
        .range([0, width - margin.right]);

    let y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1)
        .domain(firstChartArray[firstChartState].map(d => d.key));

    let yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .orient('left');

    let horizontalChart = svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
    
    let bars = svg.selectAll('.bar')
        .data(firstChartArray[firstChartState])
        .enter()
        .append('g');

    bars.append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.key))
        .attr('height', 8)
        .attr('x', 0)
        .attr('width', 0)
        .transition()
        .duration(1500)
        .attr('width', d => x(d.value));

    bars.append('text')
        .attr("class", "label")
        .attr("y", d => y(d.key) + y.rangeBand() / 8 + 4)
        .attr("x", 10)
        .text(d => d.value)
        .transition()
        .duration(1500)
        .attr("x", d => x(d.value) + 10);
}
);

function updateHorizontalChart(){
    if(firstChartState == 1) firstChartState = 0;
    else firstChartState = 1;

    let bars = d3.selectAll('.bar')
        .data(firstChartArray[firstChartState])
        .enter();

    bars.transition()
        .duration(1500)
        .attr('width', d => x(d.value));
}
