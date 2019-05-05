var MAP_THEMES = {"dark": "mapbox://styles/mapbox/dark-v10", "light": "mapbox://styles/mapbox/light-v10'"};

function create_map(container_id, center, zoom)
{
    mapboxgl.accessToken = 'pk.eyJ1IjoidGhldG94aWNraWxsZXIiLCJhIjoiY2p2M3o4YjJoMmtvYzQzczB6azR6NGNrcSJ9.JFN_wLRe2ssFx8QXkPK9kg';

    let map = new mapboxgl.Map({
        container: container_id,
        style: 'mapbox://styles/mapbox/light-v10',
        center: center,
        zoom: zoom
    });

    map.addControl(new mapboxgl.FullscreenControl());

    return map;
}

function animate_points(map, start, end, speed, geojson, maplayer, callback)
{
    function animateLine()
    {
        let dx = end[0] - geojson.features[0].geometry.coordinates[geojson.features[0].geometry.coordinates.length - 1][0];
        let dy = end[1] - geojson.features[0].geometry.coordinates[geojson.features[0].geometry.coordinates.length - 1][1];
        let h = Math.sqrt(dx * dx + dy * dy);

        dx *= speed;
        dy *= speed;

        let x = dx / h + geojson.features[0].geometry.coordinates[geojson.features[0].geometry.coordinates.length - 1][0];
        let y = dy / h + geojson.features[0].geometry.coordinates[geojson.features[0].geometry.coordinates.length - 1][1];


        // End animation once at destination
        if (h <= 0.5 * speed)
        {
            // Increase accuracy by setting last point to loc
            geojson.features[0].geometry.coordinates.push(end);
            map.getSource(maplayer).setData(geojson);
            return callback();
        }
        map.setCenter([x, y]);

        // append new coordinates to the lineString
        geojson.features[0].geometry.coordinates.push([x, y]);
        // then update the map
        map.getSource(maplayer).setData(geojson);

        // Request the next frame of the animation.
        requestAnimationFrame(animateLine);
    }

    animateLine()
}

function create_default_map_geojson(start)
{
    // Create a GeoJSON source with an empty lineString.
    let geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [start]
            }
        }]
    };
    return geojson;
}

function create_default_map_layer(map, geojson, line_color)
{
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
            'line-color': line_color,
            'line-width': 5,
            'line-opacity': .8
        }
    });
    return "line-animation";
}
/*
var map = create_map("map", [0, 0], 0.5);

map.on('load', function ()
{
    let start = [-79.66, 43.55];

    // Create a GeoJSON source with an empty lineString.
    let geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [start]
            }
        }]
    };

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
            'line-color': "#79fb2a",
            'line-width': 5,
            'line-opacity': .8
        }
    });

    animate_points(map, start, [0, 0], 1, geojson, "line-animation", function(){});

    //map.setStyle(MAP_THEMES.dark);
});*/