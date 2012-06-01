# MinnPost 2012 Election Map

A Minnesotan election map of candidates for 2012.

## Data processing

In order to work on tiles, link the maps into the TileMill directory:

```
cd date-processing/tiles/ && fab map:mn-state-leg link; cd -;
cd date-processing/tiles/ && fab map:mn-state-sen link; cd -;
```

To export the tiles, run the following:

```
cd date-processing/tiles/ && fab map:mn-state-leg production export_deploy:32,3,12; cd -;
cd date-processing/tiles/ && fab map:mn-state-sen production export_deploy:32,3,12; cd -;
```

## Visualization

Visit ```visualizations/index.html``` in a browser.