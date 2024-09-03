// Function to open and close the side navigation
function toggleNav() {
  const sidenav = document.getElementById("mySidenav");
  const main = document.getElementById("main");
  const isOpen = sidenav.style.width === "250px";

  // Toggle the side navigation width and main content margin
  sidenav.style.width = isOpen ? "0" : "250px";
  main.style.marginLeft = isOpen ? "0" : "250px";
}

// Function to close the side navigation
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}

// Add event listener to close side navigation when clicking outside
document.addEventListener("click", function(event) {
  // Check if click is outside the side navigation and menu icon
  if (!event.target.closest("#mySidenav") && !event.target.closest(".menu-icon")) {
    closeNav();
  }
});
