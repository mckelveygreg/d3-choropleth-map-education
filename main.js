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
    const svg = d3.select(root)
                    .append('svg')
                    .attr('width', width + margin.right + margin.left)
                    .attr('height', height + margin.top + margin.bottom);
                    
    // topo test
    const projection = d3.geoEquirectangular()
                        .scale(25)
                        .translate([width/2, height/2])
                        .rotate([-180,0]);

    const path = d3.geoPath();
                    //.projection(projection);
    svg.append('g').selectAll('path')
        .data(topojson.feature(us, us.objects.counties).features)
        .enter()
        .append('path')
        .attr('class', 'land')
        .attr('d', path);
}

