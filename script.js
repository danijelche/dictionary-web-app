const dropdownButton = document.querySelector('.dropdown-button');
const dropdownContent = document.querySelector('.dropdown-content');
const dropdownOptions = document.querySelectorAll('.dropdown-option');
const selectWrapper = document.querySelector('.select-wrapper');
const darkModeToggle = document.getElementById('dark-mode-checkbox');
const searchInput = document.getElementById('search-input');


const storedDarkMode = localStorage.getItem('darkMode') === 'true';

if(storedDarkMode){
	document.body.classList.add('dark-mode');
	darkModeToggle.checked = true;
}


darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
	localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});


selectWrapper.addEventListener('click', () => {
    selectWrapper.classList.toggle('open');
});

dropdownOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents re-opening of the dropdown
        const selectedFont = option.dataset.font;
        document.documentElement.style.fontFamily = selectedFont;
        dropdownButton.textContent = option.textContent;
        selectWrapper.classList.remove('open');
    });
});

document.addEventListener('click', (e) => {
    if (!selectWrapper.contains(e.target)) {
        selectWrapper.classList.remove('open');
    }
});

let apiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";


async function getWord() {
    try {
        let finalUrl = apiUrl + searchInput.value.trim();
        const response = await fetch(finalUrl);

        if (!response.ok) {
            throw new Error('Word not found');
        }

        const data = await response.json();
        const word = data[0];
		console.log(word);
        const wordName = word.word;
       const wordPhonetic = word.phonetic || (word.phonetics && word.phonetics.length > 0 ? word.phonetics[1].text : ' ');
	   const audioUrl = word.phonetics && word.phonetics.length > 0 ? word.phonetics[0].audio : 'N/A';


       
        let sectionsHTML = '';

        
        word.meanings.forEach(meaning => {
            const partOfSpeech = meaning.partOfSpeech;
            
            
            let sectionContent = meaning.definitions.map(def => {
                const definition = `<li>${def.definition}</li>`;
                const example = def.example ? `<p class="example">"${def.example}"</p>` : '';
                return `${definition} ${example}`;
            }).join('');

            // Gather synonyms
            let synonyms = meaning.synonyms.length ? meaning.synonyms.join(', ') : '';
			let synonymsSection = synonyms ? `
				<div class="synonyms">
					<p>Synonyms</p>
					<p>${synonyms}</p>
				</div>` : '';

            
			
            sectionsHTML += `
               <section class="word-section ${partOfSpeech}-section">
			   <div class="section-title-container">
     <div class="section-title">${partOfSpeech}</span></div>
		<span class="line">
		</div>
        <p class="section-description">Meaning</p>
        <ul class="meaning-list ${partOfSpeech}-meaning">${sectionContent}</ul>
        
        ${synonymsSection} 
    </section>
            `;
        });

        
		const sourceUrl = word.sourceUrls ? word.sourceUrls[0] : '#';
        const wordResultsHTML = `
            <div class="searched-word">
                <div class="word">
                    <h1 class="word-name">${wordName}</h1>
                    <h3 class="word-phonetic">${wordPhonetic}</h3>
                </div>
                <img class="play-icon" src="./assets/icon-play.svg" alt="Play pronunciation">
            </div>
            ${sectionsHTML} 
            <div class="source">
                <p>Source</p>
                <a href="${sourceUrl}" target="_blank">${sourceUrl}</a>
				<img src="./assets/icon-new-window.svg" alt="New window icon" />
            </div>
        `;
        
       
        document.querySelector('.word-results').innerHTML = wordResultsHTML;
		
		
		const playIcon = document.querySelector('.play-icon');
		if(audioUrl){
			playIcon.addEventListener('click', ()=>{
				const audio = new Audio(audioUrl);
				audio.play();
			})
		}else {
			 console.log('Audio not available for this word');
		}

    } catch (error) {
        console.error("Error fetching word:", error);
       
        document.querySelector('.word-results').innerHTML = `<p class="error-message">Word not found. Please try another search.</p>`;
    }
}


searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWord();
		searchInput.value = '';
    }
});

