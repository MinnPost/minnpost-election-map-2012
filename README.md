# MinnPost 2012 Election Map

A Minnesotan election map of candidates for 2012.

## Data

* District data processed with PVI values are at:
    * https://s3.amazonaws.com/data.minnpost/projects/minnpost-elections-map-2012/data/pvi_2012_leg.zip
    * https://s3.amazonaws.com/data.minnpost/projects/minnpost-elections-map-2012/data/pvi_2012_sen.zip

## Data processing

In order to work on tiles, link the maps into the TileMill directory:

```
cd data-processing/tiles/ && fab map:mn-state-leg link; cd -;
cd data-processing/tiles/ && fab map:mn-state-sen link; cd -;
```

(This is not necessary given switch to MapBox hosting)  To export the tiles to a tile set, run the following (with the Tilemill application running):

```
cd data-processing/tiles/ && fab map:mn-state-leg production export_deploy:32,3,12; cd -;
cd data-processing/tiles/ && fab map:mn-state-sen production export_deploy:32,3,12; cd -;
```
## Development and install

### Prerequisites

1. Install [Git](http://git-scm.com/).
1. Install [NodeJS](http://nodejs.org/).
1. Optionally, for development, install [Grunt](http://gruntjs.com/): `npm install -g grunt-cli`
1. Install [Bower](http://bower.io/): `npm install -g bower` 

### Install

1. Check out this code with [Git](http://git-scm.com/): `git clone https://github.com/MinnPost/minnpost-usi-fiber.git`
1. Go into the template directory: `cd minnpost-usi-fiber`
1. Install NodeJS packages: `npm install`
1. Install Bower components: `bower install`
1. Because Mapbox comes unbuilt, we need to build it: `cd bower_components/mapbox.js/ && npm install && make; cd -;`

### Development and Run Locally

* Run: `grunt server`
    * This will run a local webserver for development and you can view the application in your web browser at [http://localhost:8899](http://localhost:8899).
    * Utilize `index.html` for development, while `index-deploy.html` is used for the deployed version, and `index-build.html` is used to test the build before deployment.
    * The server runs `grunt watch` which will watch for linting JS files.  If you have your own webserver, feel free to use that with just this command.

### Build

1. Run: `grunt`

### Deploy

1. Run: `grunt mp-deploy`