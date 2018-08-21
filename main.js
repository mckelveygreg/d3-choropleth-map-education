const root = document.getElementById('root');
const URL_COUNTIES = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
const URL_USER_EDUCATION = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const urlArray = [d3.json(URL_COUNTIES), d3.json(URL_USER_EDUCATION)];
Promise.all(urlArray).then(result => buildGraph(result));

const buildGraph = data => {
    const us = data[0];
    const education = data[1];

    const margin = {top: 75, right: 20, bottom: 75, left: 20}
    const width = 1000 - margin.right - margin.left;
    const height = 700 - margin.top - margin.bottom;
    const svg = d3.select('#map')
                    .append('svg')
                    .attr('width', width + margin.right + margin.left)
                    .attr('height', height + margin.top + margin.bottom);
    const path = d3.geoPath();
    
    // Legend
    const maxEd = d3.max(education, d => d.bachelorsOrHigher);
    const minEd = d3.min(education, d => d.bachelorsOrHigher);
    console.log('max: ' + maxEd);
    console.log('min: ' + minEd);
 
    const legendWidth = 300
    const legendScale = d3.scaleLinear()
                            .domain([minEd, maxEd])
                            .range([0,legendWidth]);
    const legendAxis = d3.axisBottom(legendScale)
                            //.ticks(8)
                            .tickSize(20)
                            .tickFormat(d => d + '%');
    const legendContainer = svg.append('g')
                                .attr('id', 'legend')
                                .attr('width', legendWidth)
                                .attr('height', 50)
                                .attr('transform', `translate(560,40)`)
  
    const colors = d3.quantize(d3.interpolateBlues,10);
    
    const colorScale = d3.scaleSequential()
                        .domain(legendScale.domain())
                        .interpolator(d3.interpolateBlues);
    // linearGradient Legend
    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
                                .attr('id', 'linear-gradient');
    const legendColor = d3.scaleLinear()
                            .range(colors);
    linearGradient.selectAll('stop')
                    .data(legendColor.range())
                    .enter().append('stop')
                    .attr('offset', (d,i) => i/(legendColor.range().length-1))
                    .attr('stop-color', d => d);

    legendContainer.append('rect')
                    .attr('width', legendWidth)
                    .attr('height', 20)
                    .style('fill', 'url(#linear-gradient)');
    legendContainer.append('g')
                    .attr('transform', `translate(0,0)`)
                    .call(legendAxis);

    // tooltip
    const tooltip = d3.select('body')
                        .append('div')
                        .style('position', 'absolute')
                        .style('opacity', '0')
                        .text('filler text')
                        .attr('id', 'tooltip');
    
    // Counties
    svg.append('g').selectAll('path')
        .data(topojson.feature(us, us.objects.counties).features)
        .enter()
        .append('path')
        .attr('class', 'county')
        .attr('data-fips', (d,i) => d.id)
        .attr('data-education',(d, i) => education.find(fips => fips.fips == d.id).bachelorsOrHigher )
        .style('fill', d => colorScale(education.find(fips => fips.fips == d.id).bachelorsOrHigher ))
        .on('mouseover', (d,i) => {
            let edu = education.find(fips => fips.fips == d.id);
            tooltip.style('opacity', 0.8)
                    .attr('data-education', edu.bachelorsOrHigher)
                    .style('z-index', 10)
                    .html(`${edu.area_name}, ${edu.state} - ${edu.bachelorsOrHigher}%`)
                    .style('top', d3.event.pageY + 'px')
                    .style('left', (d3.event.pageX + 10) + 'px')
                })
        .on('mouseout', () => tooltip.style('opacity', 0).style('z-index', '-1'))
        .attr('d', path);

       // console.log(education.find(fips => fips.fips == d.id));

}

