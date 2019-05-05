mapboxgl.accessToken = 'pk.eyJ1IjoidGhldG94aWNraWxsZXIiLCJhIjoiY2p2M3o4YjJoMmtvYzQzczB6azR6NGNrcSJ9.JFN_wLRe2ssFx8QXkPK9kg';
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-79.66, 43.55],
    zoom: 0.5
});

map.addControl(new mapboxgl.FullscreenControl());

let start = [-79.66, 43.55];
let goto = [0, 0];

// Create a GeoJSON source with an empty lineString.
let geojson = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                start
            ]
        }
    }]
};

let speedFactor = 30; // number of frames per longitude degree
let animation; // to store and cancel the animation
let startTime = 0;
let progress = 0; // progress = timestamp - startTime
let resetTime = false; // indicator of whether time reset is needed for the animation
let pauseButton = document.getElementById('pause');

map.on('load', function ()
{

    // add the line which will be modified in the animation
    map.addLayer({
        'id': 'line-animation',
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': geojson
        },
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-color': '#79fb2a',
            'line-width': 5,
            'line-opacity': .8
        }
    });

    startTime = performance.now();

    animateLine();

    // click the button to pause or play
    pauseButton.addEventListener('click', function ()
    {
        pauseButton.classList.toggle('pause');
        if (pauseButton.classList.contains('pause'))
        {
            cancelAnimationFrame(animation);
        } else
        {
            resetTime = true;
            animateLine();
        }
    });

    // reset startTime and progress once the tab loses or gains focus
    // requestAnimationFrame also pauses on hidden tabs by default
    document.addEventListener('visibilitychange', function ()
    {
        resetTime = true;
    });

    // animated in a circle as a sine wave along the map.
    function animateLine(timestamp)
    {
        if (resetTime)
        {
            // resume previous progress
            startTime = performance.now() - progress;
            resetTime = false;
        } else
        {
            progress = timestamp - startTime;
        }

        let dx = goto[0] - geojson.features[0].geometry.coordinates[geojson.features[0].geometry.coordinates.length - 1][0];
        let dy = goto[1] - geojson.features[0].geometry.coordinates[geojson.features[0].geometry.coordinates.length - 1][1];
        let h = Math.sqrt(dx * dx + dy * dy);
        let x = dx / h + geojson.features[0].geometry.coordinates[geojson.features[0].geometry.coordinates.length - 1][0];
        let y = dy / h + geojson.features[0].geometry.coordinates[geojson.features[0].geometry.coordinates.length - 1][1];

        // If we've reached our destination +/- 0.5 lat/long
        if (h < 0.5) return;

        // append new coordinates to the lineString
        geojson.features[0].geometry.coordinates.push([x, y]);
        // then update the map
        map.getSource('line-animation').setData(geojson);

        // Request the next frame of the animation.
        animation = requestAnimationFrame(animateLine);
    }

});