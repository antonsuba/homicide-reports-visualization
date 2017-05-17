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
function renderFirstChart(){
    d3_v3.csv('data/CrimeByRelationshipBySex.csv', d => {
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

        let crimeByRelationshipBySex = d3_v3.nest()
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

        let svg = d3_v3.select('#relationship-graph').append('svg')
            .attr("width", width)
            .attr("height", height)
            .attr('transform', `translate(${margin.left}, 0)`);

        let x = d3_v3.scale.linear()
            .domain([0, maxData])
            .range([0, width - margin.right]);

        let y = d3_v3.scale.ordinal()
            .rangeRoundBands([0, height], .1)
            .domain(firstChartArray[firstChartState].map(d => d.key));

        let yAxis = d3_v3.svg.axis()
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

        d3_v3.select('#chart1-male-btn').on('click', () => {
            let widthArray = firstChartArray[1].map(d => x(d.value));
            updateHorizontalChart(firstChartArray[1], widthArray);
        });

        d3_v3.select('#chart1-female-btn').on('click', () => {
            let widthArray = firstChartArray[0].map(d => x(d.value));
            updateHorizontalChart(firstChartArray[0], widthArray);
        });
    }
    );
}

function updateHorizontalChart(dataSet, widthArray){
    
    let counter = -1;
    let bars = d3_v3.select("#relationship-graph").selectAll('.bar');

    bars.transition()
        .duration(1500)
        .attr('width', () => {
            counter++;
            return widthArray[counter];
        });

    dataSetCounter = -1;
    counter = -1;
    let labels = d3_v3.select("#relationship-graph").selectAll('.label');

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
function renderSecondChart(){
    let svg = d3_v4.select("#race-sex-svg"),
        margin = {top: 0, right: 100, bottom: 30, left: 20},
        width = +svg.attr("width"),
        height = +svg.attr("height") ,
        g = svg.append("g").attr("transform", "translate(" + margin.right + "," + 50 + ")");


    let y = d3_v4.scaleBand()
        .rangeRound([0, width - 500])
        .padding(0.6)
        .align(0.15);

    let x = d3_v4.scaleLinear()
        .rangeRound([900-200, 0]);

    let vert = d3_v4.scaleBand()
      //  .domain(["White Male", "White Female", "Native American/Alaska Native-Male", "Native American/Alska Native-Female","Black-Male","Black-Female", "Asian/Pacific Islander-Male","Asian/Pacific Islander-Female",])
        .domain(["Asian/Pacific Islander-Female","Asian/Pacific Islander-Male","Black-Female","Black-Male","Native American/Alska Native-Female","Native American/Alaska Native-Male","White Female","White Male",])
        .rangeRound([0, width - 500])
        .padding(0.5)
        .align(0.15);

    let yAxis = d3_v4.axisRight()
        .tickSizeOuter(0)
        .scale(vert)
        

    let z = d3_v4.scaleOrdinal()
        .range(["#0c0101", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ebf442","#364cbc"]);

    let stack = d3_v4.stack()
        .offset(d3_v4.stackOffsetExpand);



    d3_v4.csv("data/VictimPerpetratorRaceAndSex.csv", function(error, data) {
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
        .attr("transform", "translate(100," + 425 + ")");

    g.append("g")
        .attr("class", "axis axis--x")
        .call(d3_v4.axisTop(x).ticks(10,"%"))
        .style("text-anchor", "end")
        .attr("transform", "translate(100," + 420+ ")")
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-180,-10,-15)");
    
    g.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(800,"+415+")")
        .call(yAxis)
        .selectAll("text")
        .attr("transform", "rotate(180,95,0)");

    let legend = g.selectAll(".legend")
        .data(data.columns.slice(1).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
        .style("font", "10px sans-serif");

    legend.append("rect")
        .attr("x", width + 25)
        .attr("transform", "translate(-1120,"+ 790+ ")")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", z);

     legend.append("text")
        // .attr("x", width + 25)
        // .attr("y", 9)
        //.attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function(d) { return d; })
        .attr("transform", "translate(200,"+ 5+ ")")
        .attr("transform", "rotate(180,15,397)");
        
    });
}


//=========================
// Initialize Third Chart
//=========================
let active = 0;
            
function mapbutton1(){
    document.getElementById('murder-rate-title').innerHTML = 'Percentage of Murders Caused by Gun';
    document.getElementById('murder-rate-text').innerHTML = 
        `This data was calculated by summing up all recorded murders in each state
	    (from 1980-2014) where the murder weapon used was a gun and dividing the
	    values by the total number of recorded murders for each respective state.
	    This should give us a good idea of which states have been more prone to
	    gun violence historically.`;

    selectActive(0);
    renderThirdChart.updateMap();
}
function mapbutton2(){
    document.getElementById('murder-rate-title').innerHTML = 'Gun Murder Rate per 100 000';
    document.getElementById('murder-rate-text').innerHTML = 
        `This data was calculated by getting the number of gun-related murders per
	    100,000 for each state. This was calculated for each state yearly from
	    1980-2014 so the average rate could be taken. The yearly changes of population 
	    for each state were also taken into consideration. The population data was 
	    obtained <a href="http://www.nber.org/data/census-intercensal-county-population.html">here</a>.`;

    selectActive(1);
    renderThirdChart.updateMap();
}
function mapbutton3(){
    let x = 'anton';
    let y = `hi ${x}`;

    document.getElementById('murder-rate-title').innerHTML = 'Murder Rate per 100 000';
    document.getElementById('murder-rate-text').innerHTML = 
        `This data was calculated by getting the number of all murders per 100,000 
	    for each state. This was calculated for each state yearly from 1980-2014 
	    so the average rate could be taken. The yearly changes of population for
	    each state were also taken into consideration. The population data was 
    	obtained <a>here</a>.`;

    selectActive(2);
    renderThirdChart.updateMap();
}

function selectActive(num){
    let buttons = document.getElementsByClassName('map-button');
    for(i = 0; i < buttons.length; i++){
        buttons[i].classList.remove('active-button');
    }
    buttons[num].classList.add('active-button');
    active = num;
}

function renderThirdChart(){
    let dataVisualized = 0;
            
    let canvas = d3_v3.select('#murder-rate-graph').append('svg')
                    .attr('width', 900)
                    .attr('height', 500)
                    .attr('align', 'center');

    let group = canvas.append('g').attr('class', 'states');

    let states = d3_v3.map();

    let color1 = d3_v3.scale.linear()
                    .domain([30,80])
                    .range(['#ff8c8c', '#724432']);

    let color2 = d3_v3.scale.linear()
                    .domain([0,10])
                    .range(['#689ef9', '#233a60']);
                    
    let color3 = d3_v3.scale.linear()
                    .domain([1,13])
                    .range(['#d1a262', '#4c391f']);

    let projection = d3_v3.geo.albersUsa().scale(1000).translate([480, 250]);
    let path = d3_v3.geo.path().projection(projection);
    let tooltip = d3_v3.select('body').append('div').attr('id', 'tooltip').attr('class', 'hidden');

    let usMapData;
    let murderByState;

    d3_v3.queue()
        .defer(d3_v3.json, "data/USA.geojson")
        .defer(d3_v3.csv, "data/MurdersByState.csv", function(d){
            states.set(d.state, [+d.GunMurderPercentage, +d.GunMurdersPer100000, +d.MurdersPer100000])
        })
        .await(makeMap);

    function makeMap(error, us, mbs){	
        usMapData = us.features;
        murderByState = mbs;
                    
        group.selectAll('path')
            .data(us.features)
            .enter()
            .append('path')
            .attr('name', function(d){return d.properties.NAME})
            .attr('d', path)
            .attr('stroke-width', 1)
            .attr('stroke', '#FFFFFF');
            
        updateMap(usMapData);
    };

    function updateMap(data = usMapData){
        if(active == 0){
            percentMurderByGun(data);
        } else if (active == 1){
            gunMurders(data);
        } else if (active == 2){
            murders(data);
        }
    }

    function percentMurderByGun(data){
        group.selectAll('path')
            .data(data)
            .attr('fill', function(d){
                return color1(states.get(d.properties.NAME)[0]);
            })
            .on('mousemove', function(d,i){
                console.log('hit');
                d3_v3.select(this).style('fill-opacity', 0.7);
                let mouse = d3_v3.mouse(canvas.node()).map(function(d){
                    return parseInt(d);
                });
                tooltip.classed('hidden', false)
                    .attr('style', 'left:'+(mouse[0]+15)+'px; top:'+(mouse[1]+25)+'px;')
                    .html(d.properties.NAME + 
                            '<br>' + '<br>' + 
                            'Guns were used in ' + states.get(d.properties.NAME)[0].toFixed(2)+'% of' +
                            '<br>' +
                            'all recorded murders in ' + d.properties.NAME +
                            '<br>' +
                            'from 1980-2014.');
            })
            .on('mouseout', function(d,i){
                d3_v3.selectAll('.states path').style('fill-opacity', 1);
                tooltip.classed('hidden', true);
            });
    }

    function gunMurders(data){
        group.selectAll('path')
            .data(data)
            .attr('fill', function(d){
                return color2(states.get(d.properties.NAME)[1]);
            })
            .on('mousemove', function(d,i){
                console.log('hit');
                d3_v3.select(this).style('fill-opacity', 0.7);
                let mouse = d3_v3.mouse(canvas.node()).map(function(d){
                    return parseInt(d);
                });
                tooltip.classed('hidden', false)
                    .attr('style', 'left:'+(mouse[0]+15)+'px; top:'+(mouse[1]+25)+'px;')
                    .html(d.properties.NAME + 
                            '<br>' + '<br>' + 
                            states.get(d.properties.NAME)[1].toFixed(2) + ' gun murders' +
                            '<br>' +
                            'per 100,000 on average' +
                            '<br>' +
                            'from 1980-2014');
            })
            .on('mouseout', function(d,i){
                d3_v3.selectAll('.states path').style('fill-opacity', 1);
                tooltip.classed('hidden', true);
            });
    }

    function murders(data){
        group.selectAll('path')	
            .data(data)
            .attr('fill', function(d){
                return color3(states.get(d.properties.NAME)[2]);
            })
            .on('mousemove', function(d,i){
                console.log('hit');
                d3_v3.select(this).style('fill-opacity', 0.7);
                let mouse = d3_v3.mouse(canvas.node()).map(function(d){
                    return parseInt(d);
                });
                tooltip.classed('hidden', false)
                    .attr('style', 'left:'+(mouse[0]+15)+'px; top:'+(mouse[1]+25)+'px;')
                    .html(d.properties.NAME + 
                            '<br>' + '<br>' + 
                            states.get(d.properties.NAME)[2].toFixed(2) + ' murders per' +
                            '<br>' +
                            '100,000 on average' +
                            '<br>' +
                            'from 1980-2014.');
            })
            .on('mouseout', function(d,i){
                d3_v3.selectAll('.states path').style('fill-opacity', 1);
                tooltip.classed('hidden', true);
            });
    }

    renderThirdChart.updateMap = updateMap;
}

renderFirstChart();
renderSecondChart();
renderThirdChart();