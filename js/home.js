async function fetchFolderData() {
    const repoUrl = "https://api.github.com/repos/PDDatabase/PDImages/contents"; // GitHub API endpoint
    let totalAssets = 0;
    let totalImages = 0;
    let totalReleases = 0; // To count the releases

    try {
        const response = await fetch(repoUrl);
        const folders = await response.json();

        for (const folder of folders) {
            if (folder.type === 'dir') { // Only consider directories
                const folderContents = await fetch(folder.url).then(res => res.json());
                const imageFiles = folderContents.filter(file => file.type === 'file' && file.name !== 'data.txt'); // Exclude data.txt
                totalImages += imageFiles.length; // Count images
                totalAssets += imageFiles.length;
                totalReleases++; // Increment release count for each folder
            }
        }
    } catch (error) {
        console.error("Error fetching data from GitHub:", error);
    }

    return { totalAssets, totalImages, totalReleases };
}

async function updateStats() {
    const stats = await fetchFolderData();
    const assetsElement = document.querySelector('.text-line.one');
    const imagesElement = document.querySelector('.text-line.two');

    // Update text content
    assetsElement.textContent = `${stats.totalAssets} Total Public Domain Assets (${stats.totalReleases})`; // Total assets line
    imagesElement.innerHTML = `<a href="/images" style="color: inherit; text-decoration: none;">${stats.totalImages} Total Public Domain Images (${stats.totalReleases})</a>`; // Make releases clickable

    // Set colors
    const greenColor = "lightgreen"; // Light green for assets
    const originalColor = "#f8f8f2"; // Original off-white color

    assetsElement.style.color = stats.totalAssets > 0 ? greenColor : "lightgray"; // Light green or grayed out
    imagesElement.style.color = stats.totalImages > 0 ? "#add8e6" : "lightgray"; // Slight blue or grayed out
}

// Start the update process after the document is completely loaded
document.addEventListener('DOMContentLoaded', updateStats);

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