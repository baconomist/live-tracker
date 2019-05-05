server_ip = "http://142.1.2.242:4200";

let package_template =
    `
<div class="package" id="0">

    <div class='package-map' id="map" style="position: relative"></div>
    
    <div class="package-info">
    
        <p class="package-status">Status: <em class="transit">In Transit</em></p>
    
        <p class="package-number">Tracking number: <em style="font-weight: bold">aaa</em></p>
    
        <input class="delete-package-btn" type="image" src="static/trash.png" onclick="removePackage()">
    
    </div>

</div>

`;

let packages = [];

class Pckg
{
    constructor(map, jquery_obj, animations)
    {
        this.map = map;
        this.jquery_obj = jquery_obj;
        this.animations = animations;
        this.current_animation = 0;

        this.geojson = null;
        this.maplayer = null;
    }

    animate(speed)
    {
        if(this.geojson == null)
        {
            this.geojson = create_default_map_geojson(this.animations[0][1]);
            this.maplayer = create_default_map_layer(this.map, this.geojson, "#79fb2a");
        }

        if(this.current_animation + 1 >= this.animations.length) return;

        console.log("aaaaaaaaaaaaaa");

        let instance = this;
        animate_points(this.animations[this.current_animation][0], this.animations[this.current_animation][1], this.animations[this.current_animation][2], speed, this.geojson, this.maplayer, function ()
        {
            instance.animate(speed);
        });
        this.current_animation++;
    }
}

function create_package(package_data)
{
    for (let i = 0; i < package_data["locations"].length; i++)
    {
        let x = package_data["locations"][i][0];
        let y = package_data["locations"][i][1];
        // Flip lat and long for client-side map
        package_data["locations"][i][1] = x;
        package_data["locations"][i][0] = y;
    }

    let package_obj = $(package_template);
    package_obj.attr("id", package_data["number"]);
    //package_obj.find(".package-info").find(".package-status").find("em").innerHTML = package_data["status"];
    //package_obj.find(".package-info").find(".package-status").find("em").attr("class", package_data["status"]);
    package_obj.find(".package-info").find("package-number").find("em").innerHTML = package_data["number"];

    package_obj.find(".package-map").attr("id", "map-" + package_data["number"]);

    $("body").append(package_obj);

    let map = create_map("map-" + package_data["number"], package_data["locations"][0], 0.5);

    let animations = [];
    for (let i = 1; i < package_data["locations"].length; i++)
    {
        animations.push([map, package_data["locations"][i - 1], package_data["locations"][i]])
    }

    let package = new Pckg(map, package_obj, animations);
    packages.push(package);

    map.on("load", function ()
    {
        package.animate(1);
    });
}

function get_package(package_number)
{
    $.post(server_ip + "/get_package", JSON.stringify({"package_number": package_number}), function (response)
    {
        console.log(response["data"]);
        if (response["status"])
            create_package(response["data"]);
    });
    console.log(server_ip + "/get_package")
}

get_package("UN879927127CN");