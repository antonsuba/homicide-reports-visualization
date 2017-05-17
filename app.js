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
        .attr('class', 'label')
        .attr("y", d => y(d.key) + y.rangeBand() / 8 + 4)
        .attr("x", 10)
        .text(d => d.value)
        .transition()
        .duration(1500)
        .attr("x", d => x(d.value) + 10);

    d3.select('#chart1-male-btn').on('click', () => {
        let widthArray = firstChartArray[1].map(d => x(d.value));
        updateHorizontalChart(firstChartArray[1], widthArray);
    });

    d3.select('#chart1-female-btn').on('click', () => {
        let widthArray = firstChartArray[0].map(d => x(d.value));
        updateHorizontalChart(firstChartArray[0], widthArray);
    });
}
);

function updateHorizontalChart(dataSet, widthArray){
    
    let counter = -1;
    let bars = d3.select("#relationship-graph").selectAll('.bar');

    bars.transition()
        .duration(1500)
        .attr('width', () => {
            counter++;
            return widthArray[counter];
        });

    dataSetCounter = -1;
    counter = -1;
    let labels = d3.select("#relationship-graph").selectAll('.label');

    labels.transition()
        .duration(1500)
        .text(() => {
            dataSetCounter++;
            return dataSet[dataSetCounter].value;
        })
        .attr('x', () => {
            counter++;
            return widthArray[counter] + 10;
        });
}


//=========================
// Initialize Second Chart
//=========================
d3.csv("data/VictimPerpetratorRaceAndSex.csv", (error, data) => {
    let svg = d3.select("#race-sex-svg"),
        margin = {top: 100, right: 100, bottom: 30, left: 20},
        width = +svg.attr("width"),
        height = +svg.attr("height") ,
        g = svg.append("g").attr("transform", "translate(" + margin.right + "," + 50 + ")");


    let y = d3.scaleBand()
        .rangeRound([0, width-200])
        .padding(0.6)
        .align(0.15);

    let x = d3.scaleLinear()
        .rangeRound([900-200, 0]);

    let vert = d3.scaleBand()
        .domain(["White Male", "White Female", "Native American/Alaska Native-Male", "Native American/Alska Native-Female","Black-Male","Black-Female", "Asian/Pacific Islander-Male","Asian/Pacific Islander-Female",])
        .rangeRound([0, width-200])
        .padding(0.6)
        .align(0.15);

    let yAxis = d3.axisRight()
        .tickSizeOuter(0)
        .scale(vert)
        

    let z = d3.scaleOrdinal()
        .range(["#0c0101", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ebf442","#364cbc"]);

    let stack = d3.stack()
        .offset(d3.stackOffsetExpand);

    if (error) throw error;
    console.log(data);
    data.sort(function(a, b) { return b[data.columns[1]] / b.total - a[data.columns[1]] / a.total; });

    y.domain(data.map(function(d) { return d.sex; }));
    z.domain(data.columns.slice(1));
  
    
    let serie = g.selectAll(".serie")
        .data(stack.keys(data.columns.slice(1))(data))
        .enter().append("g")
        .attr("class", "serie")
        .attr("fill", function(d) { return z(d.key); });

    serie.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("y", function(d) { return y(d.data.sex); })
        .attr("x", function(d) { return x(d[1]); })
        .attr("width", function(d) { return x(d[0]) - x(d[1]); })
        .attr("height", y.bandwidth())
        .attr("transform", "translate(0," + 0 + ")");

    g.append("g")
        .attr("class", "axis axis--x")
        .call(d3.axisTop(x).ticks(10,"%"))
        .attr("transforn", "scale(-1,1)")
        .style("text-anchor", "end")
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-180)")
        ;
    
    g.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(880," + 0 + ")")
        .attr("transform", "rotate(180,450,400)")
        .call(yAxis)

    let legend = g.selectAll(".legend")
        .data(data.columns.slice(1).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
        .style("font", "10px sans-serif");

    legend.append("rect")
        .attr("x", width + 25)
        .attr("transform", "translate(-1120,"+ 800+ ")")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", z);
        

    legend.append("text")
        .attr("text-anchor", "end")
        .text(function(d) { return d; })
        .attr("transform", "translate(200,"+ 5+ ")")
        .attr("transform", "rotate(180,15,402)");
    
});


//=========================
// Initialize Third Chart
//=========================
