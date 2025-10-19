async function fetchReleases() {
    const repoUrl = "https://api.github.com/repos/PDDatabase/PDImages/contents"; // GitHub API endpoint
    try {
        const response = await fetch(repoUrl);
        if (response.status != 200) {
            document.getElementById("giterror").classList.remove("hidden");
        }
        const folders = await response.json();
        const releasesListElement = document.getElementById("releases-list");
        releasesListElement.innerHTML = ""; // Clear any existing content

        // Process folders to create releases
        const releases = folders
            .filter(folder => folder.type === 'dir') // Only consider directories
            .map(folder => ({
                name: folder.name, // e.g., "1", "2", ...
                date: new Date(folder.created_at).toLocaleDateString("en-US"), // This needs to be fetched separately
                url: folder.url // URL to get folder contents
            }));

        for (const release of releases) {
            // Fetch the images in the current release folder
            const folderContentsResponse = await fetch(release.url);
            if (folderContentsResponse.status != 200) {
                document.getElementById("giterror").classList.remove("hidden");
            }
            const folderContents = await folderContentsResponse.json();
            
            // Get the date from data.txt file
            const dataFile = folderContents.find(file => file.name === 'data.txt');
            
            let date = "Unknown Date"; // Default date in case data.txt is not found
            let thum = "/assets/cc/pd.xlarge.png";
            if (dataFile) {
                const dataResponse = await fetch(dataFile.download_url);
                if (dataResponse.status != 200) {
                    document.getElementById("giterror").classList.remove("hidden");
                }
                const dataText = await dataResponse.text();
                const dateLine = dataText.split('\n')[0]; // Get the first line
                date = dateLine.replace('datetaken: ', '').trim(); // Remove "datetaken: " and trim spaces
                const thumLine = dataText.split('\n')[1]; // Get the first line
                const thumName = thumLine.replace('thum: ', '').trim(); // Remove "datetaken: " and trim spaces
                const thumFile = folderContents.find(file => file.name === thumName);
                thum = thumFile.download_url;
            }

            
            const imageCount = folderContents.filter(file => file.type === 'file' && 
                file.name !== 'data.txt' && 
                !file.name.toLowerCase().endsWith('.raw') && 
                !file.name.toLowerCase().endsWith('.arw')).length; // Exclude data.txt, .RAW, and .ARW files
            
            const rawCount = folderContents.filter(file => file.type === 'file' && 
                file.name !== 'data.txt' && (
                file.name.toLowerCase().endsWith('.raw') || 
                file.name.toLowerCase().endsWith('.arw'))).length; // Exclude data.txt, .RAW, and .ARW files
            
            // Update the release object with the image count and date
            release.imageCount = imageCount;
            release.rawCount = rawCount;
            release.date = date; // Set the date from data.txt
            release.thum = thum;
        }


        // Sort releases by release number (newest first)
        releases.sort((a, b) => b.name - a.name);

        for (const release of releases) {
            const item = document.createElement("div");
            item.className = "release-item";

            // Prepare HTML structure
            item.innerHTML = `
                <div class="release-img">
                    <img src="${release.thum}" alt="Release ${release.name}" />
                    <div class="release-number">#${release.name}</div>
                </div>
                <div class="release-date">${release.date}</div>
                <div class="release-info">
                    <div class="release-count">${release.imageCount} Images</div>
                    ${release.rawCount > 0 ? '<div class="includes-raw">Includes RAWs</div>' : '<div class="processed">Processed Images</div>'}
                </div>
            `;
            item.onclick = () => {
                window.location.href = `/images/release?n=${release.name}`; // Redirect on click
            };
            releasesListElement.appendChild(item);
        }
        adjustVisibility();
    } catch (error) {
        console.error("Error fetching data from GitHub:", error);
    }
}

// Start fetching releases when the document is fully loaded
document.addEventListener('DOMContentLoaded', fetchReleases);

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

function adjustVisibility() {
    const releaseDateElements = document.querySelectorAll('.release-date');
    const releaseInfoElements = document.querySelectorAll('.release-info');
    const width = window.innerWidth;

    if (width > 900) {
        releaseDateElements.forEach(element => element.classList.remove('hidden'));
        releaseInfoElements.forEach(element => element.classList.remove('hidden'));
        releaseInfoElements.forEach(element => element.classList.remove('info-offset'));
    } else if (width <= 900 && width > 620) {
        releaseDateElements.forEach(element => element.classList.add('hidden'));
        releaseInfoElements.forEach(element => element.classList.remove('hidden'));
        releaseInfoElements.forEach(element => element.classList.add('info-offset'));
    } else {
        releaseDateElements.forEach(element => element.classList.add('hidden'));
        releaseInfoElements.forEach(element => element.classList.add('hidden'));
    }
}


adjustVisibility();

// Add event listener for window resize
window.addEventListener('resize', adjustVisibility);

document.getElementById("IAWe").href = "https://web.archive.org/"+document.location.href;