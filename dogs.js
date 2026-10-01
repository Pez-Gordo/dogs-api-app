const baseUrl = "api.php"
const breedsById = new Map()

const fetchDoggoBreeds = async () => {
    try {
        const response = await fetch(baseUrl + "?action=breeds")

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const dogBreeds = await response.json()

        dogBreeds.forEach(breed => {
            breedsById.set(String(breed.id), breed)
        })

        populateDogSelect(dogBreeds)
    } catch (error) {
        console.error("Unable to load dog breeds:", error)
    }
}

const populateDogSelect = (breeds) => {
    const select = document.querySelector(".breed-select")

    const breedOptions = breeds.map(breed => {
        const option = document.createElement('option')
        option.text = breed.name
        option.value = breed.id
        return option
    })

    breedOptions.forEach(breedOption => {
        select.appendChild(breedOption)
    })
}

const fillDoggoImage = (imageUrl) => {
    document.querySelector('#doggo-image').setAttribute('src', imageUrl)
}

const createDescriptionEntry = ({label, value}) => {
    const descriptionTerm = document.createElement('dt')
    descriptionTerm.textContent = label

    const descriptionValue = document.createElement('dd')
    descriptionValue.textContent = value ?? 'Unknown'

    const parentElement = document.querySelector('#doggo-description')
    parentElement.appendChild(descriptionTerm)
    parentElement.appendChild(descriptionValue)
}

const clearDoggoDescription = () => {
    const descriptionElement = document.querySelector("#doggo-description")

    while (descriptionElement.firstChild) {
        descriptionElement.removeChild(descriptionElement.firstChild)
    }
}

const fillDoggoDescription = ({
    bred_for: bredFor,
    breed_group: breedGroup,
    name,
    temperament,
    life_span: lifeSpan,
    origin,
    height,
    weight
}) => {
    clearDoggoDescription()

    createDescriptionEntry({
        label: "Breed name",
        value: name
    })

    createDescriptionEntry({
        label: "Bred for",
        value: bredFor
    })

    if (breedGroup) {
        createDescriptionEntry({
            label: "Breed group",
            value: breedGroup
        })
    }

    createDescriptionEntry({
        label: "Temperament",
        value: temperament
    })

    createDescriptionEntry({
        label: "Life span",
        value: lifeSpan
    })

    if (origin) {
        createDescriptionEntry({
            label: "Origin",
            value: origin
        })
    }

    createDescriptionEntry({
        label: "Height (cm)",
        value: height?.metric
    })

    createDescriptionEntry({
        label: "Weight (Kg)",
        value: weight?.metric
    })
}

const getNoImageMessage = () => {
    let message = document.querySelector("#doggo-no-image")

    if (!message) {
        message = document.createElement("p")
        message.id = "doggo-no-image"
        message.textContent = "No image available for this breed."
        message.style.display = "none"

        const image = document.querySelector("#doggo-image")
        image.insertAdjacentElement("afterend", message)
    }

    return message
}

const getDogByBreed = async (breedId) => {
    if (!breedId) {
        return
    }

    const breed = breedsById.get(String(breedId))

    if (!breed) {
        console.error("Unknown dog breed:", breedId)
        return
    }

    fillDoggoDescription(breed)

    const image = document.querySelector("#doggo-image")
    const noImageMessage = getNoImageMessage()

    image.style.visibility = "hidden"
    image.removeAttribute("src")
    noImageMessage.style.display = "none"

    try {
        const response = await fetch(
            baseUrl + "?action=image&breed_id=" + encodeURIComponent(breedId)
        )

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        const dogImage = data?.[0]

        if (dogImage?.url) {
            fillDoggoImage(dogImage.url)
            image.style.visibility = "visible"
        } else {
            noImageMessage.style.display = "block"
        }
    } catch (error) {
        console.error("Unable to load dog image:", error)
        noImageMessage.style.display = "block"
    }
}

const changeDoggo = (select) => {
    getDogByBreed(select.value)
}

fetchDoggoBreeds()
