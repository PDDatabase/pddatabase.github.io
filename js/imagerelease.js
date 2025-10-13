async function fetchReleaseImages(releaseNumber, offset = 0) {
    const folderUrl = `https://api.github.com/repos/PDDatabase/PDImages/contents/${releaseNumber}`; 
    try {
        const response = await fetch(folderUrl);
        const files = await response.json();
        const imageFiles = files.filter(file => file.type === 'file' && 
            file.name !== 'data.txt' && 
            !file.name.toLowerCase().endsWith('.raw') && 
            !file.name.toLowerCase().endsWith('.arw'));

        const grid = document.getElementById("image-grid");

        // Calculate how many images to load
        const imagesToLoad = imageFiles.slice(offset, offset + 6);
        
        const rawFiles = files.filter(file => file.type === 'file' && 
            (file.name.toLowerCase().endsWith('.raw') || file.name.toLowerCase().endsWith('.arw')))
            .reduce((acc, file) => {
                const name = file.name.split('.')[0]; // Get the base name
                acc[name] = file.download_url; // Map base name to download URL
                return acc;
            }, {});


        for (const file of imagesToLoad) {
            const item = document.createElement("div");
            item.className = "image-item";

            const img = document.createElement("img");
            img.src = file.download_url; // URL to the image
            img.alt = file.name; // Alt text for the image

            const rawFileName = file.name.split('.')[0]; // Get the base name
            if (rawFiles[rawFileName]) {
                const rawButton = document.createElement("button");
                rawButton.className = "raw-button";
                rawButton.style.fontWeight = 'bold'; // Make text bold
                rawButton.textContent = "RAW"; // Set button text
                rawButton.onclick = (event) => {
                    event.stopPropagation(); // Prevent the image click event
                    window.open(rawFiles[rawFileName], '_blank'); // Open RAW download URL
                };
                item.appendChild(rawButton); // Add the RAW button above the download button
            }

            const button = document.createElement("button");
            button.className = "download-button";
            button.title = "Download Image";
            button.innerHTML = "⬇"; // Download icon
            button.onclick = (event) => {
                event.stopPropagation(); // Prevent the image click event
                window.open(file.download_url, '_blank'); // Open download URL in a new tab
            };

            item.onclick = () => {
                //window.location.href = `/images/image?i=${file.name}`; // Redirect to image view
            };

            item.appendChild(img);
            item.appendChild(button);
            grid.appendChild(item);
        }


        // Update button visibility
        const loadMoreButton = document.getElementById("load-more-button");
        if (offset + 6 >= imageFiles.length) {
            loadMoreButton.style.display = 'none'; // Hide if no more images
        } else {
            loadMoreButton.style.display = 'block'; // Show if more images to load
        }

    } catch (error) {
        console.error("Error fetching images:", error);
    }
} 

// Get release number from the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const releaseNumber = urlParams.get('n');

document.addEventListener('DOMContentLoaded', () => {
    const releaseTitle = document.getElementById("release-title");
    releaseTitle.textContent += releaseNumber; // Set the title with the release number
    
    // Load initial images
    fetchReleaseImages(releaseNumber);

    // Load more images functionality
    let offset = 6; // Start loading from the 7th image
    document.getElementById("load-more-button").onclick = () => {
        fetchReleaseImages(releaseNumber, offset);
        offset += 6; // Update the offset for the next load
    };
});

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