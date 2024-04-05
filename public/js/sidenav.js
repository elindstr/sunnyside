document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for opening the side navigation
    document.getElementById("openNav").addEventListener("click", function() {
        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("main").style.marginLeft = "250px";
    });

    // Add event listener for closing the side navigation
    document.getElementById("closeNav").addEventListener("click", function() {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("main").style.marginLeft = "0";
    });

    // jQuery code
    // Function to open the side navigation
    function openNav() {
        $("#mySidenav").css("width", "250px");
    }
    
    // Function to close the side navigation
    function closeNav() {
        $("#mySidenav").css("width", "0");
    }
    
    // Event listener to open the side navigation when the button is clicked
    $("#openNav").click(function() {
        openNav();
    });
    
    // Event listener to close the side navigation when clicking outside of it
    $(document).click(function(event) {
        // Check if the clicked element is not within the sidenav or its toggle button
        if (!$(event.target).closest('#mySidenav').length && !$(event.target).is('#openNav')) {
            closeNav();
        }
    });
});
