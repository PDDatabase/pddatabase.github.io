async function updateVersion() {
    const versionUrl = "/version.txt"; // URL of the version file

    try {
        const response = await fetch(versionUrl);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const version = await response.text();
        const versionElement = document.querySelector('.version'); // Select the version element
        versionElement.textContent = `Version ${version.trim()}`; // Update the text
    } catch (error) {
        console.error("Error fetching version:", error);
    }
}

// Call the function to update the version when the document is loaded
document.addEventListener('DOMContentLoaded', updateVersion);

// Call the function to update the version when the document is loaded
document.addEventListener('DOMContentLoaded', updateVersion);

function adjustBottomBar() {
    const bottomBar = document.querySelector('.bottom-bar');
    const bottomLeft = document.querySelector('.bottom-left');
    
    if (window.innerHeight > window.innerWidth) {
        // If height is greater than width, show only copyright
        bottomLeft.style.display = 'block'; // Show copyright notice
        bottomBar.querySelector('.bottom-center').style.display = 'none'; // Hide version and hosting info
        bottomBar.querySelector('.bottom-right').style.display = 'none'; // Hide links
    } else {
        // On wider screens, show everything
        bottomLeft.style.display = 'block'; // Show copyright notice
        bottomBar.querySelector('.bottom-center').style.display = 'block'; // Show version and hosting info
        bottomBar.querySelector('.bottom-right').style.display = 'block'; // Show links
    }
}

// Call the function on load and when resizing the window
window.addEventListener('load', adjustBottomBar);
window.addEventListener('resize', adjustBottomBar);