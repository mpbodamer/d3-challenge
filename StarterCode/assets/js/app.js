// @TODO: YOUR CODE HERE!
function adaptSizing() {

    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
      svgArea.remove();
    }

    var svgWidth = window.innerWidth*0.6;
    var svgHeight = svgWidth*0.5;
    var circleRadius = svgWidth*0.011; 
    var textSize = parseInt(svgWidth*0.009);

    var margin = {
        top: 20,
        right: 80,
        bottom: 100,
        left: 80
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    //create svg container
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);


    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var chosenXAxis = "poverty";

    var chosenYAxis ="healthcare";

    // make scalable
    
    function xScale(censusData, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
                 d3.max(censusData, d => d[chosenXAxis]) * 1.2])
            .range([0, width]);
        
        return xLinearScale;
    }

    function yScale(censusData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
                     d3.max(censusData, d => d[chosenYAxis]) * 1.2])
            .range([height, 0]);
        
        return yLinearScale;
    }

    // Update axis on click
    function updateXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        return xAxis;
    }


    function updateYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        
        return yAxis;
    }

    
    


    function drawCircles(circlesGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }

    function updateText(textGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {

      textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    

        return textGroup;
    }

    // updating the circles with the newly relevant text
    function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {

      var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
          if (chosenXAxis === "income"){
            return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]} USD<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
        
          } else if (chosenXAxis === "age"){
            return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
          }    
          else {
            return (`${d.state},${d.abbr}<br>${chosenXAxis}: ${d[chosenXAxis]}%<br>${chosenYAxis}: ${d[chosenYAxis]}%`); 
          }
        });
      
     
      circlesGroup.call(toolTip);

      circlesGroup.on("mouseover", function(d) {
        toolTip.show(d,this);
      })
      .on("mouseout", function(d, index) {
        toolTip.hide(d);
      });

      return circlesGroup;
    }

    // get Data
    d3.csv("assets/data/data.csv").then(function(censusData) {
    censusData.forEach(function(data) {
      
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;

      data.smokes = +data.smokes;
      data.age = +data.age;

      data.income = +data.income;
      data.obesity = +data.obesity;

      data.abbr = data.abbr;
    });
  
  var xLinearScale = xScale(censusData, chosenXAxis);

  var yLinearScale = yScale(censusData, chosenYAxis);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", circleR)
    .attr("fill", "pink");

  var textGroup = chartGroup.selectAll("text")
    .exit()
    .data(censusData)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("font-size", textsize+"px")
    .attr("text-anchor", "middle")
    .attr("class","stateText");
  
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

  
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("class","axis-text-x")
    .attr("value", "poverty") 
    .classed("active", true)
    .text("Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("class","axis-text-x")
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("class","axis-text-x")
    .attr("value", "income")
    .classed("inactive", true)
    .text("Income");

  
  var ylabelsGroup = chartGroup.append("g");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
    .attr("dy", "1em")
    .attr("class","axis-text-y")
    .classed("axis-text", true)
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Low Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", `translate(-60,${height / 2})rotate(-90)`)
    .attr("dy", "1em")
    .attr("class","axis-text-y")
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("transform", `translate(-80,${height / 2})rotate(-90)`)
    .attr("dy", "1em")
    .attr("class","axis-text-y")
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obesity (%)");

  labelsGroup.selectAll(".axis-text-x")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;

        xLinearScale = xScale(censusData, chosenXAxis);
        yLinearScale = yScale(censusData, chosenYAxis);


        xAxis = updateXAxis(xLinearScale, xAxis);

        circlesGroup = drawCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

        textGroup = updateText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            
        }
        else if (chosenXAxis === "poverty"){
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          
        }else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          
        }

      }
    });


  ylabelsGroup.selectAll(".axis-text-y")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

      chosenYAxis = value;


      xLinearScale = xScale(censusData, chosenXAxis);
      yLinearScale = yScale(censusData, chosenYAxis);
      yAxis = updateYAxis(yLinearScale, yAxis);

      circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

      textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

       
      if (chosenYAxis === "healthcare") {
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
    
      }else if (chosenYAxis === "smokes") {
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obesityLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      } else {
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);   
      }
    }
  });
});

}

adaptSizing();

d3.select(window).on("resize", adaptSizing);