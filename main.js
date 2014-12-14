var app = angular.module("soundicap",[]);
app.controller('MainCtrl',function($scope){

  var j = 0;
  var interval;
  $scope.beatVals={
    bd:2,
    sd:1,
    hh1:8,
    hh2:6,
    cym:1
  };

// select beats. Array is subdivided
var BDbeats = makeBeat($scope.beatVals.bd,16,[]);
var SDbeats = makeBeat($scope.beatVals.sd,16,[]);
var HH1beats = makeBeat($scope.beatVals.hh1,16,[]);
var HH2beats = makeBeat($scope.beatVals.hh2,16,[]);
var CYMbeats = makeBeat($scope.beatVals.cym,16,[]);
  $scope.$watch('beatVals',function(oldVal,newVal){
    console.log('changed');
    BDbeats = makeBeat($scope.beatVals.bd,16,BDbeats);
    SDbeats = makeBeat($scope.beatVals.sd,16,SDbeats);
    HH1beats = makeBeat($scope.beatVals.hh1,16,HH1beats);
    HH2beats = makeBeat($scope.beatVals.hh2,16,HH2beats);
    CYMbeats = makeBeat($scope.beatVals.cym,16,CYMbeats);
  },true)
var drumMachine = [];
var audio = T("audio").load("/drumkit.wav", function() {
  var BD  = this.slice(   0,  500).set({bang:false});
  var SD  = this.slice( 500, 1000).set({bang:false});
  var HH1 = this.slice(1000, 1500).set({bang:false, mul:0.2});
  var HH2 = this.slice(1500, 2000).set({bang:false, mul:0.2});
  var CYM = this.slice(2000).set({bang:false, mul:0.2});
  var scale = new sc.Scale([0,1,3,7,8], 12, "Pelog");
  drumMachine.push({beats:BDbeats,instrument:BD, name:'BD'});
  drumMachine.push({beats:SDbeats,instrument:SD, name:'SD'});
  drumMachine.push({beats:HH1beats,instrument:HH1, name:'HH1'});
  drumMachine.push({beats:HH2beats,instrument:HH2, name:'HH2'});
  drumMachine.push({beats:CYMbeats,instrument:CYM, name:'CYM'});
  var P2 = sc.series(16);

  var drum = T("lowshelf", {freq:110, gain:8, mul:0.6}, BD, SD, HH1, HH2, CYM).play();
  var lead = T("saw", {freq:T("param")});
  var vcf  = T("MoogFF", {freq:2400, gain:6, mul:0.1}, lead);
  var env  = T("perc", {r:100});
  var arp  = T("OscGen", {wave:"sin(19)", env:env, mul:0.5});

  console.log('p2 ', P2);

  T("delay", {time:"BPM128 L4", fb:0, mix:0.35},
    //T("pan", {pos:0.2}, vcf),
    T("pan", {pos:T("tri", {freq:"BPM111 L1", mul:0}).kr()}, arp)
  ).play();

  interval = T("interval", {interval:"BPM111 L16"}, function(i) {
    // if (i === 0) CYM.bang();

    // P1[i].forEach(function(p) { p.bang(); });

    // if (Math.random() < 0.015) {
    //   var j = (Math.random() * P1.length)|0;
    //   P1.wrapSwap(i, j);
    //   P2.wrapSwap(i, j);
    // }

    var noteNum = scale.wrapAt(P2.wrapAt(i)) + 60;
    for(var j = 0; j < drumMachine.length; j++){
      var currentInstr = drumMachine[j];
      if(currentInstr.beats[i%currentInstr.beats.length]>0){
        currentInstr.instrument.bang();
      }
      updateBeats(currentInstr.beats,i%currentInstr.beats.length,currentInstr.name,j);
    }
  });
  var play = false;
$scope.buttonPressed = function(){
  if(play){
    interval.stop();
    play=false;
  }else{
    interval.start();
    play=true;
  }

}

});



})

var width = 128 * 11;
var height = 128 * 1; 
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g");

function updateBeats(data, currentBeat, name, offset){
  var beatsn = svg.selectAll("rect."+name).data(data);

  // ENTER
  // Create new elements as needed.
  beatsn.enter().append("rect")
      .attr("class", name)
      .attr("y", 40+15*offset)
      .attr('height', 11)
      .attr('fill', 'red')
      .style("fill-opacity", 1);

  beatsn.attr("x", function(d, i) {
        if(d > 0){
          return 2 + i * 11;
        }
        return i * 11;
      })
      .attr('width', function(d, i) {
        if(d > 0){
          return 10;
        }
        return 11;
      })

  // EXIT
  // Remove old elements as needed.
  beatsn.exit()
      .remove();

  beatsn.attr("fill", function(d, i) { 
    if (i === currentBeat){
      return 'red';
    }
    else{
      return 'blue';
    }
  });

}
function makeBeat(steps,measure, inplace){
  var aggregator = 0;
  var stepf = measure/steps;
  var count = 0;
  var result = inplace || [];
  for(var i = 0; i < measure; i++){
      result[i] = 0;
  }
  while(aggregator < measure && count < steps){
    result[Math.floor(aggregator)]=10;
    aggregator+=stepf;
    count++;
  }
  console.log(result);
  return result;
}

