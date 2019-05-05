let x = $(".slider");
if (document.body.className.includes("dark")) {
    isDarkMode = true
}
else
{
    isDarkMode = false
}
x.on("click", function (e) {
    if (!isDarkMode){
        $("body").addClass("dark");
        $("body").removeClass("light");
        localStorage.setItem("value", "dark");
    }
    else
    {
        $("body").removeClass("dark");
        $("body").addClass("light");
        localStorage.setItem("value", "light");
    }
    isDarkMode = !isDarkMode;
})
