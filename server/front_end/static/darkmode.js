let x = $(".slider");
let isDarkMode = false;
x.on("click", function (e) {
    if (!isDarkMode){
        $("body").addClass("dark");
        $("body").removeClass("light");
    }
    else
    {
        $("body").removeClass("dark");
        $("body").addClass("light");
    }
    isDarkMode = !isDarkMode;
})
