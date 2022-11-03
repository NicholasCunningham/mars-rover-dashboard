let store = {
    currentRover: Immutable.List([]),
    roverInfo: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    user: { name: 'Nick' },
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = async (store, newState) => {
    // Since currentRover is an ImmutableJS List, it has to be handled separately
    // from the Object.assign() call below
    if ('currentRover' in newState) {
        store.currentRover = (newState.currentRover == "")
            ? store.currentRover = store.currentRover.clear()
            : store.currentRover = store.currentRover.set(0, newState.currentRover)
        delete newState.currentRover
    }

    store = Object.assign(store, newState)    
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (store) => {
    return `
        <header><h1>NASA Mars Rover Dashboard</h1></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                ${RoverInfo(store)}
            </section>
        </main>
        <footer>
            Page created by Nicholas Cunningham
            for Udacity Intermediate JavaScript Course
        </footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

const Greeting = (name) => {
    return (name ? `<h1>Welcome, ${name}!</h1>` : `<h1>Hello!</h1>`)
}

const RoverInfo = (store) => {    
    let { currentRover, roverInfo } = store

    // Create rover buttons on initial page load so we can select a rover
    if (!currentRover || currentRover.size < 1) {
        return `
            <p><b>Please choose a rover to learn about:</b></p>
            ${createAllRoverButtons(createRoverButton)}
        `
    } 

    // Once a rover is selected, call the API to get the latest photos
    if (currentRover && !roverInfo) {
        getRoverInfo()
        return ''
    }

    return `${buildPage(buildSuccessPage)}`
}


// ---------------------------------------------------------------  HELPERS
// PROJECT REQUIREMENT
// Higher order function with another function as a parameter
const createAllRoverButtons = (cardCreator) => {
    // PROJECT REQUIREMENT
    // Use map function
    return `${store.rovers.map(rover => cardCreator(rover)).join(' ')}`
}

const createRoverButton = (rover) => {
    return `<button type="button" onClick="setTimeout(updateStore, 100, store, {currentRover: '${rover}'})">${rover}</button>`
}

const createPhotoCard = (imageURL) => {    
    return `<img src="${imageURL}">`
}

const createRoverInfoBlock = () => {
    const { earth_date, rover } = store.roverInfo.image.latest_photos[0]
    const { launch_date, landing_date, status } = rover

    return (`
        <ul>
            <li>Launch date: <b>${launch_date}</b></li>
            <li>Landing date: <b>${landing_date}</b></li>
            <li>Status: <b>${status}</b></li>
            <li>Most recent photo date: <b>${earth_date}</b></li>
        </ul>
    `)
}

const createButtonBlock = (numPhotos) => {
    buttonBlock = (`
        <button
            type="button"
            onClick="setTimeout(updateStore, 100, store, {currentRover: '', roverInfo: ''})"
        > 
            Choose a new rover 
        </button>
    `)
    if (numPhotos > 1) {
        buttonBlock += (`
            <button
                type="button"
                onClick="setTimeout(render, 100, root, store)"
            >
                Randomize Photo
            </button>
        `)
    }

    return buttonBlock
}

// ---------------------------------------------------------------  PAGE BUILDERS
// PROJECT REQUIREMENT
// Higher order function #2
const buildPage = (pageBuilder) => {
    return (
        `
            <h3 class='card-title'>Current Rover: ${store.currentRover.get(0)}</h2>
            ${pageBuilder()}
        `
    )
}

const buildSuccessPage = () => {
    const { latest_photos } = store.roverInfo.image
    const numPhotos = latest_photos.length
    let randomPhotoIndex = Math.floor(Math.random() * numPhotos)

    return (
        `
            <div class='row'>
                <div class='col'>
                    ${createRoverInfoBlock()}
                    ${createButtonBlock(numPhotos)}
                </div>
                <div class='col'>
                    ${createPhotoCard(latest_photos[randomPhotoIndex].img_src)}
                </div>
            </div>
        `
    )
}

// ---------------------------------------------------------------  API CALL
const getRoverInfo = () => {    
    let { currentRover } = store

    fetch(`http://localhost:3000/${currentRover.get(0)}`)
        .then(res => res.json())
        .then(roverInfo => updateStore(store, { roverInfo }))
}
