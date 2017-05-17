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
}

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

renderFirstChart();


//=========================
// Initialize Second Chart
//=========================
function renderSecondChart(){
    
}


//=========================
// Initialize Third Chart
//=========================
function renderThirdChart(){
    let active = 0;
            
    function mapbutton1(){
        selectActive(0);
        updateMap(usMapData);
    }
    function mapbutton2(){
        selectActive(1);
        updateMap(usMapData);
    }
    function mapbutton3(){
        selectActive(2);
        updateMap(usMapData);
    }

    function selectActive(num){
        let buttons = document.getElementsByClassName('map-button');
        for(i = 0; i < buttons.length; i++){
            buttons[i].classList.remove('active-button');
        }
        buttons[num].classList.add('active-button');
        active = num;
    }

    let dataVisualized = 0;
            
    let canvas = d3.select('#murder-rate-graph').append('svg')
                    .attr('width', 900)
                    .attr('height', 500)
                    .attr('align', 'center');

    let group = canvas.append('g').attr('class', 'states');

    let states = d3.map();

    let color1 = d3.scale.linear()
                    .domain([30,80])
                    .range(['#ff8c8c', '#724432']);

    let color2 = d3.scale.linear()
                    .domain([0,10])
                    .range(['#689ef9', '#233a60']);
                    
    let color3 = d3.scale.linear()
                    .domain([1,13])
                    .range(['#d1a262', '#4c391f']);

    let projection = d3.geo.albersUsa().scale(1000).translate([480, 250]);
    let path = d3.geo.path().projection(projection);
    let tooltip = d3.select('body').append('div').attr('id', 'tooltip').attr('class', 'hidden');

    let usMapData;
    let murderByState;

    d3.queue()
        .defer(d3.json, "data/USA.geojson")
        .defer(d3.csv, "data/MurdersByState.csv", function(d){
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

    function updateMap(data){
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
                d3.select(this).style('fill-opacity', 0.7);
                let mouse = d3.mouse(canvas.node()).map(function(d){
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
                d3.selectAll('.states path').style('fill-opacity', 1);
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
                d3.select(this).style('fill-opacity', 0.7);
                let mouse = d3.mouse(canvas.node()).map(function(d){
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
                d3.selectAll('.states path').style('fill-opacity', 1);
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
                d3.select(this).style('fill-opacity', 0.7);
                let mouse = d3.mouse(canvas.node()).map(function(d){
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
                d3.selectAll('.states path').style('fill-opacity', 1);
                tooltip.classed('hidden', true);
            });
    }
}
