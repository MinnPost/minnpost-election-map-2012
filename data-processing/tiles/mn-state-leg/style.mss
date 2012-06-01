Map {
  background-color: transparent;
}

@district_text: #FFFFFF;
@district_text_halo: darken(#FFFFFF, 50%);
@district_text_size: 12;
@district_text_font: "Helvetica Neue Bold";

@rep5: #330304; 
@rep4: #3B0304; 
@rep3: #4C0406; 
@rep2: #641a1b; 
@rep1: #7a2f30; 
@neutral: #9E9494; 
@dem1: #4B5B67; 
@dem2: #243746; 
@dem3: #20313F; 
@dem4: #1C2C38; 
@dem5: #192631; 

#pvi2012leg {
  line-color: darken(@neutral, 50%);
  line-width: 0.5;
  polygon-opacity: 0.8;
  polygon-fill: @neutral;
  /*
  ::label {
    text-name: "[DISTRICT]";
    text-face-name: @district_text_font;
    text-size: @district_text_size;
    text-fill: @district_text;
    text-halo-fill: @district_text_halo;
    text-halo-radius: 1;
    text-min-path-length: 50;
    text-avoid-edges: true;
    text-placement: interior;
  }
  */
}

#pvi2012leg[PVI >= -100] { polygon-fill:@dem5; } 
#pvi2012leg[PVI >= -50] { polygon-fill:@dem4; } 
#pvi2012leg[PVI >= -20] { polygon-fill:@dem3; } 
#pvi2012leg[PVI >= -10] { polygon-fill:@dem2; } 
#pvi2012leg[PVI >= -4] { polygon-fill:@dem1; } 
#pvi2012leg[PVI >= -0.5] { polygon-fill:@neutral; } 
#pvi2012leg[PVI >= 0.5] { polygon-fill:@rep1; } 
#pvi2012leg[PVI >= 4] { polygon-fill:@rep2; } 
#pvi2012leg[PVI >= 10] { polygon-fill:@rep3; } 
#pvi2012leg[PVI >= 20] { polygon-fill:@rep4; } 
#pvi2012leg[PVI >= 50] { polygon-fill:@rep5; }