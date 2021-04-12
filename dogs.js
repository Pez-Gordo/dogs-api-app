const baseUrl = "https://api.thedogapi.com/v1"

const fetchDoggoBreeds = async () => {
    
    const response = await fetch(baseUrl + "/breeds")
    const dogBreeds = await response.json()
    populateDogSelect(dogBreeds)
    console.log(dogBreeds)
}

const populateDogSelect = (breeds) => {
    const select = document.querySelector(".breed-select")
    //console.log(breeds)
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
    descriptionValue.textContent = value
    const parentElement = document.querySelector('#doggo-description')
    parentElement.appendChild(descriptionTerm)
    parentElement.appendChild(descriptionValue)

}

const clearDoggoDescription = () => {
    const descriptionElement = document.querySelector("#doggo-description")

    while(descriptionElement.firstChild) {
        descriptionElement.removeChild(descriptionElement.firstChild)
    }
}

const fillDoggoDescription = ({bred_for: bredFor, breed_group: breedGroup, name, temperament, life_span: lifeSpan, origin, height, weight}) => {
    
    clearDoggoDescription()

    createDescriptionEntry({
        label: "Name",
        value: name
    })

    createDescriptionEntry({
        label: "Bred for",
        value: bredFor
    })

    createDescriptionEntry({
        label: "Breed group",
        value: breedGroup
    })

    createDescriptionEntry({
        label: "Temperament",
        value: temperament
    })

    createDescriptionEntry({
        label: "Life span",
        value: lifeSpan
    })
    if(origin){
        createDescriptionEntry({
            label: "Origin",
            value: origin
        })
    }
    createDescriptionEntry({
        label: "Height (cm)",
        value: height.metric
        
    })
    createDescriptionEntry({
        label: "Weight (Kg)",
        value: weight.metric
    })
}

const getDogByBreed = async (breedId) => {
    const loadingElement = document.querySelector('.loading')
    loadingElement.classList.add('show-loading')
    const [data] = await fetch(baseUrl + "/images/search?include_breed=1&breed_id=" + breedId).then((data) => data.json())
    const {url: imageUrl, breeds} = data
    fillDoggoImage(imageUrl)
    fillDoggoDescription(breeds[0])
    loadingElement.classList.remove("show-loading")
}

const changeDoggo = () => {

    console.log(event.target.value)
    getDogByBreed(event.target.value)
}

fetchDoggoBreeds() 


// 10.00 I havd a big laugh because I was having problems getting the correct id from the select